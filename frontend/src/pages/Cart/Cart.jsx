import { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (subtotal === 0) {
      alert("⚠️ Cart empty hai, pehle item add karo");
      return;
    }

    // ✅ direct order page
    navigate("/order");
  };

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className="cart-items-title">
          <p>Image</p>
          <p>Name</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {food_list.map((item) => {
          if (!cartItems[item._id]) return null;

          const quantity = cartItems[item._id];

          return (
            <div key={item._id}>
              <div className='cart-items-title cart-items-item'>
                <img src={`${url}/uploads/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>₹{item.price}</p>
                <p>{quantity}</p>
                <p>₹{item.price * quantity}</p>
                <p onClick={() => removeFromCart(item._id)} className='cross'>✕</p>
              </div>
              <hr />
            </div>
          );
        })}

        {/* Empty cart */}
        {subtotal === 0 && (
          <p className='cart-empty'>🛒 Aapka cart khali hai.</p>
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{subtotal}</p>
          </div>
          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{deliveryFee}</p>
          </div>
          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{total}</b>
          </div>

          {/* 🔥 FINAL BUTTON */}
          <button onClick={handleCheckout}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <p>Promo code hai toh enter karo:</p>
          <div className='cart-promocode-input'>
            <input type="text" placeholder='Promo code' />
            <button>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;