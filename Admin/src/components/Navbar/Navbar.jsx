import { useState, useRef, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useSettings } from '../../context/SettingsContext'
import { useNotifications } from '../../context/NotificationContext'
import SettingsPanel from '../SettingsPanel/SettingsPanel'
import NotificationPanel from '../Notificationpanel/Notificationpanel'
import ProfileModal from '../ProfileModal/Profilemodal'
import LogoutModal from '../LogoutModal/LogoutModal'
import './Navbar.css'

const Navbar = ({ onNavigate }) => {
  const { adminProfile } = useSettings()
  const { unreadCount } = useNotifications()

  const [activePanel, setActivePanel] = useState(null) // 'settings' | 'notifications' | null
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false)
  const avatarRef = useRef(null)
  const prevUnreadRef = useRef(unreadCount)

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && activePanel !== 'notifications') {
      setActivePanel('notifications')
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount, activePanel])

  const togglePanel = (name) => {
    setActivePanel(prev => prev === name ? null : name)
    setShowAvatarDropdown(false)
  }

  const handleLogoutConfirm = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminSettings')
    sessionStorage.clear()
    window.location.href = '/login'
  }

  return (
    <>
      <div className='nb'>
        {/* Brand */}
        <div className='nb-brand'>
          <div className='nb-logo-box'>
            <img src={assets.logo} alt='ZestyBite' className='nb-logo-img' />
          </div>
          <div className='nb-brand-text'>
            <h2>ZestyBite</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        {/* Actions */}
        <div className='nb-actions'>

          {/* Notification Bell */}
          <button
            className={`nb-icon-btn ${activePanel === 'notifications' ? 'active' : ''}`}
            title='Notifications'
            onClick={() => togglePanel('notifications')}
          >
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
              strokeLinecap='round' strokeLinejoin='round'>
              <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 01-3.46 0' />
            </svg>
            {unreadCount > 0 && (
              <span className='nb-badge'>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Settings */}
          <button
            className={`nb-icon-btn ${activePanel === 'settings' ? 'active' : ''}`}
            title='Settings'
            onClick={() => togglePanel('settings')}
          >
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
              strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='3' />
              <path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' />
            </svg>
          </button>

          <div className='nb-divider' />

          {/* Super Admin Avatar with Dropdown */}
          <div
            className='nb-avatar-outer'
            ref={avatarRef}
            onMouseEnter={() => setShowAvatarDropdown(true)}
          >
            <div
              className={`nb-avatar-wrap ${showAvatarDropdown ? 'open' : ''}`}
              onClick={() => setShowAvatarDropdown(prev => !prev)}
            >
              <div className='nb-avatar-circle'>
                {adminProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className='nb-avatar-info'>
                <div className='nb-name'>{adminProfile.name}</div>
                <div className='nb-role'>Super Admin</div>
                <span className='nb-super-badge'>SUPER ADMIN</span>
              </div>
              <svg className='nb-chev' viewBox='0 0 12 12' fill='none'
                stroke='#bbb' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M2 4l4 4 4-4' />
              </svg>
            </div>

            {/* Avatar Dropdown */}
            {showAvatarDropdown && (
              <div className='nb-avatar-dropdown'>
                <div className='nb-dd-header'>
                  <div className='nb-dd-avatar'>{adminProfile.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className='nb-dd-name'>{adminProfile.name}</div>
                    <div className='nb-dd-email'>{adminProfile.email}</div>
                  </div>
                </div>
                <div className='nb-dd-divider' />
                <button className='nb-dd-item' onClick={() => { setShowProfileModal(true); setShowAvatarDropdown(false) }}>
                  <span>👤</span> Edit Profile
                </button>
                <button className='nb-dd-item' onClick={() => { setShowPasswordModal(true); setShowAvatarDropdown(false) }}>
                  <span>🔐</span> Change Password
                </button>
                <button className='nb-dd-item' onClick={() => { setShowActivityModal(true); setShowAvatarDropdown(false) }}>
                  <span>📋</span> Activity Log
                </button>
                <div className='nb-dd-divider' />
                <button className='nb-dd-item danger' onClick={() => { setShowLogout(true); setShowAvatarDropdown(false) }}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            className='nb-logout-btn'
            onClick={() => { setShowLogout(true); setActivePanel(null); setShowAvatarDropdown(false) }}
          >
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'
              strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' />
              <polyline points='16 17 21 12 16 7' />
              <line x1='21' y1='12' x2='9' y2='12' />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Side Panels */}
      {activePanel && (
        <div className='nb-overlay' onClick={() => setActivePanel(null)}>
          <div onClick={e => e.stopPropagation()}>
            {activePanel === 'settings' && (
              <SettingsPanel
                onClose={() => setActivePanel(null)}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenPassword={() => setShowPasswordModal(true)}
                onOpenActivity={() => setShowActivityModal(true)}
              />
            )}
            {activePanel === 'notifications' && (
              <NotificationPanel
                onClose={() => setActivePanel(null)}
                onNotificationClick={(target) => {
                  setActivePanel(null)
                  if (typeof onNavigate === 'function') onNavigate(target)
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Profile Modal (handles profile + password + activity via tabs) */}
      {(showProfileModal || showPasswordModal || showActivityModal) && (
        <ProfileModal
          initialTab={showPasswordModal ? 'password' : showActivityModal ? 'activity' : 'profile'}
          onClose={() => { setShowProfileModal(false); setShowPasswordModal(false); setShowActivityModal(false) }}
        />
      )}

      {/* Logout Confirm */}
      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  )
}

export default Navbar