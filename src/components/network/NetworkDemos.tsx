import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── OSI model ───────────────────────────────────────────────────────────────
const LAYERS = [
  { n: 7, name: 'Application', pdu: 'Data', proto: 'HTTP, DNS, SMTP', color: '#00ff41' },
  { n: 6, name: 'Presentation', pdu: 'Data', proto: 'TLS, JPEG, ASCII', color: '#22dd66' },
  { n: 5, name: 'Session', pdu: 'Data', proto: 'Sockets, RPC', color: '#00e5ff' },
  { n: 4, name: 'Transport', pdu: 'Segment', proto: 'TCP, UDP', color: '#00b4ff' },
  { n: 3, name: 'Network', pdu: 'Packet', proto: 'IP, ICMP', color: '#ffb300' },
  { n: 2, name: 'Data Link', pdu: 'Frame', proto: 'Ethernet, MAC', color: '#ff7a00' },
  { n: 1, name: 'Physical', pdu: 'Bits', proto: 'Cables, radio', color: '#ff2e97' },
]
export function OSIModel() {
  const [active, setActive] = useState<number | null>(null)
  const [traveling, setTraveling] = useState(false)
  function send() { setTraveling(true); let i = 0; const id = setInterval(() => { setActive(LAYERS[i].n); i++; if (i >= LAYERS.length) { clearInterval(id); setTimeout(() => { setTraveling(false); setActive(null) }, 600) } }, 350) }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {LAYERS.map(l => (
          <motion.button key={l.n} onClick={() => setActive(active === l.n ? null : l.n)}
            animate={{ scale: active === l.n ? 1.02 : 1, x: active === l.n ? 6 : 0 }}
            className="flex items-center gap-3 px-3 py-2 rounded text-left transition-all"
            style={{ background: active === l.n ? `${l.color}20` : `${l.color}08`, border: `1px solid ${active === l.n ? l.color : l.color + '25'}`, boxShadow: active === l.n ? `0 0 14px ${l.color}40` : 'none' }}>
            <span className="w-5 text-xs font-bold font-mono" style={{ color: l.color }}>L{l.n}</span>
            <span className="text-sm font-semibold" style={{ color: l.color }}>{l.name}</span>
            <span className="ml-auto text-[10px] text-white/40">{l.pdu}</span>
            {active === l.n && <span className="text-[10px] text-white/50 font-mono">{l.proto}</span>}
          </motion.button>
        ))}
      </div>
      <button onClick={send} disabled={traveling} className="btn-term text-xs self-start disabled:opacity-50">▶ send packet (encapsulation L7→L1)</button>
      <p className="text-xs text-white/40">Each layer wraps the data with its own header (encapsulation) going down, and unwraps it going up at the receiver.</p>
    </div>
  )
}

// ─── TCP 3-way handshake ─────────────────────────────────────────────────────
const HANDSHAKE = [
  { from: 'client', label: 'SYN', detail: 'seq=x', color: '#00ff41' },
  { from: 'server', label: 'SYN-ACK', detail: 'seq=y, ack=x+1', color: '#ffb300' },
  { from: 'client', label: 'ACK', detail: 'ack=y+1', color: '#00e5ff' },
]
export function TCPHandshake() {
  const [step, setStep] = useState(-1)
  const [done, setDone] = useState(false)
  function run() { setDone(false); setStep(-1); let i = 0; const id = setInterval(() => { setStep(i); i++; if (i >= HANDSHAKE.length) { clearInterval(id); setTimeout(() => setDone(true), 700) } }, 900) }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-4">
        <div className="text-center"><div className="w-14 h-14 rounded-lg border-2 border-term/50 bg-term/10 flex items-center justify-center text-term font-bold">CLI</div><div className="text-[10px] text-white/40 mt-1">client</div></div>
        <div className="flex-1 relative h-40 mx-3">
          {HANDSHAKE.map((h, i) => (
            <AnimatePresence key={i}>
              {step >= i && (
                <motion.div initial={{ opacity: 0, x: h.from === 'client' ? 0 : '100%' }} animate={{ opacity: 1, x: h.from === 'client' ? '100%' : 0 }} transition={{ duration: 0.8 }}
                  className="absolute flex flex-col items-center" style={{ top: i * 46 + 8, [h.from === 'client' ? 'left' : 'right']: 0 }}>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded" style={{ color: h.color, background: `${h.color}15`, border: `1px solid ${h.color}40` }}>{h.from === 'client' ? '→' : '←'} {h.label}</span>
                  <span className="text-[9px] text-white/40 mt-0.5">{h.detail}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
        <div className="text-center"><div className="w-14 h-14 rounded-lg border-2 border-amber/50 bg-amber/10 flex items-center justify-center text-amber font-bold">SRV</div><div className="text-[10px] text-white/40 mt-1">server</div></div>
      </div>
      {done && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-mono text-term">✓ connection ESTABLISHED — data transfer can begin</motion.div>}
      <button onClick={run} className="btn-term text-xs self-start">▶ initiate handshake</button>
    </div>
  )
}

// ─── DNS resolution ──────────────────────────────────────────────────────────
const DNS_STEPS = [
  { from: 'Browser', to: 'Resolver', q: 'where is example.com?', color: '#00ff41' },
  { from: 'Resolver', to: 'Root (.)', q: 'ask root nameserver', color: '#00e5ff' },
  { from: 'Root', to: 'TLD (.com)', q: '→ go to .com TLD', color: '#ffb300' },
  { from: 'TLD', to: 'Authoritative', q: '→ go to authoritative NS', color: '#ff7a00' },
  { from: 'Authoritative', to: 'Resolver', q: '93.184.216.34', color: '#ff2e97' },
]
export function DNSResolution() {
  const [step, setStep] = useState(-1)
  const [cached, setCached] = useState(false)
  function run(useCache: boolean) { setCached(useCache); setStep(-1); const limit = useCache ? 1 : DNS_STEPS.length; let i = 0; const id = setInterval(() => { setStep(i); i++; if (i >= limit) clearInterval(id) }, 700) }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {DNS_STEPS.map((s, i) => (
          <motion.div key={i} animate={{ opacity: step >= i ? 1 : 0.25, x: step === i ? 6 : 0 }} className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
            style={{ background: step >= i ? `${s.color}12` : 'transparent', border: `1px solid ${step >= i ? s.color + '40' : '#1a1a1a'}` }}>
            <span className="font-bold" style={{ color: s.color }}>{s.from}</span>
            <span className="text-white/30">→</span>
            <span className="text-white/60">{s.to}</span>
            <span className="ml-auto text-white/40">{s.q}</span>
            {cached && i === 0 && <span className="text-term text-[10px]">⚡ CACHED</span>}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => run(false)} className="btn-term text-xs">▶ resolve (cold)</button>
        <button onClick={() => run(true)} className="btn-amber text-xs">▶ resolve (cached)</button>
      </div>
      <p className="text-xs text-white/40">A cold lookup walks the full hierarchy. Once cached by the resolver, repeat queries return instantly.</p>
    </div>
  )
}
