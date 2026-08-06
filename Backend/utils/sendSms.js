// Fast2SMS OTP sender
// Docs: https://www.fast2sms.com/dev/bulkV2
// Sign up at fast2sms.com -> Dev API -> get API key (free ₹50 credit on signup for testing)

export const sendOtpSms = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // Treat missing OR placeholder value as "not configured" -> dev fallback
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_fast2sms_api_key_here")) {
    console.log(`⚠️ FAST2SMS_API_KEY not set. OTP for ${phone} is: ${otp}`);
    return { success: true, dev: true }; // dev fallback so local testing doesn't break
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: phone,
      }),
    });

    const data = await response.json();

    if (data.return === true) {
      return { success: true, data };
    } else {
      console.log("Fast2SMS error:", data);
      return { success: false, message: data.message || "Failed to send SMS" };
    }
  } catch (error) {
    console.log("Fast2SMS request failed:", error.message);
    return { success: false, message: error.message };
  }
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};