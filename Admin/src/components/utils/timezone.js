export const getTimeByTimezone = (timezone) => {
  const map = {
    'IST (UTC+5:30)': 'Asia/Kolkata',
    'UTC (UTC+0)': 'UTC',
    'EST (UTC-5)': 'America/New_York'
  }

  return new Date().toLocaleString('en-US', {
    timeZone: map[timezone] || 'UTC'
  })
}