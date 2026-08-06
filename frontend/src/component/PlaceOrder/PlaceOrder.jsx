import { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })
  const [paymentMethod, setPaymentMethod] = useState("COD")

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    let orderItems = []
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item
        itemInfo["quantity"] = cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
      paymentMethod: paymentMethod
    }
    if (paymentMethod === "ONLINE") {
      // Online payment logic
      try {
        const response = await fetch(`${url}/api/order/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token
          },
          body: JSON.stringify(orderData)
        })
        const result = await response.json()
        if (result.success) {
          const { razorpayOrder, orderId } = result
          initPayment(razorpayOrder, orderId)
        } else {
          alert(result.message)
        }
      } catch {
        alert("Error placing order")
      }
    } else {
      // COD
      try {
        const response = await fetch(`${url}/api/order/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token
          },
          body: JSON.stringify(orderData)
        })
        const result = await response.json()
        if (result.success) {
          alert("Order placed successfully")
          // Clear cart or redirect
        } else {
          alert(result.message)
        }
      } catch {
        alert("Error placing order")
      }
    }
  }

  const initPayment = (order, orderId) => {
    const options = {
      key: "rzp_test_SaxS00FYUwOdMB", // Razorpay key_id
      amount: order.amount,
      currency: order.currency,
      name: "Food Delivery",
      description: "Order Payment",
      order_id: order.id,
      handler: async (response) => {
        try {
          const verifyResponse = await fetch(`${url}/api/order/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              token
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            })
          })
          const result = await verifyResponse.json()
          if (result.success) {
            alert("Payment successful")
          } else {
            alert("Payment verification failed")
          }
        } catch {
          alert("Error verifying payment")
        }
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone
      },
      theme: {
        color: "#3399cc"
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <form className='place-order' onSubmit={placeOrder}>
      
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>

        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />

        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>

        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>

        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />

        <div className="payment-method">
          <p>Payment Method</p>
          <div>
            <input type="radio" id="cod" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
            <label htmlFor="cod">Cash on Delivery</label>
          </div>
          <div>
            <input type="radio" id="online" name="payment" value="ONLINE" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} />
            <label htmlFor="online">Online Payment</label>
          </div>
        </div>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit' disabled={getTotalCartAmount() === 0}>
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>

    </form>
  )
}

export default PlaceOrder
