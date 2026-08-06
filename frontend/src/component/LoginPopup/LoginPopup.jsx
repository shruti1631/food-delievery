import { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Sign Up")
  const [data, setData] = useState({ name: "", email: "", password: "", phone: "", loginIdentifier: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // OTP verification state
  const [showOtp, setShowOtp] = useState(false)
  const [otpPhone, setOtpPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  const { url, setToken } = useContext(StoreContext)

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: "" }))
  }

  const validate = () => {
    const newErrors = {}

    if (currState === "Sign Up") {
      if (!data.name.trim() || data.name.trim().length < 2)
        newErrors.name = "Name must be at least 2 characters"

      const hasEmail = data.email.trim() !== ""
      const hasPhone = data.phone.trim() !== ""

      if (!hasEmail && !hasPhone) {
        newErrors.contact = "Please provide either email or phone number"
      } else {
        if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
          newErrors.email = "Please enter a valid email address"
        if (hasPhone && !/^\d{10}$/.test(data.phone))
          newErrors.phone = "Phone number must be 10 digits"
      }

      if (data.password.length < 6)
        newErrors.password = "Password must be at least 6 characters"
    } else {
      // Login: identifier can be email OR 10 digit phone
      const identifier = data.loginIdentifier.trim()
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      const isPhone = /^\d{10}$/.test(identifier)
      if (!identifier)
        newErrors.loginIdentifier = "Email or phone number is required"
      else if (!isEmail && !isPhone)
        newErrors.loginIdentifier = "Enter a valid email or 10 digit phone number"

      if (data.password.length < 6)
        newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register"

      const payload = currState === "Login"
        ? { identifier: data.loginIdentifier.trim(), password: data.password }
        : {
            name: data.name,
            password: data.password,
            ...(data.email.trim() !== "" && { email: data.email.trim() }),
            ...(data.phone.trim() !== "" && { phone: data.phone.trim() }),
          }

      const response = await fetch(`${url}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const responseData = await response.json()

      if (responseData.success) {
        if (currState === "Login") {
          setToken(responseData.token)
          localStorage.setItem("token", responseData.token)
          setShowLogin(false)
        } else if (responseData.needsOtp) {
          // Signed up with phone -> OTP sent, show OTP verification screen
          setOtpPhone(responseData.phone || data.phone)
          setShowOtp(true)
          setSuccessMsg("")
          startResendTimer()
        } else {
          // Signed up with email only -> no OTP needed, go straight to login
          setSuccessMsg("Account created! Please login.")
          setCurrState("Login")
          setData({ name: "", email: "", password: "", phone: "", loginIdentifier: "" })
        }
      } else {
        if (responseData.needsVerification) {
          setOtpPhone(responseData.phone)
          setShowOtp(true)
          setErrors({})
          startResendTimer()
        } else {
          setErrors({ api: responseData.message })
        }
      }
    } catch {
      setErrors({ api: "Something went wrong. Please try again." })
    }
    setLoading(false)
  }

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otpValue)) {
      setErrors({ otp: "Enter the 6 digit OTP" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone, otp: otpValue })
      })
      const resData = await res.json()
      if (resData.success) {
        setToken(resData.token)
        localStorage.setItem("token", resData.token)
        setShowOtp(false)
        setShowLogin(false)
      } else {
        setErrors({ otp: resData.message })
      }
    } catch {
      setErrors({ otp: "Something went wrong. Please try again." })
    }
    setLoading(false)
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone })
      })
      const resData = await res.json()
      if (resData.success) {
        setSuccessMsg("OTP resent successfully")
        startResendTimer()
      } else {
        setErrors({ otp: resData.message })
      }
    } catch {
      setErrors({ otp: "Something went wrong. Please try again." })
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail) { setErrors({ forgotEmail: "Email is required" }); return }
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      // ✅ FIX: 'data' ki jagah 'resData' - state variable se clash avoid
      const resData = await res.json()
      if (resData.success) {
        setResetToken(resData.resetToken)
        setShowReset(true)
        setShowForgot(false)
        setSuccessMsg("Token generated! Enter it below with your new password.")
      } else {
        setErrors({ forgotEmail: resData.message })
      }
    } catch {
      setErrors({ forgotEmail: "Something went wrong." })
    }
    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { setErrors({ newPassword: "Password must be at least 6 characters" }); return }
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      })
      // ✅ FIX: yahan bhi 'resData'
      const resData = await res.json()
      if (resData.success) {
        setSuccessMsg("Password reset successfully! Please login.")
        setShowReset(false)
        setCurrState("Login")
      } else {
        setErrors({ newPassword: resData.message })
      }
    } catch {
      setErrors({ newPassword: "Something went wrong." })
    }
    setLoading(false)
  }

  // OTP VERIFICATION FORM
  if (showOtp) {
    return (
      <div className='login-popup'>
        <form onSubmit={handleVerifyOtp} className="login-popup-container">
          <div className="login-popup-title">
            <h2>Verify Phone</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
          </div>
          <p className='forgot-desc'>We sent a 6 digit OTP via SMS to {otpPhone}. Enter it below.</p>
          {successMsg && <p className='success-msg'>{successMsg}</p>}
          <div className="login-popup-inputs">
            <input
              type="text" placeholder='Enter 6 digit OTP' maxLength={6}
              value={otpValue} onChange={e => { setOtpValue(e.target.value.replace(/\D/g, "")); setErrors({}) }}
              required
            />
            {errors.otp && <span className='error-msg'>{errors.otp}</span>}
          </div>
          <button type='submit' disabled={loading}>
            {loading ? "Please wait..." : "Verify OTP"}
          </button>
          <p>
            Didn't get the code?{" "}
            <span onClick={handleResendOtp} style={{ opacity: resendTimer > 0 ? 0.5 : 1, cursor: resendTimer > 0 ? "default" : "pointer" }}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </span>
          </p>
        </form>
      </div>
    )
  }

  // FORGOT PASSWORD FORM
  if (showForgot) {
    return (
      <div className='login-popup'>
        <form onSubmit={handleForgotPassword} className="login-popup-container">
          <div className="login-popup-title">
            <h2>Forgot Password</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
          </div>
          <p className='forgot-desc'>Enter your registered email. We will generate a reset token for you.</p>
          <div className="login-popup-inputs">
            <input
              type="email" placeholder='Your email address'
              value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setErrors({}) }}
              required
            />
            {errors.forgotEmail && <span className='error-msg'>{errors.forgotEmail}</span>}
          </div>
          <button type='submit' disabled={loading}>
            {loading ? "Please wait..." : "Get Reset Token"}
          </button>
          <p>Remember password? <span onClick={() => { setShowForgot(false); setCurrState("Login") }}>Login Here</span></p>
        </form>
      </div>
    )
  }

  // RESET PASSWORD FORM
  if (showReset) {
    return (
      <div className='login-popup'>
        <form onSubmit={handleResetPassword} className="login-popup-container">
          <div className="login-popup-title">
            <h2>Reset Password</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
          </div>
          {successMsg && <p className='success-msg'>{successMsg}</p>}
          <div className="login-popup-inputs">
            <input
              type="text" placeholder='Reset Token'
              value={resetToken} onChange={e => setResetToken(e.target.value)}
              required
            />
            <input
              type="password" placeholder='New Password (min 6 characters)'
              value={newPassword} onChange={e => { setNewPassword(e.target.value); setErrors({}) }}
              required
            />
            {errors.newPassword && <span className='error-msg'>{errors.newPassword}</span>}
          </div>
          <button type='submit' disabled={loading}>
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      </div>
    )
  }

  // MAIN LOGIN / SIGNUP FORM
  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">

        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>

        {successMsg && <p className='success-msg'>{successMsg}</p>}
        {errors.api && <p className='error-msg'>{errors.api}</p>}

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <>
              <input name='name' onChange={onChangeHandler} value={data.name}
                type="text" placeholder='Your full name' />
              {errors.name && <span className='error-msg'>{errors.name}</span>}
            </>
          )}

          {currState === "Sign Up" ? (
            <>
              <p className='contact-hint'>Email ya Phone number me se koi ek (ya dono) daalo</p>

              <input name='email' onChange={onChangeHandler} value={data.email}
                type="email" placeholder='Email address (optional)' />
              {errors.email && <span className='error-msg'>{errors.email}</span>}

              <input name='phone' onChange={onChangeHandler} value={data.phone}
                type="tel" placeholder='Phone number (optional, 10 digits)' />
              {errors.phone && <span className='error-msg'>{errors.phone}</span>}

              {errors.contact && <span className='error-msg'>{errors.contact}</span>}
            </>
          ) : (
            <>
              <input name='loginIdentifier' onChange={onChangeHandler} value={data.loginIdentifier}
                type="text" placeholder='Email or Phone number' />
              {errors.loginIdentifier && <span className='error-msg'>{errors.loginIdentifier}</span>}
            </>
          )}

          <input name='password' onChange={onChangeHandler} value={data.password}
            type="password" placeholder='Password (min 6 characters)' />
          {errors.password && <span className='error-msg'>{errors.password}</span>}
        </div>

        {currState === "Login" && (
          <p className='forgot-link' onClick={() => { setShowForgot(true); setErrors({}); setSuccessMsg("") }}>
            Forgot Password?
          </p>
        )}

        {/* ✅ FIX: Terms checkbox pehle, button baad mein */}
        <div className="login-popup-cond">
          <input type="checkbox" required />
          <p>By continuing, I agree to the Terms of use & privacy policy.</p>
        </div>

        <button type='submit' disabled={loading}>
          {loading ? "Please wait..." : currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {currState === "Login"
          ? <p>Do not have an account? <span onClick={() => { setCurrState("Sign Up"); setErrors({}); setSuccessMsg("") }}>Click Here</span></p>
          : <p>Already have an account? <span onClick={() => { setCurrState("Login"); setErrors({}); setSuccessMsg("") }}>Login Here</span></p>
        }

      </form>
    </div>
  )
}

export default LoginPopup