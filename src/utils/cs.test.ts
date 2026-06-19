import { describe, it, expect } from 'vitest'
import { toBinary, fromBinary, twosComplement, bitwiseOp, evalGate, halfAdder, fullAdder, fcfs, sjf, roundRobin, avgWaiting } from './cs'
import type { Process } from '../types'

describe('binary', () => {
  it('converts to 8-bit binary', () => { expect(toBinary(5)).toBe('00000101'); expect(toBinary(255)).toBe('11111111') })
  it('round-trips', () => { expect(fromBinary(toBinary(42))).toBe(42) })
  it('handles negatives via two\'s complement', () => { expect(toBinary(-1)).toBe('11111111'); expect(toBinary(-128)).toBe('10000000') })
})

describe("two's complement", () => {
  it('inverts and adds one', () => {
    const r = twosComplement(5)
    expect(r.original).toBe('00000101')
    expect(r.inverted).toBe('11111010')
    expect(r.result).toBe('11111011')
  })
})

describe('bitwise', () => {
  it('AND/OR/XOR', () => {
    expect(bitwiseOp(12, 10, 'AND')).toBe(8)
    expect(bitwiseOp(12, 10, 'OR')).toBe(14)
    expect(bitwiseOp(12, 10, 'XOR')).toBe(6)
  })
  it('NOT masks to 8 bits', () => { expect(bitwiseOp(0, 0, 'NOT')).toBe(255) })
  it('shifts', () => { expect(bitwiseOp(1, 0, 'SHL')).toBe(2); expect(bitwiseOp(4, 0, 'SHR')).toBe(2) })
})

describe('gates', () => {
  it('basic gates', () => {
    expect(evalGate('AND', true, true)).toBe(true)
    expect(evalGate('NAND', true, true)).toBe(false)
    expect(evalGate('XOR', true, false)).toBe(true)
    expect(evalGate('NOT', false)).toBe(true)
  })
  it('half adder', () => { expect(halfAdder(true, true)).toEqual({ sum: false, carry: true }) })
  it('full adder', () => { expect(fullAdder(true, true, true)).toEqual({ sum: true, carry: true }) })
})

describe('scheduling', () => {
  const procs: Process[] = [
    { id: 'P1', arrival: 0, burst: 5, priority: 2, color: '#00ff41' },
    { id: 'P2', arrival: 1, burst: 3, priority: 1, color: '#ffb300' },
    { id: 'P3', arrival: 2, burst: 1, priority: 3, color: '#00e5ff' },
  ]
  it('FCFS preserves arrival order', () => {
    const g = fcfs(procs)
    expect(g.map(s => s.id)).toEqual(['P1', 'P2', 'P3'])
    expect(g[0]).toMatchObject({ start: 0, end: 5 })
  })
  it('SJF picks shortest available', () => {
    const g = sjf(procs)
    expect(g[0].id).toBe('P1') // only P1 available at t=0
    expect(g[1].id).toBe('P3') // shortest among P2,P3 at t=5
  })
  it('Round Robin slices by quantum', () => {
    const g = roundRobin(procs, 2)
    expect(g.length).toBeGreaterThan(procs.length)
    expect(g.at(-1)!.end).toBe(9) // total burst = 5+3+1
  })
  it('computes average waiting time', () => {
    expect(avgWaiting(procs, fcfs(procs))).toBeGreaterThanOrEqual(0)
  })
})
