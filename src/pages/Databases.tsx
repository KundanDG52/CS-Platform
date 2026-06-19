import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { BTreeViz, CAPTheorem, ACIDViz, NormalizationViz } from '../components/databases/DatabaseDemos'
import { useStore } from '../store'

export function Databases() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('databases') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="⛁" name="Databases" sub="B-Trees · ACID · CAP · normalization" color="#00e5ff" />
      <TermWindow title="btree_index --insert" color="#00e5ff"><BTreeViz /></TermWindow>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="cap_theorem" color="#ffb300" delay={0.05}><CAPTheorem /></TermWindow>
        <TermWindow title="acid_txn" color="#00ff41" delay={0.1}><ACIDViz /></TermWindow>
      </div>
      <TermWindow title="normalization 1NF→2NF→3NF" color="#ff2e97" delay={0.15}><NormalizationViz /></TermWindow>
    </div>
  )
}
