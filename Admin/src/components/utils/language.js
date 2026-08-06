export const translate = (lang, text) => {
  const dict = {
    'Hindi (HI)': {
      Dashboard: 'डैशबोर्ड',
      Orders: 'ऑर्डर'
    }
  }

  return dict[lang]?.[text] || text
}