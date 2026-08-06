import { useEffect, useState } from 'react'
import './FoodList.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../../context/NotificationContext'

const FoodList = ({ url }) => {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  const fetchFoods = async () => {
    try {
      const res = await fetch(`${url}/api/food/list`)
      const data = await res.json()
      if (data.success) setFoods(data.data)
    } catch { toast.error('Failed to load foods') }
    finally { setLoading(false) }
  }

  const deleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${url}/api/food/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        const deletedFood = foods.find(f => f._id === id)
        toast.success('Food deleted ✅')
        addNotification({
          title: 'Food Item Removed',
          message: `${deletedFood?.name || 'Food item'} has been removed from the menu`,
          type: 'warning'
        })
        fetchFoods()
      } else { toast.error(data.message) }
    } catch { toast.error('Something went wrong') }
  }

  useEffect(() => { fetchFoods() }, [])

  if (loading) return <div className='food-list'><p>Loading...</p></div>

  return (
    <div className='food-list'>
      <h2>All Food Items ({foods.length})</h2>
      <div className="food-list-table">
        <div className="food-list-header">
          <p>Image</p><p>Name</p><p>Category</p><p>Price</p><p>Action</p>
        </div>
        {foods.map(food => (
          <div key={food._id} className="food-list-row">
            <img src={`${url}/uploads/${food.image}`} alt={food.name} />
            <p>{food.name}</p>
            <p>{food.category}</p>
            <p>₹{food.price}</p>
            <button onClick={() => deleteFood(food._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FoodList