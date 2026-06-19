import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { btreeInsert, emptyBTree, btreeLevels, type BTreeNode } from './btree'

// ─── B-Tree ──────────────────────────────────────────────────────────────────
function cloneTree(n: BTreeNode): BTreeNode { return { keys: [...n.keys], leaf: n.leaf, children: n.children.map(cloneTree) } }
export function BTreeViz() {
  const [root, setRoot] = useState<BTreeNode>(() => {
    let r = emptyBTree();[10, 20, 5, 6, 12, 30].forEach(k => { r = btreeInsert(r, k) }); return r
  })
  const [val, setVal] = useState('')
  const [last, setLast] = useState<number | null>(null)
  const levels = btreeLevels(root)

  function insert(k: number) {
    if (isNaN(k)) return
    setRoot(prev => btreeInsert(cloneTree(prev), k))
    setLast(k)
  }
  function reset() { let r = emptyBTree();[10, 20, 5, 6, 12, 30].forEach(k => { r = btreeInsert(r, k) }); setRoot(r); setLast(null) }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { insert(+val); setVal('') } }} placeholder="key" className="w-24 bg-bg border border-term/30 rounded px-2 py-1 text-sm font-mono text-term outline-none focus:border-term" />
        <button onClick={() => { insert(+val); setVal('') }} className="btn-term text-xs">insert</button>
        <button onClick={() => insert(Math.floor(Math.random() * 99) + 1)} className="btn-ghost text-xs">random</button>
        <button onClick={reset} className="btn-ghost text-xs ml-auto">reset</button>
      </div>
      <div className="flex flex-col gap-5 items-center py-4 overflow-x-auto">
        {levels.map((level, li) => (
          <div key={li} className="flex gap-4 justify-center">
            {level.map((node, ni) => (
              <motion.div key={`${li}-${ni}-${node.keys.join()}`} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex rounded overflow-hidden border-2" style={{ borderColor: '#00e5ff50' }}>
                {node.keys.map((k, ki) => (
                  <div key={ki} className="px-2.5 py-1.5 font-mono text-sm font-bold border-r border-cyan/20 last:border-r-0"
                    style={{ background: k === last ? '#ffb30025' : '#00e5ff10', color: k === last ? '#ffb300' : '#00e5ff' }}>{k}</div>
                ))}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-white/40 text-center">Order-4 B-Tree (max 3 keys/node). When a node overflows, its median key is pushed up and the node splits — keeping the tree balanced for O(log n) lookups.</p>
    </div>
  )
}

// ─── CAP theorem ─────────────────────────────────────────────────────────────
const CAP = { C: 'Consistency', A: 'Availability', P: 'Partition Tolerance' }
const PAIRS: Record<string, { name: string; examples: string }> = {
  CA: { name: 'CA', examples: 'Single-node RDBMS (Postgres, MySQL) — no partition tolerance' },
  CP: { name: 'CP', examples: 'MongoDB, HBase, Redis — sacrifice availability during partitions' },
  AP: { name: 'AP', examples: 'Cassandra, DynamoDB, CouchDB — stay available, eventual consistency' },
}
export function CAPTheorem() {
  const [picked, setPicked] = useState<string[]>(['C', 'P'])
  function toggle(k: string) {
    setPicked(prev => prev.includes(k) ? prev.filter(x => x !== k) : prev.length >= 2 ? [prev[1], k] : [...prev, k])
  }
  const key = ['C', 'A', 'P'].filter(k => picked.includes(k)).join('')
  const result = PAIRS[key]
  const pos: Record<string, { x: number; y: number; c: string }> = { C: { x: 110, y: 30, c: '#00ff41' }, A: { x: 30, y: 165, c: '#ffb300' }, P: { x: 190, y: 165, c: '#00e5ff' } }
  return (
    <div className="flex flex-col gap-3 items-center">
      <svg viewBox="0 0 220 200" className="w-56">
        <polygon points="110,30 30,165 190,165" fill="none" stroke="#262626" strokeWidth="1.5" />
        {picked.length === 2 && <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} x1={pos[picked[0]].x} y1={pos[picked[0]].y} x2={pos[picked[1]].x} y2={pos[picked[1]].y} stroke="#ffb300" strokeWidth="2" strokeDasharray="4" />}
        {Object.entries(pos).map(([k, p]) => {
          const on = picked.includes(k)
          return <g key={k} onClick={() => toggle(k)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r="24" fill={on ? `${p.c}25` : '#121212'} stroke={on ? p.c : '#333'} strokeWidth="2" style={{ filter: on ? `drop-shadow(0 0 6px ${p.c})` : 'none' }} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="bold" fill={on ? p.c : '#555'} fontFamily="JetBrains Mono">{k}</text>
          </g>
        })}
      </svg>
      <div className="text-xs text-white/40">pick 2 of 3 · {picked.map(k => CAP[k as keyof typeof CAP]).join(' + ') || '—'}</div>
      <AnimatePresence mode="wait">
        {result && <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="panel rounded p-3 text-center w-full" style={{ borderColor: '#ffb30030' }}>
          <span className="amber-text font-bold font-mono">{result.name}</span>
          <p className="text-xs text-white/55 mt-1">{result.examples}</p>
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}

// ─── ACID ────────────────────────────────────────────────────────────────────
const ACID = [
  { k: 'A', name: 'Atomicity', d: 'All-or-nothing — partial transactions roll back', color: '#00ff41' },
  { k: 'C', name: 'Consistency', d: 'Constraints always hold before & after', color: '#00e5ff' },
  { k: 'I', name: 'Isolation', d: 'Concurrent txns don\'t interfere', color: '#ffb300' },
  { k: 'D', name: 'Durability', d: 'Committed data survives crashes', color: '#ff2e97' },
]
export function ACIDViz() {
  const [phase, setPhase] = useState<'idle' | 'begin' | 'work' | 'commit' | 'rollback'>('idle')
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 font-mono text-xs flex-wrap justify-center">
        {['BEGIN', 'UPDATE', phase === 'rollback' ? 'ROLLBACK' : 'COMMIT'].map((s, i) => (
          <span key={s} className="px-2 py-1 rounded" style={{ background: (phase !== 'idle') ? (s.includes('ROLL') ? '#ff2e9720' : '#00ff4115') : '#1a1a1a', color: s.includes('ROLL') ? '#ff2e97' : '#00ff41', opacity: phase === 'idle' ? 0.4 : 1 }}>{s}{i < 2 && ' →'}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACID.map(a => <div key={a.k} className="panel rounded p-2.5" style={{ borderColor: `${a.color}30` }}>
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center font-bold font-mono text-xs" style={{ background: `${a.color}20`, color: a.color }}>{a.k}</span><span className="text-sm font-semibold" style={{ color: a.color }}>{a.name}</span></div>
          <p className="text-[11px] text-white/45 mt-1">{a.d}</p>
        </div>)}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setPhase('commit')} className="btn-term text-xs">▶ commit txn</button>
        <button onClick={() => setPhase('rollback')} className="btn-amber text-xs" style={{ color: '#ff2e97', borderColor: '#ff2e9750' }}>✗ rollback</button>
      </div>
    </div>
  )
}

// ─── Normalization ───────────────────────────────────────────────────────────
const NF = [
  { f: '1NF', rule: 'Atomic values, no repeating groups', ex: 'split "phone1, phone2" into rows' },
  { f: '2NF', rule: '1NF + no partial dependency on composite key', ex: 'move attrs depending on part of key to own table' },
  { f: '3NF', rule: '2NF + no transitive dependency', ex: 'move (zip→city) out of the orders table' },
]
export function NormalizationViz() {
  const [step, setStep] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">{NF.map((n, i) => <button key={n.f} onClick={() => setStep(i)} className="flex-1 py-1.5 rounded text-xs font-bold font-mono transition-all" style={{ background: step >= i ? '#00e5ff18' : 'rgba(255,255,255,0.03)', border: `1px solid ${step >= i ? '#00e5ff50' : '#262626'}`, color: step >= i ? '#00e5ff' : '#555' }}>{n.f}</button>)}</div>
      <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="panel rounded p-3" style={{ borderColor: '#00e5ff25' }}>
        <div className="text-cyan font-bold font-mono text-sm mb-1">{NF[step].f}</div>
        <p className="text-xs text-white/60">{NF[step].rule}</p>
        <p className="text-[11px] text-white/35 mt-1.5 font-mono">e.g. {NF[step].ex}</p>
      </motion.div>
    </div>
  )
}
