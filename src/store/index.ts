import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserState } from '../types'
import { ACHIEVEMENTS, getLevelFromXP } from '../utils/constants'

interface AppStore extends UserState {
  addXP: (n: number) => void
  completeSection: (id: string) => void
  solvePuzzle: (id: string) => void
  checkAchievement: (id: string) => void
  updateStreak: () => void
  reset: () => void
}

const initial: UserState = {
  xp: 0, level: 1, streak: 0, lastVisitDate: '',
  sectionProgress: {}, achievements: ACHIEVEMENTS.map(a => ({ ...a })), solvedPuzzles: [],
}

const ACH_MAP: Record<string, string> = {
  numbers: 'bit_master', logic: 'logician', computer: 'architect', os: 'kernel_hacker', network: 'packet_wizard',
}

export const useStore = create<AppStore>()(
  persist((set, get) => ({
    ...initial,
    addXP: (n) => set(s => { const xp = s.xp + n; return { xp, level: getLevelFromXP(xp) } }),
    completeSection: (id) => {
      set(s => {
        if (s.sectionProgress[id]?.completed) return s
        const xp = s.xp + 100
        return { xp, level: getLevelFromXP(xp), sectionProgress: { ...s.sectionProgress, [id]: { completed: true, xpEarned: 100 } } }
      })
      get().checkAchievement('boot')
      if (ACH_MAP[id]) get().checkAchievement(ACH_MAP[id])
      const all = ['numbers', 'logic', 'computer', 'os', 'network', 'programming', 'databases']
      if (all.every(t => get().sectionProgress[t]?.completed)) get().checkAchievement('root')
    },
    solvePuzzle: (id) => {
      set(s => s.solvedPuzzles.includes(id) ? s : { xp: s.xp + 50, level: getLevelFromXP(s.xp + 50), solvedPuzzles: [...s.solvedPuzzles, id] })
      if (get().solvedPuzzles.length >= 3) get().checkAchievement('puzzle_hacker')
    },
    checkAchievement: (id) => set(s => ({ achievements: s.achievements.map(a => a.id === id && !a.earned ? { ...a, earned: true } : a) })),
    updateStreak: () => {
      const today = new Date().toDateString()
      if (get().lastVisitDate === today) return
      const yest = new Date(Date.now() - 864e5).toDateString()
      const streak = get().lastVisitDate === yest ? get().streak + 1 : 1
      set({ lastVisitDate: today, streak })
    },
    reset: () => set({ ...initial }),
  }), { name: 'cs-platform-v1' })
)
