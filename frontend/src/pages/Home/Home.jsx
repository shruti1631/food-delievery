import './Home.css'
import { useEffect, useState } from 'react'
import Header from '../../component/Header/Header'
import ExploreMenu from '../../component/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../component/FoodDesplay/FoodDisplay'
import AppDownload from '../../component/AppDownload/AppDownload'

const Home = () => {

  const [category, setCategory] = useState("All")

  useEffect(() => {
    const pendingTarget = sessionStorage.getItem('pendingScrollTarget')
    if (!pendingTarget) {
      return
    }

    const timeoutId = setTimeout(() => {
      const target = document.getElementById(pendingTarget)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      sessionStorage.removeItem('pendingScrollTarget')
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className='home'>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <AppDownload />
    </div>
  )
}

export default Home
