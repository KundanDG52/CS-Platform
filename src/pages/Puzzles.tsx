import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Zap } from 'lucide-react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { useStore } from '../store'

// ─── Binary toggle puzzle ────────────────────────────────────────────────────
function BinaryPuzzle() {
  const { solvePuzzle, solvedPuzzles } = useStore()
  const [target] = useState(() => Math.floor(Math.random() * 200) + 30)
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0])
  const cur = bits.reduce((a, b, i) => a + b * (1 << (7 - i)), 0)
  const won = cur === target
  const id = 'binary_target'
  if (won && !solvedPuzzles.includes(id)) solvePuzzle(id)
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm">target = <span className="amber-text font-bold font-mono text-lg">{target}</span> · current = <span className="font-mono font-bold" style={{ color: won ? '#00ff41' : '#fff' }}>{cur}</span></div>
      <div className="flex gap-1.5 flex-wrap">
        {bits.map((b, i) => (
          <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => setBits(p => p.map((x, j) => j === i ? (x ? 0 : 1) : x))}
            className="bit-cell w-11 h-12 rounded text-lg border-2"
            animate={{ background: b ? '#00ff4122' : '#121212', borderColor: b ? '#00ff41' : '#262626', color: b ? '#00ff41' : '#444' }}>{b}</motion.button>
        ))}
      </div>
      <AnimatePresence>
        {won && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-term font-mono text-sm">✓ solved! +50 XP — {target} = {bits.join('')}</motion.div>}
      </AnimatePresence>
    </div>
  )
}

// ─── MCQ quizzes ─────────────────────────────────────────────────────────────
interface Quiz { id: string; q: string; code?: string; options: string[]; answer: number; explain: string }
const QUIZZES: Quiz[] = [
  { id: 'q_pipeline', q: 'A pipeline stalls because instruction 2 needs the result of instruction 1 before it\'s written back. What hazard is this?', options: ['Data hazard (RAW)', 'Control hazard', 'Structural hazard', 'No hazard'], answer: 0, explain: 'Read-After-Write: instr 2 reads a register instr 1 hasn\'t written yet. Fixed by forwarding or stalling.' },
  { id: 'q_sched', q: 'Three jobs arrive at t=0 with bursts 8, 2, 4. Which order minimizes average waiting time?', options: ['8 → 4 → 2 (FCFS)', '2 → 4 → 8 (SJF)', '4 → 8 → 2', 'Order doesn\'t matter'], answer: 1, explain: 'Shortest-Job-First minimizes average waiting time: short jobs finish first, reducing cumulative wait.' },
  { id: 'q_2c', q: 'In 8-bit two\'s complement, what is the bit pattern for -1?', code: '? ? ? ? ? ? ? ?', options: ['10000001', '11111111', '00000001', '11111110'], answer: 1, explain: '-1 = invert(00000001)=11111110, then +1 = 11111111. All ones represents -1.' },
  { id: 'q_cap', q: 'During a network partition, a CP database will…', options: ['Stay fully available, drop consistency', 'Reject requests to preserve consistency', 'Ignore the partition', 'Switch to AP automatically'], answer: 1, explain: 'CP systems sacrifice Availability during partitions — they refuse requests rather than serve stale/inconsistent data.' },
  { id: 'q_gate', q: 'Which single gate type can build ANY boolean circuit on its own?', options: ['XOR', 'AND', 'NAND', 'OR'], answer: 2, explain: 'NAND (and NOR) are universal gates — NOT, AND, OR can all be composed from NAND alone.' },
]

function QuizCard({ quiz, i }: { quiz: Quiz; i: number }) {
  const { solvePuzzle, solvedPuzzles } = useStore()
  const done = solvedPuzzles.includes(quiz.id)
  const [sel, setSel] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  function pick(idx: number) { if (revealed) return; setSel(idx); setRevealed(true); if (idx === quiz.answer && !done) solvePuzzle(quiz.id) }
  const correct = sel === quiz.answer
  return (
    <div className="panel rounded-lg overflow-hidden" style={{ borderColor: '#ffb30025' }}>
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2" style={{ background: '#ffb30008' }}>
        <span className="w-5 h-5 rounded bg-amber/15 text-amber flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
        <span className="text-xs font-semibold text-amber">challenge_{i + 1}</span>
        {done && <span className="ml-auto text-[10px] text-term flex items-center gap-1"><Check size={10} /> solved</span>}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <p className="text-sm text-white/80">{quiz.q}</p>
        {quiz.code && <code className="code-block text-xs">{quiz.code}</code>}
        <div className="flex flex-col gap-1.5">
          {quiz.options.map((o, idx) => {
            const isA = idx === quiz.answer, isP = sel === idx
            let cls = 'border-white/08 text-white/65 hover:border-term/30'
            if (revealed && isA) cls = 'border-term/50 bg-term/10 text-term'
            else if (revealed && isP && !isA) cls = 'border-magenta/50 bg-magenta/10 text-magenta'
            return <button key={idx} onClick={() => pick(idx)} disabled={revealed} className={`text-left px-3 py-2 rounded text-xs border font-mono transition-all flex items-center gap-2 ${cls}`}>
              <span className="opacity-40">{String.fromCharCode(97 + idx)})</span><span className="flex-1">{o}</span>
              {revealed && isA && <Check size={12} />}{revealed && isP && !isA && <X size={12} />}
            </button>
          })}
        </div>
        <AnimatePresence>
          {revealed && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <div className="rounded p-2.5 text-xs border" style={{ borderColor: correct ? '#00ff4130' : '#ffb30030', background: correct ? '#00ff410a' : '#ffb3000a', color: 'rgba(255,255,255,0.6)' }}>
              <span className="font-semibold" style={{ color: correct ? '#00ff41' : '#ffb300' }}>{correct ? '✓ +50 XP — ' : 'answer: '}</span>{quiz.explain}
            </div>
            {!correct && <button onClick={() => { setRevealed(false); setSel(null) }} className="btn-ghost text-xs mt-2">retry</button>}
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Puzzles() {
  const solved = useStore(s => s.solvedPuzzles.length)
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="◆" name="Puzzles" sub="binary · pipeline hazards · scheduling · logic" color="#ffb300" />
      <div className="flex items-center gap-2 text-sm text-white/50"><Zap size={14} className="text-term" /> {solved} solved · 50 XP each</div>
      <TermWindow title="binary_target.puzzle" color="#00ff41"><BinaryPuzzle /></TermWindow>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {QUIZZES.map((q, i) => <QuizCard key={q.id} quiz={q} i={i} />)}
      </div>
    </div>
  )
}
