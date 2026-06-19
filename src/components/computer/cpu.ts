// Tiny assembly interpreter producing step snapshots for animation.
export interface CPUSnapshot {
  pc: number
  phase: 'fetch' | 'decode' | 'execute'
  registers: Record<string, number>
  flags: { zero: boolean }
  instruction: string
  note: string
  output: number[]
  alu?: { op: string; a: number; b: number; result: number }
}

const REGS = ['AX', 'BX', 'CX', 'DX']

export function runProgram(lines: string[]): CPUSnapshot[] {
  const steps: CPUSnapshot[] = []
  const reg: Record<string, number> = { AX: 0, BX: 0, CX: 0, DX: 0 }
  let flags = { zero: false }
  const output: number[] = []
  let pc = 0
  let guard = 0

  const val = (tok: string): number => (REGS.includes(tok) ? reg[tok] : parseInt(tok) || 0)
  const program = lines.map(l => l.trim()).filter(Boolean)

  while (pc < program.length && guard++ < 200) {
    const line = program[pc]
    const [op, ...rest] = line.replace(/,/g, '').split(/\s+/)
    const args = rest
    const snap = (phase: CPUSnapshot['phase'], note: string, alu?: CPUSnapshot['alu']) =>
      steps.push({ pc, phase, registers: { ...reg }, flags: { ...flags }, instruction: line, note, output: [...output], alu })

    snap('fetch', `fetch instruction at PC=${pc}`)
    snap('decode', `decode: ${op} ${args.join(', ')}`)

    let nextPc = pc + 1
    switch (op?.toUpperCase()) {
      case 'MOV': reg[args[0]] = val(args[1]); snap('execute', `${args[0]} ← ${val(args[1])}`); break
      case 'ADD': { const r = reg[args[0]] + val(args[1]); snap('execute', `ALU: ${reg[args[0]]} + ${val(args[1])} = ${r}`, { op: '+', a: reg[args[0]], b: val(args[1]), result: r }); reg[args[0]] = r; break }
      case 'SUB': { const r = reg[args[0]] - val(args[1]); snap('execute', `ALU: ${reg[args[0]]} - ${val(args[1])} = ${r}`, { op: '-', a: reg[args[0]], b: val(args[1]), result: r }); reg[args[0]] = r; break }
      case 'MUL': { const r = reg[args[0]] * val(args[1]); snap('execute', `ALU: ${reg[args[0]]} × ${val(args[1])} = ${r}`, { op: '×', a: reg[args[0]], b: val(args[1]), result: r }); reg[args[0]] = r; break }
      case 'CMP': { const d = reg[args[0]] - val(args[1]); flags.zero = d === 0; snap('execute', `CMP: zero flag = ${flags.zero}`); break }
      case 'JMP': nextPc = parseInt(args[0]); snap('execute', `jump → line ${nextPc}`); break
      case 'JZ': if (flags.zero) { nextPc = parseInt(args[0]); snap('execute', `zero set → jump to ${nextPc}`) } else snap('execute', `zero clear → no jump`); break
      case 'JNZ': if (!flags.zero) { nextPc = parseInt(args[0]); snap('execute', `zero clear → jump to ${nextPc}`) } else snap('execute', `zero set → no jump`); break
      case 'OUT': output.push(reg[args[0]]); snap('execute', `OUT ${args[0]} → ${reg[args[0]]}`); break
      default: snap('execute', `nop`)
    }
    pc = nextPc
  }
  return steps
}

export const DEMO_PROGRAM = `MOV AX, 5
MOV BX, 3
ADD AX, BX
MOV CX, AX
ADD CX, 10
OUT CX
CMP AX, 8
JZ 9
MOV DX, 1
OUT DX`
