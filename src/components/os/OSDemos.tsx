import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fcfs, sjf, roundRobin, prioritySchedule, avgWaiting } from '../../utils/cs'
import type { Process, GanttSlice } from '../../types'

const COLORS = ['#00ff41', '#ffb300', '#00e5ff', '#ff2e97', '#a855f7']
const DEFAULT: Process[] = [
  { id: 'P1', arrival: 0, burst: 6, priority: 2, color: COLORS[0] },
  { id: 'P2', arrival: 1, burst: 3, priority: 1, color: COLORS[1] },
  { id: 'P3', arrival: 2, burst: 4, priority: 3, color: COLORS[2] },
  { id: 'P4', arrival: 4, burst: 2, priority: 2, color: COLORS[3] },
]
const ALGOS = ['FCFS', 'SJF', 'RR', 'Priority'] as const

export function SchedulerViz() {
  const [procs, setProcs] = useState<Process[]>(DEFAULT)
  const [algo, setAlgo] = useState<typeof ALGOS[number]>('FCFS')
  const [quantum, setQuantum] = useState(2)

  const slices: GanttSlice[] =
    algo === 'FCFS' ? fcfs(procs) : algo === 'SJF' ? sjf(procs) : algo === 'RR' ? roundRobin(procs, quantum) : prioritySchedule(procs)
  const totalTime = slices.length ? slices.at(-1)!.end : 0
  const avg = procs.length ? avgWaiting(procs, slices).toFixed(2) : '0'

  function update(i: number, field: keyof Process, v: number) { setProcs(p => p.map((x, j) => j === i ? { ...x, [field]: v } : x)) }
  function add() { if (procs.length >= 5) return; const id = `P${procs.length + 1}`; setProcs(p => [...p, { id, arrival: 0, burst: 3, priority: 1, color: COLORS[p.length] }]) }
  function remove(i: number) { setProcs(p => p.filter((_, j) => j !== i)) }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        {ALGOS.map(a => <button key={a} onClick={() => setAlgo(a)} className="px-3 py-1 rounded text-xs font-semibold font-mono transition-all"
          style={{ background: algo === a ? '#ff2e9722' : 'rgba(255,255,255,0.04)', border: algo === a ? '1px solid #ff2e9760' : '1px solid transparent', color: algo === a ? '#ff2e97' : 'rgba(255,255,255,0.5)' }}>{a}</button>)}
        {algo === 'RR' && <label className="text-xs text-white/40 ml-2">quantum<input type="number" min={1} max={5} value={quantum} onChange={e => setQuantum(Math.max(1, +e.target.value || 1))} className="ml-1 w-12 bg-bg border border-term/30 rounded px-1.5 py-0.5 text-xs font-mono text-term outline-none" /></label>}
      </div>

      {/* process table */}
      <table className="text-xs font-mono w-full">
        <thead><tr className="text-white/40 border-b border-white/10"><th className="text-left py-1">PID</th><th>arrival</th><th>burst</th>{algo === 'Priority' && <th>priority</th>}<th></th></tr></thead>
        <tbody>
          {procs.map((p, i) => (
            <tr key={p.id}>
              <td className="py-1"><span className="font-bold" style={{ color: p.color }}>{p.id}</span></td>
              <td className="text-center"><input type="number" min={0} value={p.arrival} onChange={e => update(i, 'arrival', Math.max(0, +e.target.value || 0))} className="w-12 bg-bg border border-border rounded px-1 py-0.5 text-center text-white/70 outline-none focus:border-term/50" /></td>
              <td className="text-center"><input type="number" min={1} value={p.burst} onChange={e => update(i, 'burst', Math.max(1, +e.target.value || 1))} className="w-12 bg-bg border border-border rounded px-1 py-0.5 text-center text-white/70 outline-none focus:border-term/50" /></td>
              {algo === 'Priority' && <td className="text-center"><input type="number" min={1} value={p.priority} onChange={e => update(i, 'priority', Math.max(1, +e.target.value || 1))} className="w-12 bg-bg border border-border rounded px-1 py-0.5 text-center text-white/70 outline-none focus:border-term/50" /></td>}
              <td className="text-right">{procs.length > 1 && <button onClick={() => remove(i)} className="text-white/20 hover:text-magenta">✕</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} disabled={procs.length >= 5} className="btn-ghost text-xs self-start disabled:opacity-40">+ add process</button>

      {/* Gantt chart */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">gantt chart {algo === 'Priority' && '(lower number = higher priority)'}</div>
        <div className="flex rounded overflow-hidden border border-white/10" style={{ minHeight: 40 }}>
          <AnimatePresence>
            {slices.map((s, i) => (
              <motion.div key={i} initial={{ width: 0, opacity: 0 }} animate={{ width: `${((s.end - s.start) / totalTime) * 100}%`, opacity: 1 }} transition={{ delay: i * 0.12, duration: 0.3 }}
                className="flex items-center justify-center text-xs font-bold font-mono border-r border-black/30 relative group" style={{ background: `${s.color}30`, color: s.color }}>
                {s.id}
                <span className="absolute -bottom-4 left-0 text-[9px] text-white/30">{s.start}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="text-right text-[9px] text-white/30 mt-4">t={totalTime}</div>
      </div>
      <div className="text-xs font-mono text-amber">avg waiting time = {avg} units</div>
    </div>
  )
}

// ─── Process state machine ───────────────────────────────────────────────────
const STATES = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'] as const
type PState = typeof STATES[number]
const TRANSITIONS: Record<PState, { to: PState; label: string }[]> = {
  New: [{ to: 'Ready', label: 'admit' }],
  Ready: [{ to: 'Running', label: 'dispatch' }],
  Running: [{ to: 'Waiting', label: 'I/O wait' }, { to: 'Ready', label: 'timeout' }, { to: 'Terminated', label: 'exit' }],
  Waiting: [{ to: 'Ready', label: 'I/O done' }],
  Terminated: [],
}
const SCOLOR: Record<PState, string> = { New: '#00e5ff', Ready: '#ffb300', Running: '#00ff41', Waiting: '#ff2e97', Terminated: '#666' }
export function ProcessStateMachine() {
  const [state, setState] = useState<PState>('New')
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STATES.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div animate={{ scale: state === s ? 1.1 : 1, boxShadow: state === s ? `0 0 18px ${SCOLOR[s]}60` : 'none' }}
              className="px-3 py-2 rounded font-mono text-xs font-bold border-2"
              style={{ borderColor: state === s ? SCOLOR[s] : '#262626', background: state === s ? `${SCOLOR[s]}20` : 'transparent', color: state === s ? SCOLOR[s] : '#555' }}>{s}</motion.div>
            {i < STATES.length - 1 && <span className="text-white/15">→</span>}
          </div>
        ))}
      </div>
      <div className="panel rounded p-3 flex flex-col items-center gap-2" style={{ borderColor: `${SCOLOR[state]}30` }}>
        <span className="text-xs text-white/40">available transitions from <span style={{ color: SCOLOR[state] }}>{state}</span>:</span>
        <div className="flex flex-wrap gap-2 justify-center">
          {TRANSITIONS[state].length ? TRANSITIONS[state].map(t => (
            <button key={t.to} onClick={() => setState(t.to)} className="px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all" style={{ background: `${SCOLOR[t.to]}18`, border: `1px solid ${SCOLOR[t.to]}50`, color: SCOLOR[t.to] }}>{t.label} → {t.to}</button>
          )) : <button onClick={() => setState('New')} className="btn-ghost text-xs">↻ restart process</button>}
        </div>
      </div>
    </div>
  )
}

// ─── Paging address translation ──────────────────────────────────────────────
export function PagingViz() {
  const PAGE_BITS = 4 // offset bits → page size 16
  const [logical, setLogical] = useState(37)
  const pageTable = [3, 7, 1, 5] // page → frame
  const pageSize = 1 << PAGE_BITS
  const pageNum = Math.floor(logical / pageSize)
  const offset = logical % pageSize
  const frame = pageTable[pageNum] ?? 0
  const physical = frame * pageSize + offset

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">logical address</span>
        <input type="number" min={0} max={63} value={logical} onChange={e => setLogical(Math.max(0, Math.min(63, +e.target.value || 0)))} className="w-20 bg-bg border border-term/30 rounded px-2 py-1 text-sm font-mono text-term outline-none" />
        <span className="text-xs text-white/30">(6-bit space, page size {pageSize})</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-center text-xs font-mono">
        <div className="text-center"><div className="text-white/40 mb-1">page #</div><div className="w-12 h-10 rounded flex items-center justify-center border-2 border-cyan/50 bg-cyan/10 text-cyan font-bold">{pageNum}</div></div>
        <span className="text-white/30">+</span>
        <div className="text-center"><div className="text-white/40 mb-1">offset</div><div className="w-12 h-10 rounded flex items-center justify-center border-2 border-amber/50 bg-amber/10 text-amber font-bold">{offset}</div></div>
        <span className="text-white/30 mx-1">→ page table →</span>
        <div className="text-center"><div className="text-white/40 mb-1">frame</div><motion.div key={frame} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="w-12 h-10 rounded flex items-center justify-center border-2 border-term/50 bg-term/10 text-term font-bold">{frame}</motion.div></div>
      </div>
      {/* page table */}
      <div className="flex justify-center gap-1.5">
        {pageTable.map((f, p) => (
          <div key={p} className="text-center">
            <div className="text-[9px] text-white/30">pg{p}</div>
            <div className="w-10 h-9 rounded flex items-center justify-center font-mono text-sm font-bold border" style={{ borderColor: p === pageNum ? '#00ff41' : '#262626', background: p === pageNum ? '#00ff4118' : 'transparent', color: p === pageNum ? '#00ff41' : '#666' }}>{f}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm font-mono">
        <span className="text-white/40">physical = frame×{pageSize} + offset = {frame}×{pageSize}+{offset} = </span>
        <span className="amber-text font-bold">{physical}</span>
      </div>
    </div>
  )
}
