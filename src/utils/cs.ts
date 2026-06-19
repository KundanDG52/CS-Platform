import type { Process, GanttSlice } from '../types'

// ─── Binary helpers ──────────────────────────────────────────────────────────
export function toBinary(n: number, bits = 8): string {
  if (n < 0) n = (1 << bits) + n // two's complement wrap
  return (n >>> 0).toString(2).padStart(bits, '0').slice(-bits)
}
export function fromBinary(b: string): number { return parseInt(b, 2) || 0 }

export function divisionSteps(n: number): { quotient: number; remainder: number }[] {
  const steps: { quotient: number; remainder: number }[] = []
  let x = n
  if (x === 0) return [{ quotient: 0, remainder: 0 }]
  while (x > 0) { steps.push({ quotient: Math.floor(x / 2), remainder: x % 2 }); x = Math.floor(x / 2) }
  return steps
}

export function twosComplement(n: number, bits = 8): { original: string; inverted: string; result: string } {
  const mag = toBinary(Math.abs(n), bits)
  const inverted = mag.split('').map(b => (b === '0' ? '1' : '0')).join('')
  const result = toBinary(-Math.abs(n), bits)
  return { original: mag, inverted, result }
}

export function bitwiseOp(a: number, b: number, op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'SHL' | 'SHR', bits = 8): number {
  const mask = (1 << bits) - 1
  switch (op) {
    case 'AND': return (a & b) & mask
    case 'OR': return (a | b) & mask
    case 'XOR': return (a ^ b) & mask
    case 'NOT': return (~a) & mask
    case 'SHL': return (a << 1) & mask
    case 'SHR': return (a >> 1) & mask
  }
}

// ─── Logic gates ─────────────────────────────────────────────────────────────
export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'
export function evalGate(type: GateType, a: boolean, b = false): boolean {
  switch (type) {
    case 'AND': return a && b
    case 'OR': return a || b
    case 'NOT': return !a
    case 'NAND': return !(a && b)
    case 'NOR': return !(a || b)
    case 'XOR': return a !== b
    case 'XNOR': return a === b
  }
}
export function halfAdder(a: boolean, b: boolean) { return { sum: a !== b, carry: a && b } }
export function fullAdder(a: boolean, b: boolean, cin: boolean) {
  const s1 = a !== b
  return { sum: s1 !== cin, carry: (a && b) || (s1 && cin) }
}

// ─── CPU scheduling ──────────────────────────────────────────────────────────
export function fcfs(procs: Process[]): GanttSlice[] {
  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival)
  let t = 0
  const slices: GanttSlice[] = []
  for (const p of sorted) {
    if (t < p.arrival) t = p.arrival
    slices.push({ id: p.id, start: t, end: t + p.burst, color: p.color })
    t += p.burst
  }
  return slices
}

export function sjf(procs: Process[]): GanttSlice[] {
  const remaining = [...procs]
  let t = 0
  const slices: GanttSlice[] = []
  while (remaining.length) {
    const avail = remaining.filter(p => p.arrival <= t)
    if (!avail.length) { t = Math.min(...remaining.map(p => p.arrival)); continue }
    avail.sort((a, b) => a.burst - b.burst)
    const p = avail[0]
    slices.push({ id: p.id, start: t, end: t + p.burst, color: p.color })
    t += p.burst
    remaining.splice(remaining.indexOf(p), 1)
  }
  return slices
}

export function roundRobin(procs: Process[], quantum = 2): GanttSlice[] {
  const rem = procs.map(p => ({ ...p, left: p.burst }))
  const queue: typeof rem = []
  let t = 0
  const slices: GanttSlice[] = []
  const arrived = new Set<string>()
  const enqueueArrived = (time: number) => {
    rem.filter(p => p.arrival <= time && !arrived.has(p.id) && p.left > 0).sort((a, b) => a.arrival - b.arrival).forEach(p => { queue.push(p); arrived.add(p.id) })
  }
  enqueueArrived(0)
  if (!queue.length && rem.length) { t = Math.min(...rem.map(p => p.arrival)); enqueueArrived(t) }
  while (queue.length) {
    const p = queue.shift()!
    const run = Math.min(quantum, p.left)
    slices.push({ id: p.id, start: t, end: t + run, color: p.color })
    t += run
    p.left -= run
    enqueueArrived(t)
    if (p.left > 0) queue.push(p)
    if (!queue.length) { const next = rem.find(x => x.left > 0); if (next) { t = Math.max(t, next.arrival); enqueueArrived(t) } }
  }
  return slices
}

export function prioritySchedule(procs: Process[]): GanttSlice[] {
  const remaining = [...procs]
  let t = 0
  const slices: GanttSlice[] = []
  while (remaining.length) {
    const avail = remaining.filter(p => p.arrival <= t)
    if (!avail.length) { t = Math.min(...remaining.map(p => p.arrival)); continue }
    avail.sort((a, b) => a.priority - b.priority)
    const p = avail[0]
    slices.push({ id: p.id, start: t, end: t + p.burst, color: p.color })
    t += p.burst
    remaining.splice(remaining.indexOf(p), 1)
  }
  return slices
}

export function avgWaiting(procs: Process[], slices: GanttSlice[]): number {
  const finish: Record<string, number> = {}
  slices.forEach(s => { finish[s.id] = Math.max(finish[s.id] ?? 0, s.end) })
  const wait = procs.map(p => (finish[p.id] - p.arrival) - p.burst)
  return wait.reduce((a, b) => a + b, 0) / procs.length
}
