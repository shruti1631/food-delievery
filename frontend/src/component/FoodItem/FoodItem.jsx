import { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
  const itemCount = cartItems[id] || 0;

  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        {/*  Image URL fix — backend uploads folder se */}
        <img
          className='food-item-image'
          src={`${url}/uploads/${image}`}
          alt={name}
        />

        {!itemCount ? (
          <img
            className='add'
            onClick={() => addToCart(id)}
            src={assets.add_icon_green}
            alt="Add"
          />
        ) : (
          <div className='food-item-counter'>
            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="Remove" />
            <p>{itemCount}</p>
            <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="Add" />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        {/*  Price INR mein */}
        <p className="food-item-price">₹{price}</p>
      </div>
    </div>
  )
}

export default FoodItem