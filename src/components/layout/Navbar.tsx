import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, Flame, Terminal } from 'lucide-react'
import { useStore } from '../../store'
import { SECTIONS, getLevelFromXP, getXPToNextLevel, LEVEL_TITLES } from '../../utils/constants'

export function Navbar() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const xp = useStore(s => s.xp)
  const streak = useStore(s => s.streak)
  const level = getLevelFromXP(xp)
  const { percent } = getXPToNextLevel(xp)
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]

  return (
    <header className="fixed top-0 inset-x-0 z-50 panel border-b" style={{ borderColor: '#00ff4120', background: 'rgba(13,13,13,0.92)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Terminal size={18} className="text-term term-text" />
          <span className="hidden sm:block text-term font-extrabold text-sm tracking-tight term-text">CS://terminal</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-2">
          {SECTIONS.map(s => {
            const active = loc.pathname === s.path
            return (
              <Link key={s.path} to={s.path} className="relative px-2.5 py-1.5 rounded text-[11px] font-medium transition-all" style={{ color: active ? s.color : 'rgba(255,255,255,0.45)' }}>
                {active && <motion.div layoutId="nav-ind" className="absolute inset-0 rounded" style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }} />}
                <span className="relative">{s.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {streak > 0 && <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber"><Flame size={12} /> {streak}d</div>}
          <Link to="/" className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 border" style={{ borderColor: '#00ff4130', background: '#00ff4108' }}>
            <Zap size={11} className="text-term" />
            <span className="text-xs font-bold text-term">{xp.toLocaleString()}</span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-term" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8 }} /></div>
            <span className="text-[10px] text-white/40">L{level}·{title}</span>
          </Link>
          <Link to="/puzzles" className="btn-ghost text-xs hidden md:block">puzzles</Link>
          <button className="lg:hidden p-1.5 rounded hover:bg-white/10 text-term" onClick={() => setOpen(v => !v)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t overflow-hidden" style={{ borderColor: '#00ff4120' }}>
            <nav className="p-3 flex flex-col gap-1">
              {SECTIONS.map(s => (
                <Link key={s.path} to={s.path} onClick={() => setOpen(false)} className="px-3 py-2 rounded text-sm font-medium" style={{ color: loc.pathname === s.path ? s.color : 'rgba(255,255,255,0.6)', background: loc.pathname === s.path ? `${s.color}10` : 'transparent' }}>{s.name}</Link>
              ))}
              <Link to="/puzzles" onClick={() => setOpen(false)} className="px-3 py-2 rounded text-sm font-medium text-white/60">Puzzles</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
