import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { MatrixBg } from './MatrixBg'
import { useStore } from '../../store'

export function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation()
  const updateStreak = useStore(s => s.updateStreak)
  useEffect(() => { updateStreak() }, [updateStreak])

  return (
    <div className="crt min-h-screen flex flex-col relative">
      <MatrixBg />
      <div className="scanbar animate-scan" />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main key={loc.pathname}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} className="flex-1 pt-14">
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
