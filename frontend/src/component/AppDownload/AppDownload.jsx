import './AppDownload.css'
import { assets } from '../../assets/assets'
 
 const AppDownload = () => {
   return (
     <div className='app-download' id='app-download'>
        <p>
          For Better Experience Download
          <br />
          ZestyBite App
        </p>
        <div className="App-download-platform">
            <img src={assets.play_store}alt=""/>
            <img src={assets.app_store}alt=""/>
        </div>
       
     </div>
   )
 }
 
 export default AppDownload
 
