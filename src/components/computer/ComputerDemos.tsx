import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import { runProgram, DEMO_PROGRAM, type CPUSnapshot } from './cpu'

// ─── CPU simulator ───────────────────────────────────────────────────────────
const PHASE_COLOR = { fetch: '#00e5ff', decode: '#ffb300', execute: '#00ff41' }

export function CPUSimulator() {
  const [src, setSrc] = useState(DEMO_PROGRAM)
  const [steps, setSteps] = useState<CPUSnapshot[]>(() => runProgram(DEMO_PROGRAM.split('\n')))
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const cur = steps[i]
  const lines = src.split('\n')

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => setI(p => { if (p >= steps.length - 1) { setPlaying(false); return p } return p + 1 }), 600)
    } else if (timer.current) clearInterval(timer.current)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [playing, steps.length])

  function assemble() { const s = runProgram(src.split('\n')); setSteps(s); setI(0); setPlaying(false) }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* code */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">program.asm</div>
          <div className="panel rounded p-2 font-mono text-xs" style={{ borderColor: '#00ff4120' }}>
            {lines.map((l, idx) => (
              <div key={idx} className="flex gap-2 px-1 rounded" style={{ background: cur?.pc === idx ? '#00ff4118' : 'transparent' }}>
                <span className="text-white/20 w-5 text-right">{idx}</span>
                <span style={{ color: cur?.pc === idx ? '#00ff41' : 'rgba(255,255,255,0.6)' }}>{l || ' '}</span>
                {cur?.pc === idx && <ChevronRight size={12} className="text-term ml-auto" />}
              </div>
            ))}
          </div>
          <textarea value={src} onChange={e => setSrc(e.target.value)} spellCheck={false}
            className="mt-2 w-full h-20 bg-bg border border-term/20 rounded p-2 font-mono text-[11px] text-term/80 outline-none focus:border-term/50 resize-none" />
          <button onClick={assemble} className="btn-term text-xs mt-1">⚙ assemble</button>
        </div>
        {/* registers + ALU */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {['AX', 'BX', 'CX', 'DX'].map(r => {
              const v = cur?.registers[r] ?? 0
              return (
                <div key={r} className="panel rounded p-2 flex items-center justify-between" style={{ borderColor: '#00e5ff25' }}>
                  <span className="text-xs text-cyan font-bold">{r}</span>
                  <motion.span key={v} initial={{ scale: 1.3, color: '#ffb300' }} animate={{ scale: 1, color: '#fff' }} className="font-mono font-bold">{v}</motion.span>
                </div>
              )
            })}
          </div>
          {/* ALU */}
          <div className="panel rounded p-3 text-center" style={{ borderColor: '#00ff4125' }}>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">ALU</div>
            <AnimatePresence mode="wait">
              {cur?.alu ? (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="font-mono text-term">
                  {cur.alu.a} {cur.alu.op} {cur.alu.b} = <span className="amber-text font-bold">{cur.alu.result}</span>
                </motion.div>
              ) : <motion.div className="font-mono text-white/20 text-sm">idle</motion.div>}
            </AnimatePresence>
          </div>
          {/* control unit phase */}
          <div className="flex gap-2">
            {(['fetch', 'decode', 'execute'] as const).map(p => (
              <div key={p} className="flex-1 text-center py-1.5 rounded text-[10px] font-bold uppercase transition-all"
                style={{ background: cur?.phase === p ? `${PHASE_COLOR[p]}22` : 'rgba(255,255,255,0.03)', border: `1px solid ${cur?.phase === p ? PHASE_COLOR[p] : '#262626'}`, color: cur?.phase === p ? PHASE_COLOR[p] : '#555' }}>{p}</div>
            ))}
          </div>
          {/* output */}
          <div className="panel rounded p-2" style={{ borderColor: '#ffb30025' }}>
            <span className="text-[10px] text-white/40">OUT: </span>
            <span className="font-mono text-amber">{cur?.output.join(' · ') || '—'}</span>
          </div>
        </div>
      </div>
      <div className="font-mono text-xs text-white/60 bg-bg/60 rounded px-3 py-2 border border-term/10 min-h-[34px]">{cur?.note}</div>
      <div className="flex items-center gap-2">
        <button onClick={() => { setI(0); setPlaying(false) }} className="btn-ghost"><RotateCcw size={13} /></button>
        <button onClick={() => setPlaying(p => !p)} className="btn-term flex items-center gap-1.5 text-xs">{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? 'pause' : 'run'}</button>
        <button onClick={() => setI(p => Math.min(steps.length - 1, p + 1))} className="btn-ghost text-xs">step ▶</button>
        <span className="ml-auto text-xs text-white/30 font-mono">{i + 1}/{steps.length}</span>
      </div>
    </div>
  )
}

// ─── Memory hierarchy ────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Register', latency: '< 1 ns', size: '< 1 KB', w: 20, color: '#00ff41' },
  { name: 'L1 Cache', latency: '~1 ns', size: '32–64 KB', w: 32, color: '#00ff41' },
  { name: 'L2 Cache', latency: '~4 ns', size: '256 KB–1 MB', w: 46, color: '#00e5ff' },
  { name: 'L3 Cache', latency: '~12 ns', size: '8–32 MB', w: 60, color: '#00e5ff' },
  { name: 'RAM', latency: '~100 ns', size: '8–64 GB', w: 76, color: '#ffb300' },
  { name: 'SSD', latency: '~100 µs', size: '256 GB–4 TB', w: 92, color: '#ff2e97' },
]
export function MemoryHierarchy() {
  const [sel, setSel] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1.5">
        {TIERS.map((t, i) => (
          <motion.button key={t.name} onClick={() => setSel(i)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded flex items-center justify-center text-xs font-bold font-mono py-2 transition-all"
            style={{ width: `${t.w}%`, background: sel === i ? `${t.color}25` : `${t.color}0c`, border: `1px solid ${sel === i ? t.color : t.color + '40'}`, color: t.color, boxShadow: sel === i ? `0 0 14px ${t.color}40` : 'none' }}>
            {t.name}
          </motion.button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/30 px-2"><span>↑ faster · smaller · costlier</span><span>slower · bigger · cheaper ↓</span></div>
      <div className="panel rounded p-3 text-center" style={{ borderColor: `${TIERS[sel].color}30` }}>
        <span className="font-bold" style={{ color: TIERS[sel].color }}>{TIERS[sel].name}</span>
        <span className="text-white/50 text-sm ml-2">latency {TIERS[sel].latency} · capacity {TIERS[sel].size}</span>
      </div>
    </div>
  )
}

// ─── Cache hit/miss ──────────────────────────────────────────────────────────
export function CacheSim() {
  const CACHE_SIZE = 4
  const [cache, setCache] = useState<number[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [last, setLast] = useState<{ addr: number; hit: boolean } | null>(null)
  const total = hits + misses

  function access(addr: number) {
    const hit = cache.includes(addr)
    setLast({ addr, hit })
    if (hit) { setHits(h => h + 1); setCache(c => [addr, ...c.filter(x => x !== addr)]) }
    else { setMisses(m => m + 1); setCache(c => [addr, ...c].slice(0, CACHE_SIZE)) }
  }
  function reset() { setCache([]); setHits(0); setMisses(0); setLast(null) }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-white/40">access a memory block (LRU cache, {CACHE_SIZE} slots):</div>
      <div className="flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(a => <button key={a} onClick={() => access(a)} className="w-9 h-9 rounded font-mono text-sm font-bold border border-term/30 text-term/70 hover:bg-term/10 transition-all">{a}</button>)}
      </div>
      <div>
        <div className="text-[10px] text-white/40 mb-1">cache (MRU → LRU)</div>
        <div className="flex gap-1.5">
          {Array.from({ length: CACHE_SIZE }).map((_, idx) => {
            const v = cache[idx]
            return <motion.div key={idx} layout className="w-12 h-12 rounded flex items-center justify-center font-mono font-bold border-2"
              style={{ borderColor: v !== undefined ? '#00e5ff60' : '#262626', background: v !== undefined ? '#00e5ff15' : 'transparent', color: v !== undefined ? '#00e5ff' : '#333' }}>{v ?? '·'}</motion.div>
          })}
        </div>
      </div>
      {last && <motion.div key={`${last.addr}-${total}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono" style={{ color: last.hit ? '#00ff41' : '#ff2e97' }}>access[{last.addr}] → {last.hit ? 'HIT ✓' : 'MISS ✗ (loaded into cache)'}</motion.div>}
      <div className="flex gap-4 text-xs font-mono">
        <span className="text-term">hits: {hits}</span><span className="text-magenta">misses: {misses}</span>
        <span className="text-amber">hit rate: {total ? Math.round((hits / total) * 100) : 0}%</span>
        <button onClick={reset} className="btn-ghost text-xs ml-auto">reset</button>
      </div>
    </div>
  )
}
