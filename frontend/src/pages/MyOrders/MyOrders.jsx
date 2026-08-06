import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyOrders.css'
import { StoreContext } from '../../Context/StoreContext'

const MyOrders = () => {
  const navigate = useNavigate()
  const { token, url, cartItems, addToCart, removeFromCart } = useContext(StoreContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setOrders(data.orders)
    } catch (error) {
      console.error('Orders fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) fetchOrders() }, [token])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    setCancellingOrderId(orderId)
    try {
      const response = await fetch(`${url}/api/order/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Order cancelled successfully ❌')
        // Refresh orders list
        fetchOrders()
      } else {
        alert(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Cancel order error:', error)
      alert('Something went wrong while cancelling order')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const reorderItems = (order) => {
    // Add all items from the order to cart
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.foodId._id)
      }
    })
    alert('Items added to cart! 🛒')
    navigate('/cart')
  }

  if (!token) return <div className='my-orders'><h2>My Orders</h2><p>Orders dekhne ke liye pehle login karo.</p></div>
  if (loading) return <div className='my-orders'><p>Loading...</p></div>
  if (orders.length === 0) return <div className='my-orders'><h2>My Orders</h2><p>Abhi tak koi order nahi hai.</p></div>

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className='container'>
        {orders.map((order) => (
          <div key={order._id} className='my-orders-order'>
            <div className='order-items'>
              {order.items.map((item, idx) => (
                <span key={idx}>
                  {item.foodId?.name || 'Item'} x {item.quantity}
                  {idx < order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            <p className='order-amount'>₹{order.amount}</p>
            <p>Items: {order.items.length}</p>
            <div className='order-status'>
              <span className={`status-dot ${order.status?.toLowerCase()}`}>&#x25cf;</span>
              <b>{order.status || 'Pending'}</b>
            </div>
            <p className='payment-method'>
              {order.paymentMethod} —
              <span className={order.payment ? 'paid' : 'unpaid'}>
                {order.payment ? ' Paid ✅' : ' Pending ⏳'}
              </span>
            </p>
            <p className='order-date'>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <div className='order-actions'>
              <button onClick={() => navigate(`/track/${order._id}`)}>📍 Track Order</button>
              {order.status === 'Pending' && (
                <button 
                  className='cancel-btn' 
                  onClick={() => cancelOrder(order._id)}
                  disabled={cancellingOrderId === order._id}
                >
                  {cancellingOrderId === order._id ? 'Cancelling...' : '❌ Cancel'}
                </button>
              )}
              <button 
                className='reorder-btn' 
                onClick={() => reorderItems(order)}
              >
                🔄 Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders