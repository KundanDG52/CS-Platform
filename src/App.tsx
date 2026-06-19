import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { NumberSystems } from './pages/NumberSystems'
import { LogicGates } from './pages/LogicGates'
import { HowComputersWork } from './pages/HowComputersWork'
import { OperatingSystems } from './pages/OperatingSystems'
import { Networking } from './pages/Networking'
import { Programming } from './pages/Programming'
import { Databases } from './pages/Databases'
import { Puzzles } from './pages/Puzzles'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/numbers" element={<NumberSystems />} />
          <Route path="/logic" element={<LogicGates />} />
          <Route path="/computer" element={<HowComputersWork />} />
          <Route path="/os" element={<OperatingSystems />} />
          <Route path="/network" element={<Networking />} />
          <Route path="/programming" element={<Programming />} />
          <Route path="/databases" element={<Databases />} />
          <Route path="/puzzles" element={<Puzzles />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
