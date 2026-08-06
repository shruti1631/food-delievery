import { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {
  const { food_list, loading } = useContext(StoreContext)

  if (loading) {
    return (
      <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        <div className="food-display-loading">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const filteredList = food_list.filter(
    item => category === "All" || category === item.category
  )

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>

      {filteredList.length === 0 ? (
        <p className='food-display-empty'>Is category mein koi item nahi hai.</p>
      ) : (
        <div className="food-display-list">
          {filteredList.map((item, index) => (
            <FoodItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodDisplay