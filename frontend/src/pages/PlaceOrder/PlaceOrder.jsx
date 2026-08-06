import { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount, token, url, clearCart } = useContext(StoreContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    street: '', city: '', state: '',
    zipcode: '', country: '', phone: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal === 0 ? 0 : 50
  const total = subtotal + deliveryFee

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const placeOrderHandler = async (e) => {
    e.preventDefault()
    if (!token) { alert('Pehle login karo!'); return }
    if (subtotal === 0) { alert('Cart khali hai!'); return }

    const address = `${formData.firstName} ${formData.lastName}, ${formData.street}, ${formData.city}, ${formData.state} - ${formData.zipcode}, ${formData.country}. Phone: ${formData.phone}`

    setLoading(true)
    try {
      const response = await fetch(`${url}/api/order/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address, paymentMethod })
      })
      const data = await response.json()

      if (!data.success) { alert(data.message || 'Order place nahi hua'); setLoading(false); return }

      if (paymentMethod === 'ONLINE') {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_TEST_KEY_ID || '',
          amount: data.razorpayOrder.amount,
          currency: 'INR',
          name: 'ZestyBite',
          description: 'Food Order Payment',
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            const verifyRes = await fetch(`${url}/api/order/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId
              })
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              const orderTime = new Date(verifyData.orderTime).toLocaleString('en-IN')
              alert(`Payment successful! ✅\nOrder Time: ${orderTime}`)
              navigate('/myorders')
            } else {
              alert('Payment verify nahi hua ❌')
            }
          },
          prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
          theme: { color: '#ff6b35' }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
        return
      }

      clearCart()
      const orderTime = new Date(data.orderTime).toLocaleString('en-IN')
      alert(`Order placed! (Cash on Delivery) ✅\nOrder Time: ${orderTime}`)
      navigate('/myorders')
    } catch {
      alert('Kuch gadbad ho gayi, dobara try karo')
    }
    setLoading(false)
  }

  return (
    <form className='place-order' onSubmit={placeOrderHandler}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" name="firstName" placeholder='First name' value={formData.firstName} onChange={onChangeHandler} required />
          <input type="text" name="lastName" placeholder='Last name' value={formData.lastName} onChange={onChangeHandler} required />
        </div>
        <input type="email" name="email" placeholder='Email address' value={formData.email} onChange={onChangeHandler} required />
        <input type="text" name="street" placeholder='Street' value={formData.street} onChange={onChangeHandler} required />
        <div className="multi-fields">
          <input type="text" name="city" placeholder='City' value={formData.city} onChange={onChangeHandler} required />
          <input type="text" name="state" placeholder='State' value={formData.state} onChange={onChangeHandler} required />
        </div>
        <div className="multi-fields">
          <input type="text" name="zipcode" placeholder='Zip code' value={formData.zipcode} onChange={onChangeHandler} required />
          <input type="text" name="country" placeholder='Country' value={formData.country} onChange={onChangeHandler} required />
        </div>
        <input type="text" name="phone" placeholder='Phone number' value={formData.phone} onChange={onChangeHandler} required />

        <p className="title" style={{ marginTop: '20px' }}>Payment Method</p>
        <div className="payment-options">
          <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
            <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
            💵 Cash on Delivery (COD)
          </label>
          <label className={`payment-option ${paymentMethod === 'ONLINE' ? 'active' : ''}`}>
            <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} />
            💳 Online Payment (Razorpay)
          </label>
        </div>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>₹{subtotal}</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Fee</p><p>₹{deliveryFee}</p></div>
            <hr />
            <div className="cart-total-details"><b>Total</b><b>₹{total}</b></div>
          </div>
          <button type='submit' disabled={subtotal === 0 || loading}>
            {loading ? 'Processing...' : paymentMethod === 'ONLINE' ? 'PAY NOW' : 'PLACE ORDER'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
