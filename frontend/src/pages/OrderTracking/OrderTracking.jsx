import { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './OrderTracking.css'
import { StoreContext } from '../../Context/StoreContext'

const RIDER_ROUTE = [
  { x: 350, distLeft: "1.2 km", eta: "12 min", progress: 65 },
  { x: 290, distLeft: "0.95 km", eta: "9 min", progress: 72 },
  { x: 220, distLeft: "0.7 km", eta: "7 min", progress: 80 },
  { x: 160, distLeft: "0.5 km", eta: "5 min", progress: 87 },
  { x: 100, distLeft: "0.25 km", eta: "2 min", progress: 95 },
  { x: 46, distLeft: "Arrived!", eta: "Delivered!", progress: 100 },
]

const LiveTracker = ({ delivered }) => {
  const [routeStep, setRouteStep] = useState(0)
  const intervalRef = useRef(null)
  const current = RIDER_ROUTE[routeStep]

  useEffect(() => {
    if (delivered) { setRouteStep(RIDER_ROUTE.length - 1); return }
    intervalRef.current = setInterval(() => {
      setRouteStep(prev => {
        if (prev >= RIDER_ROUTE.length - 1) { clearInterval(intervalRef.current); return prev }
        return prev + 1
      })
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [delivered])

  return (
    <div className='live-tracker-card'>
      <div className='lt-header'>
        <span className='lt-title'>Live Tracking</span>
        <span className='lt-live-badge'>
          <span className='lt-dot' />
          Live
        </span>
      </div>

      <div className='lt-map'>
        {[60, 130, 185].map(t => <div key={t} className='lt-road-h' style={{ top: t }} />)}
        {[80, 220, 380, 550].map(l => <div key={l} className='lt-road-v' style={{ left: l }} />)}
        {[
          [90,10,120,40],[90,70,50,50],[150,70,60,50],[230,10,140,40],
          [230,70,140,50],[390,10,150,110],[90,140,120,35],[230,140,140,35],[390,140,150,35]
        ].map(([l,t,w,h],i) => (
          <div key={i} className='lt-block' style={{ left: l, top: t, width: w, height: h }} />
        ))}
        <svg className='lt-svg' viewBox="0 0 680 220">
          <polyline
            points="594,95 550,95 550,130 380,130 380,60 220,60 220,130 80,130 80,95 46,95"
            fill="none" stroke="#185FA5" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.6"
          />
        </svg>
        <div className='lt-pin lt-pin-rest' style={{ left: 580, top: 79 }}>🍽️</div>
        <div className='lt-label' style={{ left: 545, top: 110 }}>Restaurant</div>
        <div className='lt-pin lt-pin-home' style={{ left: 32, top: 79 }}>🏠</div>
        <div className='lt-label' style={{ left: 14, top: 110 }}>You</div>
        <div className='lt-pin lt-pin-rider' style={{ left: current.x, top: 79, transition: 'left 1s linear' }}>🛵</div>
        <div className='lt-label' style={{ left: current.x - 10, top: 113, transition: 'left 1s linear' }}>Rider</div>
      </div>

      <div className='lt-footer'>
        <div className='lt-stat'>
          <span className='lt-stat-label'>ETA</span>
          <span className='lt-stat-value'>{current.eta}</span>
        </div>
        <div className='lt-stat'>
          <span className='lt-stat-label'>Distance</span>
          <span className='lt-stat-value'>{current.distLeft}</span>
        </div>
        <div className='lt-progress-wrap'>
          <div className='lt-progress-bar'>
            <div className='lt-progress-fill' style={{ width: `${current.progress}%` }} />
          </div>
          <span className='lt-progress-label'>{current.progress}%</span>
        </div>
      </div>

      <div className='lt-rider'>
        <div className='lt-rider-avatar'>RS</div>
        <div className='lt-rider-info'>
          <span className='lt-rider-name'>Ravi Shankar</span>
          <span className='lt-rider-meta'>★ 4.8 · 1,240 deliveries</span>
        </div>
        <div className='lt-rider-actions'>
          <button className='lt-action-btn' onClick={() => alert('Calling rider...')}>📞 Call</button>
          <button className='lt-action-btn' onClick={() => alert('Chat coming soon...')}>💬 Chat</button>
        </div>
      </div>
    </div>
  )
}

const OrderTracking = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { token, url } = useContext(StoreContext)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${url}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setOrder(data.order)
      else { alert('Order not found'); navigate('/myorders') }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchOrder()
  }, [token, orderId, url])

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const res = await fetch(`${url}/api/order/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId })
      })
      const data = await res.json()
      if (data.success) { alert('Order cancelled ❌'); fetchOrder() }
      else alert(data.message || 'Failed to cancel')
    } catch { alert('Something went wrong') }
    finally { setCancelling(false) }
  }

  const getStatusIndex = (status) =>
    ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(status)

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
    })

  const calculateETA = (estimatedDelivery) => {
    const diff = new Date(estimatedDelivery) - new Date()
    if (diff <= 0) return 'Delivered'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (loading) return <div className='order-tracking'><p className='ot-loading'>Loading order details...</p></div>
  if (!order) return <div className='order-tracking'><p>Order not found</p></div>

  const currentStatusIndex = getStatusIndex(order.status)
  const isOutForDelivery = order.status === 'Out for Delivery'
  const isDelivered = order.status === 'Delivered'

  const statuses = [
    { name: 'Order Placed', icon: '📦' },
    { name: 'Preparing', icon: '👨‍🍳' },
    { name: 'Out for Delivery', icon: '🚴' },
    { name: 'Delivered', icon: '✅' },
  ]

  return (
    <div className='order-tracking'>
      <div className='tracking-header'>
        <button className='back-btn' onClick={() => navigate('/myorders')}>← Back</button>
        <h1>Order Tracking</h1>
        <div className='header-actions'>
          <p className='order-id'>#{order._id.slice(-8).toUpperCase()}</p>
          {order.status === 'Pending' && (
            <button className='cancel-btn' onClick={cancelOrder} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : '❌ Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className='tracking-container'>

        <div className='timeline-section'>
          {(isOutForDelivery || isDelivered) && (
            <LiveTracker delivered={isDelivered} />
          )}

          <div className='timeline-card'>
            <h2>Order Status</h2>
            <div className='timeline'>
              {statuses.map((s, idx) => {
                const isDone = idx < currentStatusIndex
                const isActive = idx === currentStatusIndex
                const isPending = idx > currentStatusIndex
                return (
                  <div key={idx} className={`timeline-item ${isDone ? 'completed' : isActive ? 'active' : 'pending'}`}>
                    <div className='timeline-left'>
                      <div className='timeline-circle'>
                        {isDone ? '✓' : isActive ? s.icon : '○'}
                      </div>
                      {idx < statuses.length - 1 && (
                        <div className={`timeline-line ${isDone ? 'done' : ''}`} />
                      )}
                    </div>
                    <div className='timeline-content'>
                      <h3>{s.name}</h3>
                      {order.statusTimeline?.[idx] && (
                        <>
                          <p>{order.statusTimeline[idx].message}</p>
                          <span className='timeline-time'>
                            {formatTime(order.statusTimeline[idx].timestamp)}
                          </span>
                        </>
                      )}
                      {isPending && <p className='tl-pending-text'>Waiting...</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className='details-section'>

          <div className='details-card'>
            <h2>🎯 Estimated Delivery</h2>
            <div className='delivery-info'>
              <p className='time-remaining'>
                {order.status !== 'Delivered'
                  ? `${calculateETA(order.estimatedDelivery)} remaining`
                  : '✅ Delivered!'}
              </p>
              <p className='delivery-time'>
                {new Date(order.estimatedDelivery).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className='details-card'>
            <h2>📍 Delivery Address</h2>
            <p className='address'>{order.address}</p>
          </div>

          <div className='details-card'>
            <h2>🍔 Order Items</h2>
            <div className='items-list'>
              {order.items.map((item, idx) => (
                <div key={idx} className='item-row'>
                  <div className='item-info'>
                    <h4>{item.foodId?.name || 'Item'}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <p className='item-price'>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='details-card'>
            <h2>💳 Payment Details</h2>
            <div className='payment-info'>
              <div className='info-row'>
                <span>Subtotal:</span>
                <span>₹{order.amount.toFixed(2)}</span>
              </div>
              <div className='info-row'>
                <span>Delivery:</span>
                <span>Free</span>
              </div>
              <div className='info-row total'>
                <span>Total Amount:</span>
                <span>₹{order.amount.toFixed(2)}</span>
              </div>
              <div className='payment-method'>
                <span>{order.paymentMethod}</span>
                {/* ✅ Sirf payment true hone par Paid dikhega */}
                <span className={order.payment ? 'paid' : 'pending'}>
                  {order.payment ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default OrderTracking