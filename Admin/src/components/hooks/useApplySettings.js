import { useEffect } from 'react'

const useApplySettings = (settings) => {
  useEffect(() => {
    window.localStorage.setItem('adminSettings', JSON.stringify(settings))

    // Dark Mode
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }

    // Compact Mode
    if (settings.compactView) {
      document.documentElement.setAttribute('data-compact', 'true')
    } else {
      document.documentElement.removeAttribute('data-compact')
    }

  }, [settings])
}

export default useApplySettings