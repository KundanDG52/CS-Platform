export interface Section {
  id: string
  name: string
  icon: string
  description: string
  path: string
  color: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  topics: string[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  xpReward: number
  color: string
}

export interface UserState {
  xp: number
  level: number
  streak: number
  lastVisitDate: string
  sectionProgress: Record<string, { completed: boolean; xpEarned: number }>
  achievements: Achievement[]
  solvedPuzzles: string[]
}

// CPU sim
export interface CPUState {
  registers: Record<string, number>
  pc: number
  flags: { zero: boolean; carry: boolean }
  phase: 'idle' | 'fetch' | 'decode' | 'execute'
  output: string[]
}

// Scheduling
export interface Process {
  id: string
  arrival: number
  burst: number
  priority: number
  color: string
}
export interface GanttSlice { id: string; start: number; end: number; color: string }
