import { useState } from 'react'
import { products, type Product } from '../data/content'
import { Button } from './Button'
import { CartIcon } from './Icons'
import { Reveal } from './Reveal'
import { Tilt } from './Tilt'

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const [clicks, setClicks] = useState(0)

  return (
    <article className="group overflow-hidden rounded-md bg-[#fbf8f4] shadow-[0_6px_20px_rgba(60,35,20,.06)] transition-all duration-500 ease-smooth hover:-translate-y-2.5 hover:shadow-[0_22px_40px_rgba(60,35,20,.18)]">
      <div className="aspect-square overflow-hidden bg-roast">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-1000 ease-smooth group-hover:scale-112 group-hover:rotate-2"
        />
      </div>
      <div className="flex items-end justify-between px-4 pt-4 pb-5">
        <div>
          <h4 className="mb-1.5 text-sm font-medium text-roast">{product.name}</h4>
          <span className="text-[13px] text-latte">${product.price.toFixed(2)}</span>
        </div>
        <button
          // Remounting on each click replays the press animation.
          key={clicks}
          aria-label={`Add ${product.name} to cart`}
          onClick={() => {
            setClicks((c) => c + 1)
            onAdd()
          }}
          className={`grid size-8 place-items-center rounded-md border border-roast bg-gold-light transition hover:scale-110 hover:bg-roast hover:text-gold
            ${clicks ? 'animate-added' : ''}`}
        >
          <CartIcon className="size-[17px]" />
        </button>
      </div>
    </article>
  )
}

export function Signature({ onAddToCart }: { onAddToCart: () => void }) {
  return (
    <section id="menu" className="grid items-center gap-12 bg-cream-2 px-4 py-20 sm:px-[7%] lg:grid-cols-[1fr_2.4fr]">
      <Reveal>
        <p className="mb-4 text-[11px] font-medium tracking-[.22em] text-mocha">OUR SIGNATURE</p>
        <h2 className="mb-5 font-serif text-[clamp(2rem,3vw,2.6rem)] leading-tight font-normal text-roast">Coffee Favorites</h2>
        <p className="mb-8 leading-relaxed text-[#5a483b]">
          From rich espressos to creamy lattes, our menu is crafted to bring out the best in every bean.
        </p>
        <Button variant="dark" arrow>View Full Menu</Button>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.name} delay={0.15 + i * 0.12}>
            <Tilt>
              <ProductCard product={p} onAdd={onAddToCart} />
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
