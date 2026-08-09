import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'

import AddFood from './pages/AddFood/AddFood'
import FoodList from './pages/FoodList/FoodList'
import Orders from './pages/Orders/Orders'
import AddRestaurant from './pages/AddRestaurant/AddRestaurant'
import RestaurantList from './pages/RestaurantList/RestaurantList'
import AdminLogin from './pages/AdminLogin/AdminLogin'

import { NotificationProvider } from './context/NotificationContext'

const App = () => {
  const [activePage, setActivePage] = useState('foodlist')
  const [openSettings, setOpenSettings] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'))

  const url = "https://food-delievery-rpr2.onrender.com";

  if (!isLoggedIn) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={2000} />
        <AdminLogin url={url} onLogin={() => setIsLoggedIn(true)} />
      </>
    )
  }

  return (
    <NotificationProvider>
      <div className='admin-app'>

        <ToastContainer position="top-right" autoClose={2000} />

        <Navbar
          adminName="Admin"
          onOpenSettings={() => setOpenSettings(true)}
          onNavigate={setActivePage}
        />

        <div className="admin-body">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />

          <div className="admin-content">
            {activePage === 'add' && <AddFood url={url} />}
            {activePage === 'foodlist' && <FoodList url={url} />}
            {activePage === 'orders' && <Orders url={url} />}
            {activePage === 'add-restaurant' && <AddRestaurant url={url} />}
            {activePage === 'restaurant-list' && <RestaurantList url={url} />}
          </div>
        </div>

        {openSettings && (
          <SettingsPanel onClose={() => setOpenSettings(false)} />
        )}

      </div>
    </NotificationProvider>
  )
}

export default App
