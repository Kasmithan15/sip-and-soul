import { useEffect, useState } from 'react'
import { BeanIntro } from './components/BeanIntro'
import { Cta } from './components/Cta'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Signature } from './components/Signature'
import { Stats } from './components/Stats'
import { Story } from './components/Story'

export default function App() {
  // The 3D bean intro stays until the visitor clicks, then the site shows straight away.
  const [entered, setEntered] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden'
    if (!entered) window.scrollTo(0, 0)
  }, [entered])

  const addToCart = () => setCartCount((c) => c + 1)

  if (!entered) return <BeanIntro onEnter={() => setEntered(true)} />

  return (
    <>
      <Header cartCount={cartCount} />
      <main>
        <Hero show />
        <Features />
        <Signature onAddToCart={addToCart} />
        <Story />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
