import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import './ProfileModal.css'

const ProfileModal = ({ onClose, initialTab = 'profile' }) => {
  const { adminProfile, updateProfile } = useSettings()
  const [form, setForm] = useState({ ...adminProfile })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordSave = () => {
    if (!pwForm.current) return setPwError('Enter current password')
    if (pwForm.newPw.length < 6) return setPwError('Password must be at least 6 characters')
    if (pwForm.newPw !== pwForm.confirm) return setPwError('Passwords do not match')
    setPwError('')
    setPwSaved(true)
    setPwForm({ current: '', newPw: '', confirm: '' })
    setTimeout(() => setPwSaved(false), 2500)
  }

  const activityLog = [
    { action: 'Logged in', time: 'Today, 10:32 AM', icon: '🔐' },
    { action: 'Updated food item: Paneer Tikka', time: 'Today, 10:15 AM', icon: '✏️' },
    { action: 'New order #1042 processed', time: 'Today, 9:58 AM', icon: '🛒' },
    { action: 'Logged in', time: 'Yesterday, 9:10 AM', icon: '🔐' },
    { action: 'Deleted food item: Veg Burger', time: 'Yesterday, 8:45 AM', icon: '🗑️' },
    { action: 'Settings updated', time: 'Yesterday, 8:30 AM', icon: '⚙️' },
  ]

  return (
    <div className='pm-overlay' onClick={onClose}>
      <div className='pm-modal' onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className='pm-header'>
          <div className='pm-avatar-big'>
            {form.name.charAt(0).toUpperCase()}
          </div>
          <div className='pm-header-info'>
            <h3>{adminProfile.name}</h3>
            <span className='pm-role-badge'>SUPER ADMIN</span>
          </div>
          <button className='pm-close-btn' onClick={onClose}>
            <svg viewBox='0 0 14 14' fill='none' stroke='currentColor'
              strokeWidth='2' strokeLinecap='round'>
              <path d='M1 1l12 12M13 1L1 13' />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className='pm-tabs'>
          {['profile', 'password', 'activity'].map(tab => (
            <button
              key={tab}
              className={`pm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profile' ? '👤 Profile' : tab === 'password' ? '🔐 Password' : '📋 Activity'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className='pm-body'>
            <div className='pm-field'>
              <label>Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder='Enter name'
              />
            </div>
            <div className='pm-field'>
              <label>Email Address</label>
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder='Enter email'
                type='email'
              />
            </div>
            <div className='pm-field'>
              <label>Phone Number</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder='+91 XXXXX XXXXX'
              />
            </div>
            <div className='pm-field'>
              <label>Role</label>
              <input value={form.role} disabled className='pm-disabled' />
            </div>
            <div className='pm-field'>
              <label>Member Since</label>
              <input value={form.joinDate} disabled className='pm-disabled' />
            </div>
            <div className='pm-footer'>
              {saved && <span className='pm-success'>✅ Profile saved!</span>}
              <button className='pm-cancel' onClick={onClose}>Cancel</button>
              <button className='pm-save' onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className='pm-body'>
            <div className='pm-field'>
              <label>Current Password</label>
              <input
                type='password'
                value={pwForm.current}
                onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                placeholder='Enter current password'
              />
            </div>
            <div className='pm-field'>
              <label>New Password</label>
              <input
                type='password'
                value={pwForm.newPw}
                onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                placeholder='Minimum 6 characters'
              />
            </div>
            <div className='pm-field'>
              <label>Confirm New Password</label>
              <input
                type='password'
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder='Repeat new password'
              />
            </div>
            {pwError && <p className='pm-error'>⚠️ {pwError}</p>}
            {pwSaved && <p className='pm-success'>✅ Password updated successfully!</p>}
            <div className='pm-footer'>
              <button className='pm-cancel' onClick={onClose}>Cancel</button>
              <button className='pm-save' onClick={handlePasswordSave}>Update Password</button>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className='pm-body'>
            <div className='pm-activity-list'>
              {activityLog.map((item, i) => (
                <div key={i} className='pm-activity-item'>
                  <div className='pm-activity-icon'>{item.icon}</div>
                  <div className='pm-activity-text'>
                    <p>{item.action}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileModal