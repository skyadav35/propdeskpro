'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const nav = [
  { href: '/dashboard',           label: 'Overview',   icon: '⊞' },
  { href: '/dashboard/challenge', label: 'Challenge',  icon: '◎' },
  { href: '/dashboard/risk',      label: 'Risk Mgr',   icon: '◈' },
  { href: '/dashboard/journal',   label: 'Journal',    icon: '◧' },
  { href: '/dashboard/stacker',   label: 'Multi-Acct', icon: '◫' },
  { href: '/dashboard/simulator', label: 'Simulator',  icon: '◬' },
]

const BASE: Record<string, number> = {
  'EUR/USD':1.0853,'GBP/USD':1.2677,'USD/JPY':154.31,
  'XAU/USD':2324.80,'NAS100':18204,'BTC/USD':67488,'ETH/USD':3179,
}

interface TickerItem { label:string; price:string; change:number }

function useTicker() {
  const [items, setItems] = useState<TickerItem[]>(() =>
    Object.entries(BASE).map(([label, base]) => ({
      label, price: base.toFixed(label.includes('JPY')||label.includes('NAS')||label.includes('XAU')||label.includes('BTC')||label.includes('ETH')?2:4),
      change: (Math.random()-.5)*.4
    }))
  )
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => prev.map(item => {
        const base = BASE[item.label]||1
        const isLarge = ['NAS100','BTC/USD','ETH/USD','XAU/USD'].includes(item.label)
        const isJpy = item.label.includes('JPY')
        const vol = isLarge ? base*0.0003 : isJpy ? 0.04 : 0.00015
        const delta = (Math.random()-.5)*2*vol
        const newP = Math.max(0.0001, parseFloat(item.price)+delta)
        const dec = isJpy||isLarge ? 2 : 4
        return { ...item, price: newP.toFixed(dec), change: Math.max(-3, Math.min(3, item.change+(Math.random()-.5)*0.02)) }
      }))
    }, 3000)
    return () => clearInterval(id)
  }, [])
  return items
}

function TickerBar() {
  const items = useTicker()
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let id: number, pos = 0
    const tick = () => {
      pos += 0.5
      const w = trackRef.current?.scrollWidth ?? 1200
      if (pos >= w/2) pos = 0
      setOffset(pos); id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  const doubled = [...items, ...items]

  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF0', overflow:'hidden', height:40, display:'flex', alignItems:'center', position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:48, background:'linear-gradient(90deg,#fff,transparent)', zIndex:2, pointerEvents:'none' }} />
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:48, background:'linear-gradient(270deg,#fff,transparent)', zIndex:2, pointerEvents:'none' }} />
      <div ref={trackRef} style={{ display:'flex', alignItems:'center', transform:`translateX(-${offset}px)`, willChange:'transform', whiteSpace:'nowrap' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'0 20px', borderRight:'1px solid #F0F2F5', height:40 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#5A6078', fontFamily:"'Nunito Sans',sans-serif" }}>{item.label}</span>
            <span style={{ fontSize:13, fontWeight:700, fontFamily:'SF Mono,monospace', color: item.change>=0?'#00B386':'#F44336' }}>
              {['XAU/USD','NAS100'].includes(item.label) ? parseFloat(item.price).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) : item.label==='BTC/USD' ? parseFloat(item.price).toLocaleString('en-US',{maximumFractionDigits:0}) : item.price}
            </span>
            <span style={{ fontSize:11, padding:'1px 6px', borderRadius:4, fontFamily:'SF Mono,monospace', fontWeight:600,
              background: item.change>=0?'#E8FBF5':'#FFEBEE', color: item.change>=0?'#007A5C':'#C62828' }}>
              {item.change>=0?'▲':'▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const u = () => setTime(new Date().toLocaleString('en-GB',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    u(); const id = setInterval(u,1000); return () => clearInterval(id)
  }, [])
  return <span style={{ fontFamily:'SF Mono,monospace', fontSize:12, color:'#9EA6C0' }}>{time}</span>
}

function NavItem({ href, label, icon }: { href:string; label:string; icon:string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'10px 14px', borderRadius:10, marginBottom:2,
      fontSize:13, fontWeight: active?700:500,
      color: active?'#007A5C':'#5A6078',
      textDecoration:'none',
      background: active?'#E8FBF5':'transparent',
      transition:'all .15s',
      borderLeft: active?'3px solid #00B386':'3px solid transparent',
    }}>
      <span style={{ fontSize:15, opacity: active?1:0.6 }}>{icon}</span>
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F0F2F5', fontFamily:"'Nunito Sans',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width:228, background:'#fff',
        borderRight:'1px solid #E8EAF0',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, height:'100vh', zIndex:50,
        boxShadow:'2px 0 12px rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{ padding:'18px 18px 14px', borderBottom:'1px solid #E8EAF0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, boxShadow:'0 4px 12px rgba(0,179,134,0.3)' }}>⚡</div>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif", lineHeight:1.2 }}>FundPro Plus</div>
              <div style={{ fontSize:10, color:'#9EA6C0', letterSpacing:'.05em', textTransform:'uppercase' }}>Prop Firm Tools</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
          <div style={{ fontSize:10, letterSpacing:'.07em', textTransform:'uppercase', color:'#C4CAD9', padding:'6px 14px 4px', fontWeight:600 }}>Main menu</div>
          {nav.map(item => <NavItem key={item.href} {...item} />)}
        </nav>

        {/* User */}
        <div style={{ padding:'14px 18px', borderTop:'1px solid #E8EAF0', background:'#FAFBFC' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <UserButton afterSignOutUrl="/" />
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A1D2E' }}>Account</div>
              <div style={{ fontSize:11, color:'#9EA6C0' }}>Manage profile</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft:228, flex:1, display:'flex', flexDirection:'column' }}>
        {/* Ticker */}
        <TickerBar />

        {/* Top bar */}
        <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF0', padding:'10px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <LiveClock />
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9EA6C0' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#00B386', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }}></span>
            Live market data
          </div>
        </div>

        {/* Content */}
        <main style={{ flex:1, padding:'24px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
