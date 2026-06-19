import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { GateExplorer, AdderViz } from '../components/logic/LogicDemos'
import { useStore } from '../store'

export function LogicGates() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('logic') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="&" name="Logic Gates" sub="gates · half/full adders · truth tables" color="#ffb300" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="gate_explorer.v" color="#00ff41"><GateExplorer /></TermWindow>
        <TermWindow title="adders.v" color="#ffb300" delay={0.05}><AdderViz /></TermWindow>
      </div>
      <TermWindow title="universal_gates.txt" color="#00e5ff" delay={0.1}>
        <p className="text-sm text-white/55 mb-3">NAND and NOR are <span className="text-cyan">universal gates</span> — any boolean function can be built from them alone.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {[
            { t: 'NOT from NAND', e: 'NAND(A,A) = ¬A' },
            { t: 'AND from NAND', e: 'NAND(NAND(A,B), …) = A∧B' },
            { t: 'OR from NAND', e: 'NAND(¬A, ¬B) = A∨B' },
          ].map(x => <div key={x.t} className="panel rounded p-3" style={{ borderColor: '#00e5ff25' }}><div className="text-cyan font-semibold mb-1">{x.t}</div><div className="text-white/50">{x.e}</div></div>)}
        </div>
      </TermWindow>
    </div>
  )
}
