import { useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SelectedFeatures from './components/SelectedFeatures'
import Testimonials from './components/Testimonials'
import ParallaxGallery from './components/ParallaxGallery'
import Stats from './components/Stats'
import ContactFooter from './components/ContactFooter'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        <Navbar />
        <Hero />
        <SelectedFeatures />
        <Testimonials />
        <ParallaxGallery />
        <Stats />
        <ContactFooter />
      </div>
    </>
  )
}
