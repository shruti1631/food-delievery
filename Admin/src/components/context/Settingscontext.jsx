import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext()

export const useSettings = () => useContext(SettingsContext)

const defaultSettings = {
  darkMode: false,
  compactView: true,
  emailAlerts: true,
  pushNotifications: false,
  smsAlerts: false,
  language: 'English (EN)',
  timezone: 'IST (UTC+5:30)',
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}