import { useState } from 'react'
import './AddFood.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../../context/NotificationContext'

const categories = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"]

const AddFood = ({ url }) => {
  const [image, setImage] = useState(null)
  const [data, setData] = useState({
    name: '', description: '', price: '', category: 'Salad'
  })
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotifications()

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!image) { toast.error('Please select an image'); return }

    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', Number(data.price))
    formData.append('category', data.category)
    formData.append('image', image)

    try {
      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch(`${url}/api/food/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await response.json()

      if (result.success) {
        toast.success('Food added successfully! ✅')
        addNotification({
          title: 'New Food Item Added',
          message: `${data.name} has been added to the menu`,
          type: 'success'
        })
        setData({ name: '', description: '', price: '', category: 'Salad' })
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
    <div className='add-food'>
      <h2>Add New Food Item</h2>
      <form onSubmit={onSubmit} className="add-food-form">

        <div className="add-food-image">
          <label htmlFor="image">
            {image
              ? <img src={URL.createObjectURL(image)} alt="preview" />
              : <div className='upload-placeholder'>📷 Click to upload image</div>
            }
          </label>
          <input type="file" id="image" accept="image/*" hidden
            onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Food Name</label>
          <input name='name' value={data.name} onChange={onChangeHandler}
            type="text" placeholder='Enter food name' required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name='description' value={data.description} onChange={onChangeHandler}
            placeholder='Enter food description' rows={3} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name='category' value={data.category} onChange={onChangeHandler}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input name='price' value={data.price} onChange={onChangeHandler}
              type="number" placeholder='Enter price' min="1" required />
          </div>
        </div>

        <button type='submit' disabled={loading}>
          {loading ? 'Adding...' : 'Add Food Item'}
        </button>
      </form>
    </div>
  )
}

export default AddFood