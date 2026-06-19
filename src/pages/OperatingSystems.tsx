import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { SchedulerViz, ProcessStateMachine, PagingViz } from '../components/os/OSDemos'
import { useStore } from '../store'

export function OperatingSystems() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('os') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="◰" name="Operating Systems" sub="scheduling · processes · paging · deadlock" color="#ff2e97" />
      <TermWindow title="scheduler — FCFS / SJF / RR / Priority" color="#ff2e97"><SchedulerViz /></TermWindow>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="process_states.fsm" color="#00ff41" delay={0.05}><ProcessStateMachine /></TermWindow>
        <TermWindow title="paging — addr translation" color="#00e5ff" delay={0.1}><PagingViz /></TermWindow>
      </div>
    </div>
  )
}
