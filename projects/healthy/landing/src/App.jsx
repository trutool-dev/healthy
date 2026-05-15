import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import CtaFooter from './components/CtaFooter'

export default function App() {
  return (
    <main className="bg-[#080808] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <CtaFooter />
    </main>
  )
}
