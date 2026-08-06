import { useState, useEffect } from 'react'
import './Header.css'
import { assets } from '../../assets/assets'
import OffersCard from '../OffersCard/OffersCard'

const TICKER_ITEMS = [
  'Butter Chicken 30% OFF',
  'Free Dessert on ₹399+',
  'Pizza BOGO Weekend',
  'AI Calorie Swap Live',
  'Biryani Flash Sale 40% OFF',
  'Express: 12 min delivery',
  'AI recommends just for you',
]

const Header = () => {
  const [location, setLocation] = useState('Detecting...')
  const [locLoading, setLocLoading] = useState(true)

  // Geolocation — free OpenStreetMap, no API key needed
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation('Haridwar, Uttarakhand')
      setLocLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          )
          const data = await res.json()
          const city  = data.address?.city || data.address?.town || data.address?.village || 'Your City'
          const state = data.address?.state || ''
          setLocation(`${city}${state ? ', ' + state : ''}`)
        } catch {
          setLocation('Haridwar, Uttarakhand')
        }
        setLocLoading(false)
      },
      () => { setLocation('Haridwar, Uttarakhand'); setLocLoading(false) },
      { timeout: 6000 }
    )
  }, [])

  const handleViewMenu = () => {
    const el = document.getElementById('explore-menu')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="header-wrap">

      {/* ── TOP LOCATION BAR ── */}
      <div className="loc-bar">
        <span className="lb-left">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Delivering to&nbsp;
          <strong className="lb-city">{locLoading ? '...' : location}</strong>
          {!locLoading && <span className="lb-change">Change</span>}
        </span>
        <span className="lb-right">🤖 AI-Powered &nbsp;·&nbsp; 25 min avg &nbsp;·&nbsp; Free above ₹299</span>
      </div>

      {/* ── HERO ── */}
      <div className="header">
        <img
          className="header-image"
          src={assets.header_img}
          alt="Food delivery banner"
        />
        {/* Gradient overlay */}
        <div className="header-overlay" />

        {/* ── LEFT CONTENT ── */}
        <div className="header-content">
          {/* Location pill on hero */}
          <div className="hc-loc-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Delivering to &nbsp;<strong>{locLoading ? '...' : location}</strong>
          </div>

          <h2 className="hc-line1">Order your</h2>
          <h2 className="hc-line2">favourite food here</h2>

          <p className="hc-sub">
            Choose from a diverse menu featuring delicious dishes.<br />
            Delivered fresh and fast to your doorstep.
          </p>

          {/* CTA buttons */}
          <div className="hc-ctas">
            <button className="hc-btn-primary" onClick={handleViewMenu}>
              View Menu
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Stats */}
          <div className="hc-stats">
            <div className="hc-stat"><span className="hc-snum">500+</span><span className="hc-slbl">Dishes</span></div>
            <div className="hc-sdiv" />
            <div className="hc-stat"><span className="hc-snum">4.9★</span><span className="hc-slbl">Rating</span></div>
            <div className="hc-sdiv" />
            <div className="hc-stat"><span className="hc-snum">25m</span><span className="hc-slbl">Delivery</span></div>
            <div className="hc-sdiv" />
            <div className="hc-stat"><span className="hc-snum">12k+</span><span className="hc-slbl">Users</span></div>
          </div>
        </div>

        {/* ── OFFERS CARD (floating bottom-right) ── */}
        <OffersCard />
      </div>

      {/* ── LIVE DEALS TICKER ── */}
      <div className="header-ticker">
        <span className="ticker-label">🔴 Live Deals</span>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Header
