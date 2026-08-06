import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpSms, generateOtp } from "../utils/sendSms.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !password)
      return res.json({ success: false, message: "Name and password are required" });
    if (name.trim().length < 2)
      return res.json({ success: false, message: "Name must be at least 2 characters" });
    if (password.length < 6)
      return res.json({ success: false, message: "Password must be at least 6 characters" });

    const hasEmail = email && email.trim() !== "";
    const hasPhone = phone && phone.trim() !== "";

    if (!hasEmail && !hasPhone)
      return res.json({ success: false, message: "Please provide either email or phone number" });

    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.json({ success: false, message: "Please enter a valid email address" });

    if (hasPhone && !/^\d{10}$/.test(phone))
      return res.json({ success: false, message: "Phone number must be 10 digits" });

    if (hasEmail) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return res.json({ success: false, message: "Email already registered. Please login." });
    }

    if (hasPhone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone)
        return res.json({ success: false, message: "Phone number already registered." });
    }

    // If signing up with phone -> needs OTP verification
    // If signing up with email only (no phone) -> account is active immediately
    if (hasPhone) {
      const otp = generateOtp();

      const newUser = new User({
        name,
        password,
        ...(hasEmail && { email }),
        phone,
        isPhoneVerified: false,
        otp,
        otpExpiry: Date.now() + OTP_EXPIRY_MS,
      });
      await newUser.save();

      const smsResult = await sendOtpSms(phone, otp);
      if (!smsResult.success) {
        // rollback the created user if SMS totally failed (not dev fallback)
        await User.deleteOne({ _id: newUser._id });
        return res.json({ success: false, message: "Failed to send OTP. Please try again." });
      }

      return res.json({
        success: true,
        message: "OTP sent to your phone. Please verify to complete signup.",
        phone,
        needsOtp: true,
      });
    }

    // Email-only signup, no phone -> no OTP needed
    const newUser = new User({
      name,
      email,
      password,
      isPhoneVerified: true, // nothing to verify
    });
    await newUser.save();

    return res.json({
      success: true,
      message: "Account created successfully! Please login.",
      needsOtp: false,
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// SEND / RESEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone))
      return res.json({ success: false, message: "Valid 10 digit phone number required" });

    const user = await User.findOne({ phone });
    if (!user)
      return res.json({ success: false, message: "No account found with this phone number" });

    if (user.isPhoneVerified)
      return res.json({ success: false, message: "Phone already verified. Please login." });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
    await user.save();

    const smsResult = await sendOtpSms(phone, otp);
    if (!smsResult.success)
      return res.json({ success: false, message: "Failed to send OTP. Please try again." });

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.json({ success: false, message: "Phone and OTP are required" });

    const user = await User.findOne({ phone });
    if (!user)
      return res.json({ success: false, message: "No account found with this phone number" });

    if (user.isPhoneVerified)
      return res.json({ success: false, message: "Phone already verified. Please login." });

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now())
      return res.json({ success: false, message: "OTP expired. Please request a new one." });

    if (user.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, message: "Phone verified successfully", token });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.json({ success: false, message: "Email/Phone and password are required" });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone)
      return res.json({ success: false, message: "Enter a valid email or 10 digit phone number" });

    const user = isEmail
      ? await User.findOne({ email: identifier })
      : await User.findOne({ phone: identifier });

    if (!user)
      return res.json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    if (user.phone && !user.isPhoneVerified)
      return res.json({ success: false, message: "Phone not verified. Please verify OTP first.", phone: user.phone, needsVerification: true });

    // ✅ FIX: 1h → 7d
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    res.json({ success: true, message: "Reset token generated", resetToken });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.json({ success: false, message: "Token and new password are required" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.json({ success: false, message: "Invalid or expired token" });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};