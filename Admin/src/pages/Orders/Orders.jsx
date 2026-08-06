import { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../../context/NotificationContext'

const statusOptions = ["Pending", "Preparing", "Out for Delivery", "Delivered"]

const statusTransitions = {
  Pending: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  Preparing: ["Preparing", "Out for Delivery", "Delivered"],
  "Out for Delivery": ["Out for Delivery", "Delivered"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"]
}

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const [previousCancelledCount, setPreviousCancelledCount] = useState(0)
  const { addNotification } = useNotifications()

  // Calculate order statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    totalRevenue: orders.filter(o => o.payment).reduce((sum, o) => sum + o.amount, 0)
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${url}/api/order/all`)
      const data = await res.json()
      if (data.success) {
        const newOrders = data.orders
        setOrders(newOrders)
        
        // Check for new orders
        if (!loading && newOrders.length > previousOrderCount) {
          const newOrderCount = newOrders.length - previousOrderCount
          if (newOrderCount > 0) {
            addNotification({
              type: 'order',
              title: 'New Order Received',
              message: `🆕 ${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`,
              time: 'Just now',
              target: 'orders'
            })
            toast.info(`New order${newOrderCount > 1 ? 's' : ''} arrived!`)
          }
        }
        
        // Check for cancelled orders
        const cancelledCount = newOrders.filter(o => o.status === 'Cancelled').length
        if (!loading && cancelledCount > previousCancelledCount) {
          const newCancelledCount = cancelledCount - previousCancelledCount
          if (newCancelledCount > 0) {
            addNotification({
              type: 'alert',
              title: 'Order Cancelled',
              message: `❌ ${newCancelledCount} order${newCancelledCount > 1 ? 's' : ''} cancelled by customer`,
              time: 'Just now',
              target: 'orders'
            })
            toast.warning(`Order${newCancelledCount > 1 ? 's' : ''} cancelled!`)
          }
        }
        
        setPreviousOrderCount(newOrders.length)
        setPreviousCancelledCount(cancelledCount)
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    const order = orders.find(o => o._id === orderId)
    if (!order || order.status === 'Delivered' || order.status === 'Cancelled') return
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch(`${url}/api/order/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      const data = await res.json()
      if (data.success) {
        const statusMessage = status === 'Delivered' ? 'Order delivered successfully! 🎉' : `Order status updated to ${status} ✅`
        toast.success(statusMessage)
        
        // Add notification
        const order = orders.find(o => o._id === orderId)
        const notificationMsg = status === 'Delivered' 
          ? `Order #${orderId.slice(-4).toUpperCase()} has been delivered! ✅`
          : `Order #${orderId.slice(-4).toUpperCase()} status changed to ${status}`
        
        addNotification({
          type: status === 'Delivered' ? 'success' : 'order',
          title: status === 'Delivered' ? 'Order Delivered' : 'Order Status Updated',
          message: notificationMsg,
          time: 'Just now',
          target: 'orders'
        })
        
        fetchOrders()
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Something went wrong')
      console.error('Update status error:', error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  useEffect(() => { 
    fetchOrders()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className='orders'><p>Loading orders...</p></div>

  return (
    <div className='orders'>
      <div className='orders-header'>
        <h2>All Orders ({orders.length})</h2>
        <div className='header-actions'>
          <button className='refresh-btn' onClick={fetchOrders} disabled={loading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            className='test-notification-btn' 
            onClick={() => addNotification({
              type: 'info',
              title: 'Test Notification',
              message: '🔔 Test notification - System working!',
              time: 'Just now'
            })}
          >
            Test Notification
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className='order-stats'>
        <div className='stat-card'>
          <h3>{stats.total}</h3>
          <p>Total Orders</p>
        </div>
        <div className='stat-card pending'>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className='stat-card preparing'>
          <h3>{stats.preparing}</h3>
          <p>Preparing</p>
        </div>
        <div className='stat-card out-for-delivery'>
          <h3>{stats.outForDelivery}</h3>
          <p>Out for Delivery</p>
        </div>
        <div className='stat-card delivered'>
          <h3>{stats.delivered}</h3>
          <p>Delivered</p>
        </div>
        <div className='stat-card cancelled'>
          <h3>{stats.cancelled}</h3>
          <p>Cancelled</p>
        </div>
        <div className='stat-card revenue'>
          <h3>₹{stats.totalRevenue}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className='no-orders'>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className={`order-card ${order.status?.toLowerCase().replace(' ', '-')}`}>
            <div className='order-icon'>
              {order.status === 'Delivered' ? '✅' : 
               order.status === 'Out for Delivery' ? '🚴' : 
               order.status === 'Preparing' ? '👨‍🍳' : '📦'}
            </div>
            <div className='order-details'>
              <div className='order-header'>
                <p className='order-items'>
                  {order.items.map((item, i) => (
                    <span key={i}>{item.foodId?.name || 'Item'} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </p>
                <span className={`status-badge ${order.status?.toLowerCase().replace(' ', '-')}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              <p className='order-address'>📍 {order.address}</p>
              <p className='order-user'>👤 {order.user?.name || 'Unknown'} ({order.user?.email || 'N/A'})</p>
              <p className='order-meta'>
                Items: {order.items.length} &nbsp;|&nbsp;
                Payment: <b>{order.paymentMethod}</b> &nbsp;|&nbsp;
                <span className={order.payment ? 'paid' : 'unpaid'}>
                  {order.payment ? 'Paid ✅' : 'Pending ⏳'}
                </span>
              </p>
              <p className='order-time'>
                🕒 {new Date(order.orderTime).toLocaleString('en-IN')}
              </p>
            </div>
            <div className='order-right'>
              <p className='order-amount'>₹{order.amount}</p>
              <div className='order-actions'>
                {order.status === 'Out for Delivery' && (
                  <button 
                    className='deliver-btn'
                    onClick={() => updateStatus(order._id, 'Delivered')}
                    disabled={updatingOrderId === order._id}
                  >
                    {updatingOrderId === order._id ? 'Updating...' : '✅ Mark Delivered'}
                  </button>
                )}
                {(order.status !== 'Delivered' && order.status !== 'Cancelled') ? (
                  <select
                    value={order.status || 'Pending'}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={updatingOrderId === order._id}
                  >
                    {(statusTransitions[order.status || 'Pending'] || statusTransitions.Pending).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className='order-no-actions'>No further updates</div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Orders