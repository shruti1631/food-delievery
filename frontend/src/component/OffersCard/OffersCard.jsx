import { useState, useEffect } from 'react'
import './OffersCard.css'

const OFFERS = [
  { tag: '🎉 NEW USER', title: '60% OFF', sub: 'on your first order', code: 'ZESTY60', color: '#FF6B1A', bg: 'rgba(255,107,26,0.12)' },
  { tag: '⚡ FLASH DEAL', title: 'Free Delivery', sub: 'on orders above ₹299', code: 'FREEDEL', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { tag: '🍕 WEEKEND', title: 'Buy 1 Get 1', sub: 'on all pizzas today', code: 'PIZZA2X', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  { tag: '🤖 AI PICK', title: '₹100 OFF', sub: 'on AI-recommended meals', code: 'AISAVE', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
]

const OffersCard = () => {
  const [idx, setIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % OFFERS.length)
        setAnimating(false)
      }, 250)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const handleCopy = () => {
    navigator.clipboard?.writeText(OFFERS[idx].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const o = OFFERS[idx]

  return (
    <div className="ofc-wrap" style={{ borderColor: o.color + '55', background: o.bg }}>
      {/* Tag */}
      <div className={`ofc-inner ${animating ? 'fade-out' : 'fade-in'}`}>
        <div className="ofc-tag" style={{ color: o.color }}>{o.tag}</div>
        <div className="ofc-title" style={{ color: o.color }}>{o.title}</div>
        <div className="ofc-sub">{o.sub}</div>
        <div className="ofc-code-row">
          <span className="ofc-code-label">Use code:</span>
          <span className="ofc-code-val">{o.code}</span>
          <button className={`ofc-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        {/* Dots */}
        <div className="ofc-dots">
          {OFFERS.map((_, i) => (
            <span
              key={i}
              className={`ofc-dot ${i === idx ? 'active' : ''}`}
              style={i === idx ? { background: o.color } : {}}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default OffersCard
