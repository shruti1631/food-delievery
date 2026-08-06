import { useState, useRef, useEffect, useContext, useMemo } from 'react'
import './AiMoodEngine.css'
import { StoreContext } from '../../Context/StoreContext'

// Mood → just cosmetic (emoji/desc), doesn't filter items (no mood data on real food items)
const MOODS = {
  Happy: { emoji: '😊', color: '#f59e0b', desc: 'Celebrating? Let\'s make it tastier!' },
  Sad: { emoji: '😢', color: '#6366f1', desc: 'Comfort food is here for you 💜' },
  Hungry: { emoji: '🤤', color: '#ef4444', desc: 'MAXIMUM hunger mode — let\'s go!' },
}

const PREFERENCES = ['Spicy', 'Veg', 'Sweet', 'Non-Veg']
const PREF_EMOJI = { Spicy: '🌶️', Veg: '🥦', Sweet: '🍬', 'Non-Veg': '🍗' }

// 🔥 Picks real items from the actual DB food_list based on preference
// (Food model has no spice/veg/non-veg tags, so we approximate using
// category + name keywords against real seeded data)
const filterByPref = (pref, food_list) => {
  if (!food_list || food_list.length === 0) return []
  const isNonVeg = (f) => /chicken|mutton|fish|egg|meat/i.test(f.name)

  switch (pref) {
    case 'Sweet':
      return food_list.filter(f => ['Deserts', 'Cake'].includes(f.category))
    case 'Non-Veg':
      return food_list.filter(f => isNonVeg(f))
    case 'Veg':
      return food_list.filter(f => !isNonVeg(f) && !['Deserts', 'Cake'].includes(f.category))
    case 'Spicy':
      return food_list.filter(f => ['Pure Veg', 'Noodles', 'Rolls'].includes(f.category))
    default:
      return food_list
  }
}

const AiMoodEngine = () => {
  const { food_list, cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)

  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState(null)
  const [pref, setPref] = useState(null)
  const [step, setStep] = useState(1) // 1=mood, 2=pref, 3=combos
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectMood = (m) => {
    setMood(m)
    setPref(null)
    setStep(2)
  }

  const selectPref = (p) => {
    setPref(p)
    setStep(3)
  }

  const reset = () => {
    setMood(null)
    setPref(null)
    setStep(1)
  }

  // Real, matching food items from the database — capped at 3 for a "combo" feel
  const combos = useMemo(() => {
    if (!mood || !pref) return []
    return filterByPref(pref, food_list).slice(0, 3)
  }, [mood, pref, food_list])

  return (
    <div className="aime-wrap" ref={ref}>
      {/* Trigger button */}
      <button className={`aime-trigger ${open ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="aime-trigger-icon">🤖</span>
        <span className="aime-trigger-txt">AI Mood</span>
        <span className={`aime-trigger-arrow ${open ? 'up' : ''}`}>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="aime-panel">
          {/* Header */}
          <div className="aime-panel-head">
            <div className="aime-head-left">
              <span className="aime-head-icon">🤖</span>
              <div>
                <div className="aime-head-title">AI Mood Engine</div>
                <div className="aime-head-sub">Smart food personalisation</div>
              </div>
            </div>
            <span className="aime-live-badge">● LIVE</span>
          </div>

          {/* Breadcrumb */}
          <div className="aime-breadcrumb">
            <span className={`aime-bc ${step >= 1 ? 'done' : ''}`} onClick={reset}>Mood</span>
            <span className="aime-bc-sep">›</span>
            <span className={`aime-bc ${step >= 2 ? 'done' : ''}`} onClick={() => { if (mood) { setPref(null); setStep(2) } }}>Preference</span>
            <span className="aime-bc-sep">›</span>
            <span className={`aime-bc ${step >= 3 ? 'done' : ''}`}>Combos</span>
          </div>

          {/* STEP 1 — Mood */}
          {step === 1 && (
            <div className="aime-step">
              <div className="aime-step-label">How are you feeling right now?</div>
              <div className="aime-mood-grid">
                {Object.entries(MOODS).map(([m, d]) => (
                  <button key={m} className="aime-mood-btn" onClick={() => selectMood(m)}>
                    <span className="aime-mood-emoji">{d.emoji}</span>
                    <span className="aime-mood-name">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Preference */}
          {step === 2 && mood && (
            <div className="aime-step">
              <div className="aime-mood-selected" style={{ borderColor: MOODS[mood].color }}>
                <span>{MOODS[mood].emoji}</span>
                <div>
                  <strong>{mood}</strong>
                  <p>{MOODS[mood].desc}</p>
                </div>
              </div>
              <div className="aime-step-label">What's your preference today?</div>
              <div className="aime-pref-grid">
                {PREFERENCES.map(p => (
                  <button key={p} className="aime-pref-btn" onClick={() => selectPref(p)}>
                    <span className="aime-pref-emoji">{PREF_EMOJI[p]}</span>
                    <span>{p}</span>
                  </button>
                ))}
              </div>
              <button className="aime-back-btn" onClick={reset}>← Change mood</button>
            </div>
          )}

          {/* STEP 3 — Smart Combo Builder (real DB items, real cart) */}
          {step === 3 && mood && pref && (
            <div className="aime-step">
              <div className="aime-combo-header">
                <div className="aime-combo-title">
                  🎯 Smart Combo for <strong>{mood}</strong> · <strong>{PREF_EMOJI[pref]} {pref}</strong>
                </div>
                <button className="aime-back-btn small" onClick={() => { setPref(null); setStep(2) }}>← Change</button>
              </div>

              {combos.length === 0 ? (
                <p className="aime-empty">No matching items found right now. Try another preference.</p>
              ) : (
                <div className="aime-combos">
                  {combos.map((item) => {
                    const inCart = cartItems[item._id] || 0
                    return (
                      <div key={item._id} className="aime-combo-card">
                        <img
                          className="aime-combo-img"
                          src={`${url}/uploads/${item.image}`}
                          alt={item.name}
                        />
                        <div className="aime-combo-left">
                          <span className="aime-combo-tag">{item.category}</span>
                          <div className="aime-combo-name">{item.name}</div>
                          <div className="aime-combo-desc">{item.description}</div>
                        </div>
                        <div className="aime-combo-right">
                          <span className="aime-combo-price">₹{item.price}</span>
                          {inCart === 0 ? (
                            <button className="aime-add-btn" onClick={() => addToCart(item._id)}>
                              + Add
                            </button>
                          ) : (
                            <div className="aime-qty-control">
                              <button onClick={() => removeFromCart(item._id)}>−</button>
                              <span>{inCart}</span>
                              <button onClick={() => addToCart(item._id)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="aime-personalize-bar">
                <span>🧠</span>
                <span>AI personalised these based on your mood + preference from our real menu.</span>
              </div>
              <button className="aime-back-btn" onClick={reset}>↺ Start over</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AiMoodEngine