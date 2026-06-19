import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Recursion call stack ────────────────────────────────────────────────────
interface Frame { call: string; phase: 'push' | 'return'; value?: number }
function factorialTrace(n: number): Frame[] {
  const frames: Frame[] = []
  for (let i = n; i >= 1; i--) frames.push({ call: `factorial(${i})`, phase: 'push' })
  let acc = 1
  for (let i = 1; i <= n; i++) { acc *= i; frames.push({ call: `factorial(${i})`, phase: 'return', value: acc }) }
  return frames
}
function fibTrace(n: number): Frame[] {
  const frames: Frame[] = []
  function fib(k: number): number {
    frames.push({ call: `fib(${k})`, phase: 'push' })
    const r = k <= 1 ? k : fib(k - 1) + fib(k - 2)
    frames.push({ call: `fib(${k})`, phase: 'return', value: r })
    return r
  }
  fib(n)
  return frames
}
export function RecursionViz() {
  const [fn, setFn] = useState<'factorial' | 'fibonacci'>('factorial')
  const [n, setN] = useState(4)
  const frames = useMemo(() => (fn === 'factorial' ? factorialTrace(n) : fibTrace(n)), [fn, n])
  const [step, setStep] = useState(0)

  // reconstruct live stack at current step
  const stack: { call: string; value?: number }[] = []
  for (let i = 0; i <= step && i < frames.length; i++) {
    const f = frames[i]
    if (f.phase === 'push') stack.push({ call: f.call })
    else { const idx = stack.map(s => s.call).lastIndexOf(f.call); if (idx >= 0) stack.splice(idx, 1) }
  }
  const cur = frames[Math.min(step, frames.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center flex-wrap">
        {(['factorial', 'fibonacci'] as const).map(f => <button key={f} onClick={() => { setFn(f); setStep(0) }} className="px-3 py-1 rounded text-xs font-semibold font-mono transition-all" style={{ background: fn === f ? '#ffb30020' : 'rgba(255,255,255,0.04)', border: fn === f ? '1px solid #ffb30050' : '1px solid transparent', color: fn === f ? '#ffb300' : 'rgba(255,255,255,0.5)' }}>{f}</button>)}
        <label className="text-xs text-white/40 ml-2">n=<input type="number" min={1} max={fn === 'fibonacci' ? 7 : 8} value={n} onChange={e => { setN(Math.max(1, Math.min(fn === 'fibonacci' ? 7 : 8, +e.target.value || 1))); setStep(0) }} className="ml-1 w-12 bg-bg border border-term/30 rounded px-1.5 py-0.5 text-xs font-mono text-term outline-none" /></label>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">call stack</div>
          <div className="flex flex-col-reverse gap-1 min-h-[140px] justify-end">
            <AnimatePresence>
              {stack.map((s, i) => (
                <motion.div key={`${s.call}-${i}`} initial={{ opacity: 0, x: -12, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 12 }}
                  className="px-3 py-1.5 rounded font-mono text-xs border" style={{ background: i === stack.length - 1 ? '#ffb30018' : '#ffb3000a', borderColor: i === stack.length - 1 ? '#ffb30050' : '#ffb30020', color: '#ffb300' }}>{s.call}</motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="font-mono text-xs px-3 py-2 rounded bg-bg/60 border border-white/10" style={{ color: cur?.phase === 'return' ? '#00ff41' : '#ffb300' }}>
        {cur?.phase === 'push' ? `→ call ${cur.call}` : `← ${cur?.call} returns ${cur?.value}`}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setStep(0)} className="btn-ghost text-xs">reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} className="btn-ghost text-xs">◀</button>
        <button onClick={() => setStep(s => Math.min(frames.length - 1, s + 1))} className="btn-term text-xs">step ▶</button>
        <span className="ml-auto text-xs text-white/30 font-mono">{step + 1}/{frames.length}</span>
      </div>
    </div>
  )
}

// ─── Compiler pipeline ───────────────────────────────────────────────────────
type Tok = { type: 'num' | 'op' | 'paren'; value: string }
function tokenize(src: string): Tok[] {
  const toks: Tok[] = []
  const re = /\s*(\d+|[+\-*/()])/g
  let m
  while ((m = re.exec(src))) {
    const v = m[1]
    toks.push({ type: /\d/.test(v) ? 'num' : v === '(' || v === ')' ? 'paren' : 'op', value: v })
  }
  return toks
}
type Node = { op?: string; value?: string; left?: Node; right?: Node }
function parse(toks: Tok[]): Node | null {
  let pos = 0
  const peek = () => toks[pos]
  function expr(): Node { let n = term(); while (peek() && (peek().value === '+' || peek().value === '-')) { const op = toks[pos++].value; n = { op, left: n, right: term() } } return n }
  function term(): Node { let n = factor(); while (peek() && (peek().value === '*' || peek().value === '/')) { const op = toks[pos++].value; n = { op, left: n, right: factor() } } return n }
  function factor(): Node { const t = peek(); if (!t) return { value: '?' }; if (t.value === '(') { pos++; const n = expr(); pos++; return n } pos++; return { value: t.value } }
  try { return expr() } catch { return null }
}
function evalNode(n: Node | null | undefined): number { if (!n) return 0; if (n.value !== undefined) return +n.value; const a = evalNode(n.left), b = evalNode(n.right); return n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '*' ? a * b : a / b }
function TreeNode({ node }: { node: Node }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border" style={{ borderColor: node.op ? '#00e5ff60' : '#00ff4160', background: node.op ? '#00e5ff15' : '#00ff4115', color: node.op ? '#00e5ff' : '#00ff41' }}>{node.op ?? node.value}</div>
      {(node.left || node.right) && (
        <div className="flex gap-3 mt-2 pt-2 border-t border-white/10">
          {node.left && <TreeNode node={node.left} />}
          {node.right && <TreeNode node={node.right} />}
        </div>
      )}
    </div>
  )
}
const STAGES = ['source', 'tokens', 'AST', 'evaluate']
export function CompilerPipeline() {
  const [src, setSrc] = useState('3 + 4 * 2')
  const [stage, setStage] = useState(3)
  const toks = useMemo(() => tokenize(src), [src])
  const ast = useMemo(() => parse(toks), [toks])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">expr:</span>
        <input value={src} onChange={e => setSrc(e.target.value.replace(/[^0-9+\-*/() ]/g, ''))} className="flex-1 bg-bg border border-term/30 rounded px-3 py-1.5 text-sm font-mono text-term outline-none focus:border-term" />
      </div>
      <div className="flex gap-1">
        {STAGES.map((s, i) => <button key={s} onClick={() => setStage(i)} className="flex-1 py-1 rounded text-[10px] font-semibold uppercase transition-all" style={{ background: stage >= i ? '#00e5ff18' : 'rgba(255,255,255,0.03)', border: `1px solid ${stage >= i ? '#00e5ff50' : '#262626'}`, color: stage >= i ? '#00e5ff' : '#555' }}>{s}</button>)}
      </div>
      <div className="panel rounded p-4 min-h-[120px] flex items-center justify-center" style={{ borderColor: '#00e5ff25' }}>
        {stage === 0 && <code className="font-mono text-term text-lg">{src}</code>}
        {stage === 1 && <div className="flex flex-wrap gap-1.5 justify-center">{toks.map((t, i) => <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="px-2 py-1 rounded text-xs font-mono border" style={{ borderColor: t.type === 'num' ? '#00ff4150' : '#ffb30050', color: t.type === 'num' ? '#00ff41' : '#ffb300', background: t.type === 'num' ? '#00ff4110' : '#ffb30010' }}>{t.value}<span className="text-white/25 ml-1 text-[9px]">{t.type}</span></motion.span>)}</div>}
        {stage === 2 && (ast ? <TreeNode node={ast} /> : <span className="text-magenta text-sm">parse error</span>)}
        {stage === 3 && <div className="text-center font-mono"><div className="text-white/40 text-xs mb-1">result</div><div className="text-3xl font-black amber-text">{ast ? evalNode(ast) : '—'}</div></div>}
      </div>
      <p className="text-xs text-white/40">A compiler turns source → tokens (lexing) → AST (parsing, respecting precedence) → evaluated/compiled output.</p>
    </div>
  )
}

// ─── Pointers & memory ───────────────────────────────────────────────────────
export function PointersViz() {
  const [mem, setMem] = useState<(number | null)[]>([42, 7, null, 100, null, null, 13, null])
  const [ptr, setPtr] = useState(0)
  const base = 0x1000
  const valid = mem[ptr] !== null
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-white/40">memory grid — <span className="text-cyan">int *p = &mem[{ptr}]</span></div>
      <div className="grid grid-cols-4 gap-1.5">
        {mem.map((v, i) => (
          <motion.button key={i} onClick={() => setPtr(i)} animate={{ scale: ptr === i ? 1.05 : 1 }} className="rounded p-2 border text-center transition-all"
            style={{ borderColor: ptr === i ? '#00e5ff' : v !== null ? '#00ff4130' : '#262626', background: ptr === i ? '#00e5ff15' : v !== null ? '#00ff410a' : 'transparent' }}>
            <div className="text-[9px] text-white/30 font-mono">0x{(base + i * 4).toString(16)}</div>
            <div className="font-mono font-bold text-sm" style={{ color: v !== null ? (ptr === i ? '#00e5ff' : '#00ff41') : '#444' }}>{v ?? 'NULL'}</div>
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-cyan">p = 0x{(base + ptr * 4).toString(16)}</span>
        <span className="text-white/30">·</span>
        <span style={{ color: valid ? '#00ff41' : '#ff2e97' }}>*p = {valid ? mem[ptr] : 'SEGFAULT (null deref)'}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setPtr(p => Math.max(0, p - 1))} className="btn-ghost text-xs">p-- </button>
        <button onClick={() => setPtr(p => Math.min(mem.length - 1, p + 1))} className="btn-ghost text-xs">p++ </button>
        <button onClick={() => { setMem(m => m.map((v, i) => i === ptr ? null : v)) }} className="btn-amber text-xs">free(p)</button>
      </div>
      <p className="text-xs text-white/40">Pointer arithmetic moves by sizeof(int)=4 bytes. Dereferencing a freed/NULL slot is a dangling-pointer bug.</p>
    </div>
  )
}
