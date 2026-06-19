import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Flame, Trophy, Clock, ChevronRight } from 'lucide-react'
import { SECTIONS, getLevelFromXP, getXPToNextLevel, LEVEL_TITLES } from '../utils/constants'
import { useStore } from '../store'
import { Badge, Stars, Ring } from '../components/shared/Badge'

const BOOT_LINES = [
  '> initializing cs://terminal v1.0.0',
  '> loading modules: numbers logic computer os network...',
  '> mounting /knowledge ... OK',
  '> 7 sections online. ready.',
]

function Hero() {
  const [typed, setTyped] = useState<string[]>([])
  useEffect(() => {
    let i = 0
    const id = setInterval(() => { setTyped(p => [...p, BOOT_LINES[i]]); i++; if (i >= BOOT_LINES.length) clearInterval(id) }, 350)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden grid-bg">
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-7">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chip animate-pulse-term">// interactive computer science</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black font-mono term-text leading-tight">
          Learn CS<br /><span className="amber-text">from the metal up</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/50 max-w-2xl leading-relaxed text-sm md:text-base">
          Binary, logic gates, CPU internals, operating systems, networks, compilers & databases — every concept as a hands-on, animated terminal demo.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex flex-wrap gap-3 justify-center">
          <Link to="/numbers" className="btn-term flex items-center gap-2 font-bold">./start <ArrowRight size={15} /></Link>
          <Link to="/puzzles" className="btn-amber">./puzzles</Link>
        </motion.div>
        <div className="panel rounded-lg p-4 text-left w-full max-w-md font-mono text-xs text-term/70 min-h-[110px]">
          {typed.map((l, i) => <div key={i}>{l}</div>)}
          <span className="animate-blink">█</span>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const { xp, streak, achievements } = useStore()
  const level = getLevelFromXP(xp)
  const { current, needed, percent } = getXPToNextLevel(xp)
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
  const earned = achievements.filter(a => a.earned).length
  return (
    <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="panel rounded-lg p-5 md:col-span-2 flex items-center gap-6">
        <Ring percent={percent} size={72} stroke={6} color="#00ff41" label={`L${level}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2 text-sm"><span className="font-bold text-term">{title}</span><span className="flex items-center gap-1 text-term"><Zap size={13} /> {xp.toLocaleString()} XP</span></div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden border border-term/20"><motion.div className="h-full bg-term" style={{ boxShadow: '0 0 8px #00ff41' }} initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.2, delay: 0.3 }} /></div>
          <div className="flex justify-between mt-1.5 text-xs text-white/30"><span>{current} XP</span><span>{needed} → L{level + 1}</span></div>
        </div>
      </div>
      <div className="panel rounded-lg p-5 flex flex-col justify-around">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded flex items-center justify-center border border-amber/30 bg-amber/10"><Flame size={18} className="text-amber" /></div><div><div className="text-2xl font-black text-amber">{streak}</div><div className="text-xs text-white/40">day streak</div></div></div>
        <div className="flex items-center gap-3 mt-2"><div className="w-10 h-10 rounded flex items-center justify-center border border-magenta/30 bg-magenta/10"><Trophy size={18} className="text-magenta" /></div><div><div className="text-2xl font-black text-magenta">{earned}</div><div className="text-xs text-white/40">badges</div></div></div>
      </div>
      <div className="panel rounded-lg p-5 md:col-span-3">
        <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-wider">// achievements</h3>
        <div className="flex flex-wrap gap-4">{achievements.map(a => <Badge key={a.id} {...a} />)}</div>
      </div>
    </section>
  )
}

function SectionGrid() {
  const progress = useStore(s => s.sectionProgress)
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-bold text-term font-mono">// curriculum</h2>
        <span className="text-xs text-white/30">{Object.values(progress).filter(p => p.completed).length}/{SECTIONS.length} complete</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s, i) => {
          const pct = progress[s.id]?.completed ? 100 : 0
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={s.path} className="panel rounded-lg p-5 block hover:-translate-y-1 transition-transform group" style={{ borderColor: pct ? `${s.color}40` : undefined }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded flex items-center justify-center text-lg font-bold font-mono" style={{ background: `${s.color}12`, border: `1px solid ${s.color}40`, color: s.color }}>{s.icon}</div>
                  <Ring percent={pct} size={40} stroke={4} color={s.color} label={`${pct}%`} />
                </div>
                <h3 className="font-bold text-base mb-1 font-mono" style={{ color: pct ? s.color : 'white' }}>{s.name}</h3>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1.5"><Stars n={s.difficulty} color={s.color} /><span className="flex items-center gap-1 text-xs text-white/30"><Clock size={10} /> {s.estimatedMinutes}min</span></div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">{s.topics.slice(0, 3).map(t => <span key={t} className="chip" style={{ borderColor: `${s.color}30`, color: `${s.color}cc` }}>{t}</span>)}</div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export function Home() {
  return <div><Hero /><Stats /><SectionGrid /></div>
}
