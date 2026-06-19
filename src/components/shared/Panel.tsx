import { motion } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

export function Panel({ children, className = '', delay = 0, glow, color = '#00ff41', onClick, hover, style }: {
  children: ReactNode; className?: string; delay?: number; glow?: boolean; color?: string; onClick?: () => void; hover?: boolean; style?: CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -3 } : undefined} onClick={onClick}
      className={`panel rounded-lg ${glow ? 'glow-term' : ''} ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{ borderColor: `${color}25`, ...style }}
    >
      {children}
    </motion.div>
  )
}

/** Terminal-style titled window with traffic-light dots */
export function TermWindow({ title, color = '#00ff41', children, className = '', delay = 0 }: {
  title: string; color?: string; children: ReactNode; className?: string; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.4, delay }}
      className={`panel rounded-lg overflow-hidden ${className}`} style={{ borderColor: `${color}25` }}>
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: `${color}20`, background: `${color}08` }}>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-magenta/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-term/70" />
        </div>
        <span className="text-xs font-semibold ml-1" style={{ color }}>{title}</span>
        <span className="ml-auto text-[10px] text-white/20 font-mono">~/cs</span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

export function SectionHeader({ icon, name, sub, color }: { icon: string; name: string; sub: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
      <div className="w-11 h-11 rounded flex items-center justify-center text-lg font-bold font-mono" style={{ background: `${color}12`, border: `1px solid ${color}40`, color }}>{icon}</div>
      <div>
        <h1 className="text-2xl font-black font-mono" style={{ color }}>{name}<span className="animate-blink" style={{ color }}>_</span></h1>
        <p className="text-white/40 text-sm">{sub}</p>
      </div>
    </motion.div>
  )
}
