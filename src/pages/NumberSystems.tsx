import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { BinaryCounter, DecimalToBinary, BitwiseViz, TwosComplementViz } from '../components/numbers/NumberDemos'
import { useStore } from '../store'

export function NumberSystems() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('numbers') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="01" name="Number Systems" sub="binary · bitwise · two's complement · IEEE 754" color="#00ff41" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="binary_counter.bin" color="#00ff41"><BinaryCounter /></TermWindow>
        <TermWindow title="dec2bin.sh" color="#00e5ff" delay={0.05}><DecimalToBinary /></TermWindow>
      </div>
      <TermWindow title="bitwise_ops.c" color="#ffb300" delay={0.1}><BitwiseViz /></TermWindow>
      <TermWindow title="twos_complement.asm" color="#ff2e97" delay={0.15}><TwosComplementViz /></TermWindow>
    </div>
  )
}
