import { useState } from 'react'
import './LogoutModal.css'

const LogoutModal = ({ onCancel, onConfirm }) => {
  const [loading, setLoading] = useState(false)

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => onConfirm(), 700)
  }

  return (
    <div className='lm-overlay' onClick={onCancel}>
      <div className='lm-modal' onClick={e => e.stopPropagation()}>
        <div className='lm-icon'>
          <svg viewBox='0 0 24 24' fill='none' stroke='#ff6b35'
            strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' />
            <polyline points='16 17 21 12 16 7' />
            <line x1='21' y1='12' x2='9' y2='12' />
          </svg>
        </div>
        <h3>Logging out?</h3>
        <p>You'll be redirected to the login page. Any unsaved changes will be lost.</p>
        <div className='lm-btns'>
          <button className='lm-cancel' onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className='lm-confirm' onClick={handleConfirm} disabled={loading}>
            {loading ? 'Please wait...' : 'Yes, Logout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal