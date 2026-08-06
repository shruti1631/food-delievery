import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { toast } from 'react-toastify'
import './SettingsPanel.css'

const Toggle = ({ value, onChange }) => (
  <div
    className={`sp-toggle ${value ? 'on' : ''}`}
    onClick={() => onChange(!value)}
  />
)

const SettingsPanel = ({ onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings()

  const [langOpen, setLangOpen] = useState(false)
  const [tzOpen, setTzOpen] = useState(false)
  const [msg, setMsg] = useState('')

  const languages = ['English (EN)', 'Hindi (HI)', 'Tamil (TA)']
  const timezones = ['IST (UTC+5:30)', 'UTC (UTC+0)', 'EST (UTC-5)']

  // 🔥 TOGGLE HANDLER (NEW)
  const handleToggle = (key, value) => {
    updateSettings(key, value)

    if (value) {
      toast.success(`${key} Enabled`)
    } else {
      toast.error(`${key} Disabled`)
    }
  }

  // 🔥 EXPORT
  const exportCSV = () => {
    const csv = Object.entries(settings).map(e => e.join(',')).join('\n')
    const blob = new Blob([csv])
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'settings.csv'
    a.click()

    setMsg('Exported!')
    toast.success('Settings Exported')

    setTimeout(() => setMsg(''), 2000)
  }

  // 🔥 RESET
  const handleReset = () => {
    if (window.confirm('Reset all settings?')) {
      resetSettings()
      toast.info('Settings Reset')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="sp-overlay" onClick={onClose}></div>

      <div className="sp-panel">
        {/* HEADER */}
        <div className="sp-header">
          <h3>⚙ Settings</h3>
          <button className="sp-close" onClick={onClose}>✖</button>
        </div>

        {/* APPEARANCE */}
        <div className="sp-card">
          <h4>Appearance</h4>

          <div className="sp-row">
            <span>Dark Mode</span>
            <Toggle value={settings.darkMode} onChange={(v)=>handleToggle('darkMode',v)} />
          </div>

          <div className="sp-row">
            <span>Compact View</span>
            <Toggle value={settings.compactView} onChange={(v)=>handleToggle('compactView',v)} />
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="sp-card">
          <h4>Notifications</h4>

          <div className="sp-row">
            <span>Email Alerts</span>
            <Toggle value={settings.emailAlerts} onChange={(v)=>handleToggle('emailAlerts',v)} />
          </div>

          <div className="sp-row">
            <span>Push Notifications</span>
            <Toggle value={settings.pushNotifications} onChange={(v)=>handleToggle('pushNotifications',v)} />
          </div>

          <div className="sp-row">
            <span>SMS Alerts</span>
            <Toggle value={settings.smsAlerts} onChange={(v)=>handleToggle('smsAlerts',v)} />
          </div>
        </div>

        {/* SYSTEM */}
        <div className="sp-card">
          <h4>System</h4>

          {/* LANGUAGE */}
          <div className="sp-row">
            <span>Language</span>
            <div className="sp-select">
              <button onClick={()=>{setLangOpen(!langOpen); setTzOpen(false)}}>
                {settings.language}
              </button>

              {langOpen && (
                <div className="sp-dropdown">
                  {languages.map(l=>(
                    <div key={l} onClick={()=>{
                      updateSettings('language', l)
                      toast.success(`Language: ${l}`)
                      setLangOpen(false)
                    }}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TIMEZONE */}
          <div className="sp-row">
            <span>Timezone</span>
            <div className="sp-select">
              <button onClick={()=>{setTzOpen(!tzOpen); setLangOpen(false)}}>
                {settings.timezone}
              </button>

              {tzOpen && (
                <div className="sp-dropdown">
                  {timezones.map(t=>(
                    <div key={t} onClick={()=>{
                      updateSettings('timezone', t)
                      toast.success(`Timezone: ${t}`)
                      setTzOpen(false)
                    }}>{t}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="sp-card">
          <button className="sp-btn primary" onClick={exportCSV}>
            Export Settings
          </button>

          <button className="sp-btn danger" onClick={handleReset}>
            Reset
          </button>

          <p className="sp-msg">{msg}</p>
        </div>
      </div>
    </>
  )
}

export default SettingsPanel