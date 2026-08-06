import { useState } from 'react'
import Navbar from './component/Navbar/Navbar.jsx'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import OrderTracking from './pages/OrderTracking/OrderTracking'
import LoginPopup from './component/LoginPopup/LoginPopup.jsx'
import Footer from './component/Footer/Footer.jsx'
// import AdminLogin from './pages/AdminLogin/AdminLogin.jsx'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/track/:orderId' element={<OrderTracking />} />
          {/* <Route path='/admin' element={<AdminLogin />} /> */}
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App