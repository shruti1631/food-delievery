import { useState, useContext, useRef, useEffect } from 'react'
import './SearchBar.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const SearchBar = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const { food_list, addToCart, url } = useContext(StoreContext)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  // Search bar open hone pe input focus karo
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Bahar click karne pe band karo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length > 0) {
      const filtered = food_list.filter(item =>
        item.name.toLowerCase().includes(val.toLowerCase()) ||
        item.category.toLowerCase().includes(val.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  const handleAdd = (itemId) => {
    addToCart(itemId)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div className='searchbar-wrapper' ref={wrapperRef}>

      {/* Search Icon — click karne pe bar open hoga */}
      <div className={`searchbar-icon ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
        <img src={assets.search_icon} alt="Search" />
      </div>

      {/* Search Input — open hone pe slide in hoga */}
      <div className={`searchbar-input-container ${open ? 'open' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder='Search food ...'
          value={query}
          onChange={handleSearch}
        />
        {query && (
          <span className='searchbar-clear' onClick={() => { setQuery(''); setResults([]) }}>✕</span>
        )}
      </div>

      {/* Results Dropdown */}
      {open && query && (
        <div className='searchbar-results'>
          {results.length === 0 ? (
            <p className='no-results'>No items found for {query}</p>
          ) : (
            results.map(item => (
              <div key={item._id} className='search-item'>
                <img src={`${url}/uploads/${item.image}`} alt={item.name} />
                <div className='search-item-info'>
                  <p className='search-item-name'>{item.name}</p>
                  <p className='search-item-category'>{item.category}</p>
                </div>
                <div className='search-item-right'>
                  <p className='search-item-price'>₹{item.price}</p>
                  <button onClick={() => handleAdd(item._id)}>Add +</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar