import { useState } from 'react'
import './AdminLogin.css'
import { toast } from 'react-toastify'

const AdminLogin = ({ url, onLogin }) => {
  const [data, setData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(null)

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // ✅ FIX: backend expects `identifier` (email OR phone), not `email`
      const res = await fetch(`${url}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.email, password: data.password })
      })
      const result = await res.json()
      if (result.success) {
        localStorage.setItem('adminToken', result.token)
        toast.success('Login successful ✅')
        onLogin()
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch {
      toast.error('Server se connect nahi ho pa raha')
    }
    setLoading(false)
  }

  return (
    <div className='al-page'>

      {/* Ambient full-page background */}
      <div className='al-bg'>
        <div className='al-blob al-blob1'></div>
        <div className='al-blob al-blob2'></div>
        <div className='al-blob al-blob3'></div>
        <div className='al-grid'></div>
        <div className='al-float al-f1'>🍕</div>
        <div className='al-float al-f2'>🍔</div>
        <div className='al-float al-f3'>🌮</div>
        <div className='al-float al-f4'>🍜</div>
        <div className='al-float al-f5'>🧆</div>
        <div className='al-float al-f6'>🥤</div>
        <div className='al-float al-f7'>🍩</div>
      </div>

      {/* Centered content */}
      <div className='al-center'>

        <div className='al-brand'>
          <div className='al-logo'>🍽️</div>
          <h1>ZestyBite</h1>
          <p>Admin Dashboard</p>
        </div>

        <div className='al-card'>
          <div className='al-card-glow'></div>

          <div className='al-card-header'>
            <h2>Welcome back</h2>
            <p>Sign in to manage your restaurant</p>
          </div>

          <form onSubmit={onSubmit} className='al-form'>

            <div className={`al-field ${focused === 'email' ? 'al-field-active' : ''}`}>
              <label>Email or Phone</label>
              <div className='al-input-wrap'>
                <span className='al-icon'>✉</span>
                <input
                  name='email'
                  type='text'
                  value={data.email}
                  onChange={onChangeHandler}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder='admin@zestybite.com'
                  required
                />
              </div>
            </div>

            <div className={`al-field ${focused === 'password' ? 'al-field-active' : ''}`}>
              <label>Password</label>
              <div className='al-input-wrap'>
                <span className='al-icon'>🔒</span>
                <input
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={onChangeHandler}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder='Enter your password'
                  required
                />
                <button
                  type='button'
                  className='al-eye'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type='submit' className='al-btn' disabled={loading}>
              <span className='al-btn-shine'></span>
              {loading ? <span className='al-spinner'></span> : <>Sign In <span className='al-arrow'>→</span></>}
            </button>

          </form>

          <div className='al-footer'>
            <span>🔐 Secured Admin Access Only</span>
          </div>

        </div>

        <p className='al-tagline'>Manage your restaurant, orders & menu — all in one place.</p>
      </div>

    </div>
  )
}

export default AdminLogin