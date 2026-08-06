import { useState, useContext, useRef, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import SearchBar from '../SearchBar/SearchBar'
import AiMoodEngine from '../AiMoodEngine/AiMoodEngine'

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('Home')
  const navigate = useNavigate()
  const location = useLocation()
  const { token, setToken, cartItems } = useContext(StoreContext)

  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0)

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSectionNavigation = (event, label, sectionId) => {
    event.preventDefault()
    setMenu(label)
    const needsHomePage = sectionId === 'explore-menu' || sectionId === 'app-download'
    if (needsHomePage && location.pathname !== '/') {
      sessionStorage.setItem('pendingScrollTarget', sectionId)
      navigate('/')
      return
    }
    scrollToSection(sectionId)
  }

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef(null)

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="navbar">
      <Link to="/"><img src={assets.logo} alt="logo" className="logo" /></Link>

      <ul className="navbar-menu">
        <li className={menu === 'Home' ? 'active' : ''}>
          <Link to="/" onClick={() => setMenu('Home')}>Home</Link>
        </li>
        <li className={menu === 'Menu' ? 'active' : ''}>
          <a href="#explore-menu" onClick={(e) => handleSectionNavigation(e, 'Menu', 'explore-menu')}>Menu</a>
        </li>
        <li className={menu === 'Mobile App' ? 'active' : ''}>
          <a href="#app-download" onClick={(e) => handleSectionNavigation(e, 'Mobile App', 'app-download')}>Mobile App</a>
        </li>
        <li className={menu === 'Contact Us' ? 'active' : ''}>
          <a href="#footer" onClick={(e) => handleSectionNavigation(e, 'Contact Us', 'footer')}>Contact Us</a>
        </li>
      </ul>

      <div className="navbar-right">
        <SearchBar />

        {/* 🤖 AI Mood Engine Dropdown */}
        <AiMoodEngine />

        <Link to="/cart" className="navbar-search-icon">
          <img src={assets.basket_icon} alt="Cart" />
          {cartCount > 0 && <div className="dot">{cartCount}</div>}
        </Link>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        ) : (
          <div
            className="navbar-profile"
            ref={profileRef}
            onMouseEnter={() => setShowProfileMenu(true)}
            onClick={() => setShowProfileMenu(prev => !prev)}
          >
            <div className="profile-avatar">
              <img src={assets.profile_icon} alt="profile" />
            </div>
            <ul className={`nav-profile-dropdown ${showProfileMenu ? 'visible' : ''}`}>
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon || assets.basket_icon} alt="" />
                <p>Orders</p>
              </li>
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
