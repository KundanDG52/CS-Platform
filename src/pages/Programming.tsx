import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { RecursionViz, CompilerPipeline, PointersViz } from '../components/programming/ProgrammingDemos'
import { useStore } from '../store'

export function Programming() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('programming') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="ƒ" name="Programming Concepts" sub="recursion · pointers · compilers · concurrency" color="#ffb300" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="recursion — call stack" color="#ffb300"><RecursionViz /></TermWindow>
        <TermWindow title="pointers.c" color="#00ff41" delay={0.05}><PointersViz /></TermWindow>
      </div>
      <TermWindow title="compiler — lex → parse → eval" color="#00e5ff" delay={0.1}><CompilerPipeline /></TermWindow>
    </div>
  )
}
