import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { CPUSimulator, MemoryHierarchy, CacheSim } from '../components/computer/ComputerDemos'
import { useStore } from '../store'

export function HowComputersWork() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('computer') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="⌗" name="How Computers Work" sub="CPU cycle · ALU · registers · memory · cache" color="#00e5ff" />
      <TermWindow title="cpu_sim — fetch/decode/execute" color="#00ff41"><CPUSimulator /></TermWindow>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="memory_hierarchy" color="#00e5ff" delay={0.05}><MemoryHierarchy /></TermWindow>
        <TermWindow title="cache_sim — LRU" color="#ffb300" delay={0.1}><CacheSim /></TermWindow>
      </div>
    </div>
  )
}
