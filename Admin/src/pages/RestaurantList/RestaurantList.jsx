import { useEffect, useState } from 'react'
import './RestaurantList.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../../context/NotificationContext'

const RestaurantList = ({ url }) => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${url}/api/restaurant/list`)
      const data = await res.json()
      if (data.success) setRestaurants(data.data)
    } catch {
      toast.error('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${url}/api/restaurant/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        const deleted = restaurants.find(r => r._id === id)
        toast.success('Restaurant deleted ✅')
        addNotification({
          title: 'Restaurant Removed',
          message: `${deleted?.name || 'Restaurant'} has been removed`,
          type: 'warning'
        })
        fetchRestaurants()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const toggleActive = async (id) => {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${url}/api/restaurant/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchRestaurants()
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  useEffect(() => { fetchRestaurants() }, [])

  if (loading) return <div className='restaurant-list'><p>Loading...</p></div>

  return (
    <div className='restaurant-list'>
      <h2>🏪 All Restaurants ({restaurants.length})</h2>

      {restaurants.length === 0
        ? <div className='no-restaurants'><p>Koi restaurant nahi mila. Pehle add karo! 🏪</p></div>
        : (
          <div className="restaurant-grid">
            {restaurants.map(r => (
              <div key={r._id} className={`restaurant-card ${!r.isActive ? 'inactive' : ''}`}>

                <div className="restaurant-card-img">
                  <img src={`${url}/uploads/${r.image}`} alt={r.name} />
                  <span className={`status-badge ${r.isActive ? 'open' : 'closed'}`}>
                    {r.isActive ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>

                <div className="restaurant-card-info">
                  <h3>{r.name}</h3>
                  <p className='cuisine-tag'>🍽️ {r.cuisine}</p>
                  <p className='restaurant-address'>📍 {r.address}</p>
                  {r.rating > 0 && <p className='restaurant-rating'>⭐ {r.rating} / 5</p>}
                  {r.description && <p className='restaurant-desc'>{r.description}</p>}
                </div>

                <div className="restaurant-card-actions">
                  <button className='toggle-btn' onClick={() => toggleActive(r._id)}>
                    {r.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className='delete-btn' onClick={() => deleteRestaurant(r._id)}>
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

export default RestaurantList