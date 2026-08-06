import { createContext, useContext, useState } from 'react'
import useApplySettings from '../components/hooks/useApplySettings'

const SettingsContext = createContext()

const defaultSettings = {
  darkMode: false,
  compactView: true,
  emailAlerts: true,
  pushNotifications: false,
  smsAlerts: false,
  language: 'English (EN)',
  timezone: 'IST (UTC+5:30)'
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@zestybite.com',
    role: 'Super Admin'
  })

  const [settings, setSettings] = useState(() => {
    const saved = window.localStorage.getItem('adminSettings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  useApplySettings(settings)

  const updateProfile = (updates) => {
    setAdminProfile(prev => ({ ...prev, ...updates }))
  }

  const updateSettings = (keyOrUpdates, value) => {
    if (typeof keyOrUpdates === 'string') {
      setSettings(prev => ({ ...prev, [keyOrUpdates]: value }))
    } else {
      setSettings(prev => ({ ...prev, ...keyOrUpdates }))
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    window.localStorage.removeItem('adminSettings')
  }

  return (
    <SettingsContext.Provider value={{
      adminProfile,
      settings,
      updateProfile,
      updateSettings,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}