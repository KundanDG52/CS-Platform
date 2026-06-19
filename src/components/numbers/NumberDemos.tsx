import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toBinary, divisionSteps, bitwiseOp, twosComplement } from '../../utils/cs'

// ─── Binary counter ──────────────────────────────────────────────────────────
export function BinaryCounter() {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 1, 0, 1, 0])
  const decimal = bits.reduce((acc, b, i) => acc + b * (1 << (7 - i)), 0)
  const toggle = (i: number) => setBits(prev => prev.map((b, j) => (j === i ? (b ? 0 : 1) : b)))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-1.5 flex-wrap">
        {bits.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.button onClick={() => toggle(i)} whileTap={{ scale: 0.9 }}
              className="bit-cell w-11 h-12 rounded text-lg border-2"
              animate={{ background: b ? '#00ff4122' : '#121212', borderColor: b ? '#00ff41' : '#262626', color: b ? '#00ff41' : '#444', boxShadow: b ? '0 0 14px #00ff4150' : 'none' }}>
              {b}
            </motion.button>
            <span className="text-[9px] text-white/30 font-mono">2^{7 - i}</span>
            <span className="text-[9px] text-amber/60 font-mono">{1 << (7 - i)}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <div className="text-xs text-white/40 mb-1">decimal value</div>
        <motion.div key={decimal} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-4xl font-black amber-text font-mono">{decimal}</motion.div>
        <div className="text-xs text-white/30 mt-1 font-mono">0x{decimal.toString(16).toUpperCase().padStart(2, '0')} · 0o{decimal.toString(8)}</div>
      </div>
      <p className="text-xs text-white/40 text-center">Click bits to toggle. Each position is a power of 2 — sum the active ones.</p>
    </div>
  )
}

// ─── Decimal → Binary division ───────────────────────────────────────────────
export function DecimalToBinary() {
  const [n, setN] = useState(42)
  const steps = divisionSteps(n)
  const binary = toBinary(n, Math.max(8, steps.length))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">n =</span>
        <input type="number" min={0} max={255} value={n} onChange={e => setN(Math.max(0, Math.min(255, +e.target.value || 0)))}
          className="w-24 bg-bg border border-term/30 rounded px-3 py-1.5 text-sm font-mono text-term outline-none focus:border-term" />
        <span className="ml-auto text-xs text-white/40">repeatedly ÷2, read remainders bottom→top</span>
      </div>
      <div className="font-mono text-sm flex flex-col gap-1">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2">
            <span className="text-white/50 w-20">{i === 0 ? n : steps[i - 1].quotient} ÷ 2</span>
            <span className="text-white/30">=</span>
            <span className="text-cyan w-8">{s.quotient}</span>
            <span className="text-white/30">rem</span>
            <motion.span initial={{ scale: 1.4, color: '#ffb300' }} animate={{ scale: 1 }} className="w-6 h-6 rounded flex items-center justify-center font-bold border border-amber/40 bg-amber/10 text-amber">{s.remainder}</motion.span>
          </motion.div>
        ))}
      </div>
      <div className="text-center pt-2 border-t border-term/10">
        <span className="text-xs text-white/40">binary = </span>
        <span className="text-lg font-bold term-text font-mono tracking-wider">{[...binary].slice(-steps.length).join('') || '0'}</span>
      </div>
    </div>
  )
}

// ─── Bitwise operations ──────────────────────────────────────────────────────
const OPS = ['AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR'] as const
export function BitwiseViz() {
  const [a, setA] = useState(12)
  const [b, setB] = useState(10)
  const [op, setOp] = useState<typeof OPS[number]>('AND')
  const result = bitwiseOp(a, b, op)
  const binary = (v: number) => toBinary(v, 8).split('')
  const unary = op === 'NOT' || op === 'SHL' || op === 'SHR'

  const Row = ({ label, val, color = '#fff' }: { label: string; val: number; color?: string }) => (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs text-white/40 font-mono">{label}</span>
      <div className="flex gap-1">
        {binary(val).map((bit, i) => (
          <div key={i} className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono border" style={{ borderColor: bit === '1' ? `${color}60` : '#262626', background: bit === '1' ? `${color}18` : 'transparent', color: bit === '1' ? color : '#444' }}>{bit}</div>
        ))}
      </div>
      <span className="ml-2 text-xs font-mono" style={{ color }}>= {val}</span>
    </div>
  )
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {OPS.map(o => <button key={o} onClick={() => setOp(o)} className="px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all" style={{ background: op === o ? '#ffb30020' : 'rgba(255,255,255,0.04)', border: op === o ? '1px solid #ffb30050' : '1px solid transparent', color: op === o ? '#ffb300' : 'rgba(255,255,255,0.5)' }}>{o}</button>)}
      </div>
      <div className="flex gap-3 items-center">
        <label className="text-xs text-white/40">A<input type="number" min={0} max={255} value={a} onChange={e => setA(Math.max(0, Math.min(255, +e.target.value || 0)))} className="ml-1 w-16 bg-bg border border-term/30 rounded px-2 py-1 text-xs font-mono text-term outline-none" /></label>
        {!unary && <label className="text-xs text-white/40">B<input type="number" min={0} max={255} value={b} onChange={e => setB(Math.max(0, Math.min(255, +e.target.value || 0)))} className="ml-1 w-16 bg-bg border border-term/30 rounded px-2 py-1 text-xs font-mono text-term outline-none" /></label>}
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <Row label="A" val={a} color="#00ff41" />
        {!unary && <Row label="B" val={b} color="#00e5ff" />}
        <div className="border-t border-white/10 my-0.5" />
        <Row label={op} val={result} color="#ffb300" />
      </div>
    </div>
  )
}

// ─── Two's complement ────────────────────────────────────────────────────────
export function TwosComplementViz() {
  const [n, setN] = useState(5)
  const [phase, setPhase] = useState(0) // 0 mag, 1 invert, 2 +1
  const tc = twosComplement(n)
  const shown = phase === 0 ? tc.original : phase === 1 ? tc.inverted : tc.result
  const labels = ['|n| in binary', 'invert all bits (~)', 'add 1 → -n']
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">encode −</span>
        <input type="number" min={1} max={128} value={n} onChange={e => { setN(Math.max(1, Math.min(128, +e.target.value || 1))); setPhase(0) }} className="w-20 bg-bg border border-term/30 rounded px-2 py-1 text-sm font-mono text-term outline-none" />
        <span className="text-xs text-white/40">as 8-bit two's complement</span>
      </div>
      <div className="flex justify-center gap-1">
        {shown.split('').map((bit, i) => (
          <motion.div key={`${phase}-${i}`} initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ delay: i * 0.04 }}
            className="w-9 h-10 rounded flex items-center justify-center text-base font-bold font-mono border-2"
            style={{ borderColor: bit === '1' ? '#ff2e9760' : '#262626', background: bit === '1' ? '#ff2e9718' : 'transparent', color: bit === '1' ? '#ff2e97' : '#444' }}>{bit}</motion.div>
        ))}
      </div>
      <div className="text-center text-xs font-mono" style={{ color: '#ff2e97' }}>{labels[phase]}</div>
      <div className="flex justify-center gap-2">
        {labels.map((_, i) => <button key={i} onClick={() => setPhase(i)} className="w-8 h-1.5 rounded-full transition-all" style={{ background: phase >= i ? '#ff2e97' : '#262626' }} />)}
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={() => setPhase(p => Math.max(0, p - 1))} className="btn-ghost text-xs">◀ prev</button>
        <button onClick={() => setPhase(p => Math.min(2, p + 1))} className="btn-term text-xs">next ▶</button>
      </div>
    </div>
  )
}
