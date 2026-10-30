import { stats, type Stat } from '../data/content'
import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

function StatItem({ stat, visible, className }: { stat: Stat; visible: boolean; className: string }) {
  const value = useCountUp(stat.value, visible)

  return (
    <div className={`text-center ${className}`}>
      <h3 className="font-serif text-[2.2rem] font-normal text-roast">
        {value.toFixed(stat.decimals ?? 0)}
        {stat.suffix}
      </h3>
      <p className="mt-1 text-xs text-latte">{stat.label}</p>
    </div>
  )
}

export function Stats() {
  const { ref, inView } = useInView<HTMLElement>(0.5)

  return (
    <section ref={ref} className="grid grid-cols-2 gap-y-10 bg-cream px-4 py-14 sm:px-[7%] lg:grid-cols-4">
      {stats.map((s, i) => (
        <StatItem
          key={s.label}
          stat={s}
          visible={inView}
          className={`${i % 2 === 0 ? 'border-r border-line' : ''} ${i === 1 ? 'lg:border-r lg:border-line' : ''}`}
        />
      ))}
    </section>
  )
}
