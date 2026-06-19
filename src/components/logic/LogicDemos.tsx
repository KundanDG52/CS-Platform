import { useState } from 'react'
import { motion } from 'framer-motion'
import { evalGate, halfAdder, fullAdder, type GateType } from '../../utils/cs'

const GATES: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR']
const SYMBOL: Record<GateType, string> = { AND: '∧', OR: '∨', NOT: '¬', NAND: '⊼', NOR: '⊽', XOR: '⊕', XNOR: '⊙' }

function Wire({ on, w = 40 }: { on: boolean; w?: number }) {
  return <div className="h-0.5 rounded-full transition-all" style={{ width: w, background: on ? '#00ff41' : '#333', boxShadow: on ? '0 0 6px #00ff41' : 'none' }} />
}
function Pin({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 transition-all"
    style={{ borderColor: on ? '#00ff41' : '#333', background: on ? '#00ff4122' : '#121212', color: on ? '#00ff41' : '#555', boxShadow: on ? '0 0 10px #00ff4140' : 'none', cursor: onClick ? 'pointer' : 'default' }}>{on ? 1 : 0}</button>
}

// ─── Gate explorer + truth table ─────────────────────────────────────────────
export function GateExplorer() {
  const [gate, setGate] = useState<GateType>('XOR')
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const unary = gate === 'NOT'
  const out = evalGate(gate, a, b)
  const rows = unary ? [[false], [true]] : [[false, false], [false, true], [true, false], [true, true]]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {GATES.map(g => <button key={g} onClick={() => setGate(g)} className="px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all"
          style={{ background: gate === g ? '#00ff4120' : 'rgba(255,255,255,0.04)', border: gate === g ? '1px solid #00ff4150' : '1px solid transparent', color: gate === g ? '#00ff41' : 'rgba(255,255,255,0.5)' }}>{g}</button>)}
      </div>
      {/* circuit */}
      <div className="flex items-center justify-center gap-1 py-4">
        <div className="flex flex-col gap-3">
          <Pin on={a} onClick={() => setA(v => !v)} />
          {!unary && <Pin on={b} onClick={() => setB(v => !v)} />}
        </div>
        <div className="flex flex-col gap-3 justify-center"><Wire on={a} />{!unary && <Wire on={b} />}</div>
        <div className="relative w-20 h-16 rounded-lg flex items-center justify-center font-mono font-bold text-2xl border-2" style={{ borderColor: '#00ff4150', background: '#00ff410a', color: '#00ff41' }}>
          {SYMBOL[gate]}
          <span className="absolute -bottom-5 text-[10px] text-white/40">{gate}</span>
        </div>
        <Wire on={out} />
        <motion.div animate={{ scale: out ? 1.1 : 1 }}><Pin on={out} /></motion.div>
      </div>
      {/* truth table */}
      <table className="text-xs font-mono w-full">
        <thead><tr className="text-white/40 border-b border-white/10">{!unary && <><th className="py-1">A</th><th>B</th></>}{unary && <th className="py-1">A</th>}<th className="text-term">OUT</th></tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const o = evalGate(gate, r[0], r[1] ?? false)
            const active = unary ? r[0] === a : r[0] === a && r[1] === b
            return <tr key={i} style={{ background: active ? '#00ff4112' : 'transparent' }}>
              {r.map((v, j) => <td key={j} className="text-center py-1" style={{ color: v ? '#00ff41' : '#555' }}>{v ? 1 : 0}</td>)}
              <td className="text-center py-1 font-bold" style={{ color: o ? '#ffb300' : '#555' }}>{o ? 1 : 0}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Adders ──────────────────────────────────────────────────────────────────
export function AdderViz() {
  const [mode, setMode] = useState<'half' | 'full'>('half')
  const [a, setA] = useState(true)
  const [b, setB] = useState(true)
  const [cin, setCin] = useState(false)
  const res = mode === 'half' ? halfAdder(a, b) : fullAdder(a, b, cin)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['half', 'full'] as const).map(m => <button key={m} onClick={() => setMode(m)} className="px-3 py-1 rounded text-xs font-semibold font-mono transition-all"
          style={{ background: mode === m ? '#ffb30020' : 'rgba(255,255,255,0.04)', border: mode === m ? '1px solid #ffb30050' : '1px solid transparent', color: mode === m ? '#ffb300' : 'rgba(255,255,255,0.5)' }}>{m} adder</button>)}
      </div>
      <div className="flex items-center justify-around py-2">
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2"><span className="text-xs text-white/40 w-6">A</span><Pin on={a} onClick={() => setA(v => !v)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-white/40 w-6">B</span><Pin on={b} onClick={() => setB(v => !v)} /></div>
          {mode === 'full' && <div className="flex items-center gap-2"><span className="text-xs text-white/40 w-6">Cin</span><Pin on={cin} onClick={() => setCin(v => !v)} /></div>}
        </div>
        <div className="text-2xl text-white/20">→</div>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2"><span className="text-xs text-amber w-12">Sum</span><motion.div animate={{ scale: res.sum ? 1.1 : 1 }}><Pin on={res.sum} /></motion.div></div>
          <div className="flex items-center gap-2"><span className="text-xs text-amber w-12">Carry</span><motion.div animate={{ scale: res.carry ? 1.1 : 1 }}><Pin on={res.carry} /></motion.div></div>
        </div>
      </div>
      <div className="text-center text-xs font-mono text-white/50">
        {mode === 'half' ? 'Sum = A ⊕ B · Carry = A ∧ B' : 'Sum = A ⊕ B ⊕ Cin · Carry = AB + Cin(A⊕B)'}
      </div>
      <div className="text-center text-sm font-mono">
        <span className="text-white/40">decimal: </span>
        <span className="text-term">{(a ? 1 : 0)} + {(b ? 1 : 0)}{mode === 'full' ? ` + ${cin ? 1 : 0}` : ''} = </span>
        <span className="amber-text font-bold">{(res.carry ? 2 : 0) + (res.sum ? 1 : 0)}</span>
        <span className="text-white/40"> (binary {res.carry ? 1 : 0}{res.sum ? 1 : 0})</span>
      </div>
    </div>
  )
}
