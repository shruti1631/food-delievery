import'./ExploreMenu.css'
import {menu_list} from '../../assets/assets'


const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore Our menu</h1>
        <p className='Explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes.</p>
        <div className="explore-menu-list">
            {menu_list.map((item, index)=>{
                return(
                    <div key={index} className='explore-menu-list-item' onClick={() => setCategory((prev) => prev === item.menu_name ? "All" : item.menu_name)}>
                        <img src={item.menu_image} alt={item.menu_name} className={category === item.menu_name ? "active" : ""} />
                        <p>{item.menu_name}</p>
                    </div>  
                )
            })}              
        
        </div>
    </div>

)
        } 
export default ExploreMenu
