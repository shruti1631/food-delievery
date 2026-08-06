import './Sidebar.css'

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'add', icon: '➕', label: 'Add Food' },
    { id: 'foodlist', icon: '🍽️', label: 'Food List' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'add-restaurant', icon: '🏪', label: 'Add Restaurant' },
    { id: 'restaurant-list', icon: '🗂️', label: 'Restaurant List' },
  ]

  return (
    <div className='admin-sidebar'>
      {menuItems.map(item => (
        <div
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <span>{item.icon}</span>
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  )
}

export default Sidebar