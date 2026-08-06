import { useState } from 'react'
import './AddRestaurant.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../../context/NotificationContext'

const cuisineTypes = [
  "North Indian", "South Indian", "Chinese", "Italian", "Fast Food",
  "Mughlai", "Continental", "Street Food", "Biryani", "Pizza & Burgers"
]

const AddRestaurant = ({ url }) => {
  const [image, setImage] = useState(null)
  const [data, setData] = useState({
    name: '', description: '', address: '', cuisine: 'North Indian', rating: ''
  })
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotifications()

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!image) { toast.error('Please select a restaurant image'); return }

    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('address', data.address)
    formData.append('cuisine', data.cuisine)
    formData.append('rating', data.rating || 0)
    formData.append('image', image)

    try {
      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch(`${url}/api/restaurant/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await response.json()

      if (result.success) {
        toast.success('Restaurant added successfully! ✅')
        addNotification({
          title: 'New Restaurant Added',
          message: `${data.name} has been added to the platform`,
          type: 'success'
        })
        setData({ name: '', description: '', address: '', cuisine: 'North Indian', rating: '' })
        setImage(null)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className='add-restaurant'>
      <h2>🏪 Add New Restaurant</h2>
      <form onSubmit={onSubmit} className="add-restaurant-form">

        <div className="restaurant-image-upload">
          <label htmlFor="restaurant-image">
            {image
              ? <img src={URL.createObjectURL(image)} alt="preview" />
              : <div className='upload-placeholder'>
                  <span>🏪</span>
                  <p>Click to upload restaurant image</p>
                </div>
            }
          </label>
          <input type="file" id="restaurant-image" accept="image/*" hidden
            onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Restaurant Name *</label>
          <input name='name' value={data.name} onChange={onChangeHandler}
            type="text" placeholder='e.g. Sharma Ji Ka Dhaba' required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name='description' value={data.description} onChange={onChangeHandler}
            placeholder='Restaurant ke baare mein likho...' rows={3} />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input name='address' value={data.address} onChange={onChangeHandler}
            type="text" placeholder='e.g. Civil Lines, Bareilly' required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cuisine Type *</label>
            <select name='cuisine' value={data.cuisine} onChange={onChangeHandler}>
              {cuisineTypes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Rating (0–5)</label>
            <input name='rating' value={data.rating} onChange={onChangeHandler}
              type="number" placeholder='e.g. 4.2' min="0" max="5" step="0.1" />
          </div>
        </div>

        <button type='submit' disabled={loading}>
          {loading ? 'Adding...' : '🏪 Add Restaurant'}
        </button>
      </form>
    </div>
  )
}

export default AddRestaurant