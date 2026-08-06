import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #1234 has been placed',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'alert',
      title: 'Payment Failed',
      message: 'Payment for order #1233 failed',
      time: '1 hour ago',
      read: false
    }
  ])

  // Add login notification on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Admin Panel Started',
        message: '👋 Welcome back! Admin panel is ready to manage orders.',
        time: 'Just now'
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      ...notification,
      read: false
    }, ...prev])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markRead,
      markAllRead,
      removeNotification,
      addNotification,
      markAsRead: markRead,
      markAllAsRead: markAllRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
}