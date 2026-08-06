import { useState } from 'react'
import './AdminLogin.css'
import { toast } from 'react-toastify'

const AdminLogin = ({ url, onLogin }) => {
  const [data, setData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
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
    <div className='admin-login-page'>
      <div className='admin-login-box'>
        <div className='admin-login-header'>
          <h2>🍽️ ZestyBite</h2>
          <p>Admin Panel Login</p>
        </div>

        <form onSubmit={onSubmit} className='admin-login-form'>
          <div className='login-group'>
            <label>Email</label>
            <input
              name='email'
              type='email'
              value={data.email}
              onChange={onChangeHandler}
              placeholder='admin@email.com'
              required
            />
          </div>

          <div className='login-group'>
            <label>Password</label>
            <input
              name='password'
              type='password'
              value={data.password}
              onChange={onChangeHandler}
              placeholder='Enter password'
              required
            />
          </div>

          <button type='submit' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin