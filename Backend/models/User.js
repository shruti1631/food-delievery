import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,        
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true          
  },
  address: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  cartData: {
    type: Object,
    default: {}
  },
  // ✅ Forgot Password fields
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
  // ✅ Phone OTP verification fields
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  }
}, { 
  timestamps: true
});

// 🔥 At least one of email or phone must be provided
userSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone number is required'));
  }
  next();
});

// 🔥 Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// 🔥 Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔥 Method to get public profile (excludes sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model("User", userSchema);
export default User;