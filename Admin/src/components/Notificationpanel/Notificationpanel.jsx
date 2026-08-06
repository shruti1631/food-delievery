import { useNotifications } from '../../context/NotificationContext'
import { useState } from 'react'
import './Notificationpanel.css'

const iconMap = {
  order: '🛒',
  alert: '⚠️',
  info: 'ℹ️',
  success: '✅',
}

const NotificationPanel = ({ onClose, onNotificationClick }) => {
  const { notifications, unreadCount, markAllRead, markRead, removeNotification } = useNotifications()
  const [expandedId, setExpandedId] = useState(null)
  const expanded = expandedId ? notifications.find(n => n.id === expandedId) : null

  const handleNotificationClick = (notification) => {
    markRead(notification.id)
    setExpandedId(notification.id)
  }

  const handleDeleteNotification = (event, id) => {
    event.stopPropagation()
    removeNotification(id)
    if (expandedId === id) setExpandedId(null)
  }

  const handleGoToOrders = () => {
    if (typeof onNotificationClick === 'function') {
      onNotificationClick(expanded?.target || 'orders')
    }
  }

  return (
    <div className='np-panel'>
      <div className='np-header'>
        <div className='np-header-left'>
          <h3 className={unreadCount > 0 ? 'np-flash' : ''}>
            {expandedId ? '← Notification Details' : 'Notifications'}
          </h3>
          {unreadCount > 0 && !expandedId && <span className='np-count'>{unreadCount}</span>}
        </div>
        <div className='np-header-right'>
          {expandedId && (
            <button className='np-back' onClick={() => setExpandedId(null)}>
              ←
            </button>
          )}
          {unreadCount > 0 && !expandedId && (
            <button className='np-mark-all' onClick={markAllRead}>
              Mark all read
            </button>
          )}
          <button className='np-close' onClick={onClose}>
            <svg viewBox='0 0 14 14' fill='none' stroke='currentColor'
              strokeWidth='2' strokeLinecap='round'>
              <path d='M1 1l12 12M13 1L1 13' />
            </svg>
          </button>
        </div>
      </div>

      {expandedId && expanded ? (
        // Chat-like expanded view
        <div className='np-expanded-view'>
          <div className='np-expanded-content'>
            <div className='np-exp-icon'>{iconMap[expanded.type] || 'ℹ️'}</div>
            <div className='np-exp-title'>{expanded.title}</div>
            <div className='np-exp-message'>{expanded.message}</div>
            <div className='np-exp-time'>{expanded.time}</div>
          </div>
          <div className='np-expanded-actions'>
            {expanded.target && (
              <button className='np-action-btn np-action-go' onClick={handleGoToOrders}>
                👉 Go to {expanded.target.charAt(0).toUpperCase() + expanded.target.slice(1)}
              </button>
            )}
            <button className='np-action-btn np-action-delete' onClick={() => {
              removeNotification(expanded.id)
              setExpandedId(null)
            }}>
              Delete notification
            </button>
            <button className='np-action-btn np-action-close' onClick={() => setExpandedId(null)}>
              Close
            </button>
          </div>
        </div>
      ) : (
        // List view
        <div className='np-list'>
          {notifications.length === 0 ? (
            <div className='np-empty'>
              <span>🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`np-item ${!n.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className='np-item-icon'>{iconMap[n.type] || 'ℹ️'}</div>
                <div className='np-item-body'>
                  {n.title && <p className='np-item-title'>{n.title}</p>}
                  <p className='np-item-msg'>{n.message}</p>
                  <span className='np-item-time'>{n.time}</span>
                </div>
                {!n.read && <div className='np-dot' />}
                <button
                  className='np-item-delete'
                  onClick={(e) => handleDeleteNotification(e, n.id)}
                  title='Delete notification'
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel