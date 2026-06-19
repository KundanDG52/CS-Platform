import { useEffect } from 'react'
import { SectionHeader, TermWindow } from '../components/shared/Panel'
import { OSIModel, TCPHandshake, DNSResolution } from '../components/network/NetworkDemos'
import { useStore } from '../store'

export function Networking() {
  const { completeSection, addXP } = useStore()
  useEffect(() => { addXP(10); completeSection('network') }, [])
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <SectionHeader icon="⇄" name="Networking" sub="OSI model · TCP/IP · DNS · HTTP" color="#00ff41" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TermWindow title="osi_model.layers" color="#00ff41"><OSIModel /></TermWindow>
        <TermWindow title="tcp_handshake.pcap" color="#ffb300" delay={0.05}><TCPHandshake /></TermWindow>
      </div>
      <TermWindow title="dns_resolve --trace" color="#00e5ff" delay={0.1}><DNSResolution /></TermWindow>
      <TermWindow title="http_status_codes" color="#ff2e97" delay={0.15}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { c: '2xx', t: 'Success', e: '200 OK · 201 Created', col: '#00ff41' },
            { c: '3xx', t: 'Redirect', e: '301 Moved · 304 Not Mod', col: '#00e5ff' },
            { c: '4xx', t: 'Client Error', e: '404 · 401 · 403', col: '#ffb300' },
            { c: '5xx', t: 'Server Error', e: '500 · 502 · 503', col: '#ff2e97' },
          ].map(s => <div key={s.c} className="panel rounded p-3" style={{ borderColor: `${s.col}30` }}><div className="font-bold text-base" style={{ color: s.col }}>{s.c}</div><div className="text-white/60">{s.t}</div><div className="text-white/35 text-[10px] mt-1">{s.e}</div></div>)}
        </div>
      </TermWindow>
    </div>
  )
}
