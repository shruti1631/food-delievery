import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', message: 'New order #1042 received', time: '2 min ago', read: false },
    { id: 2, type: 'alert', message: 'Low stock: Paneer Tikka', time: '15 min ago', read: false },
    { id: 3, type: 'order', message: 'Order #1041 delivered', time: '1 hr ago', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const addNotification = useCallback((msg, type = 'info') => {
    setNotifications(prev => [{
      id: Date.now(),
      type,
      message: msg,
      time: 'Just now',
      read: false
    }, ...prev])
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}