'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const nav = [
  { group:'Trading Tools', items:[
    { href:'/dashboard',            label:'Overview',     icon:'⊞' },
    { href:'/dashboard/challenge',  label:'Challenge',    icon:'◎' },
    { href:'/dashboard/risk',       label:'Risk Mgr',     icon:'◈' },
    { href:'/dashboard/journal',    label:'Journal',      icon:'◧' },
    { href:'/dashboard/stacker',    label:'Multi-Acct',   icon:'◫' },
    { href:'/dashboard/simulator',  label:'Simulator',    icon:'◬' },
    { href:'/dashboard/trading',    label:'Trading Desk', icon:'💹', badge:'NEW' },
  ]},
  { group:'Market Data', items:[
    { href:'/dashboard/charts',     label:'Live Charts',  icon:'📈' },
    { href:'/dashboard/sessions',   label:'Sessions',     icon:'🕐' },
    { href:'/dashboard/calendar',   label:'Econ Calendar',icon:'📅' },
    { href:'/dashboard/news',       label:'News Feed',    icon:'📰' },
  ]},
  { group:'AI Tools', items:[
    { href:'/dashboard/ai-review',  label:'AI Review',    icon:'🤖', badge:'NEW' },
  ]},
  { group:'Earn', items:[
    { href:'/dashboard/affiliates', label:'Affiliates',   icon:'🤝', badge:'💰' },
  ]},
]

const BASE: Record<string,number> = {
  'EUR/USD':1.0853,'GBP/USD':1.2677,'USD/JPY':154.31,
  'XAU/USD':2324.80,'NAS100':18204,'BTC/USD':67488,'ETH/USD':3179,
}

interface TickerItem { label:string; price:string; change:number }

function useTicker() {
  const [items, setItems] = useState<TickerItem[]>(() =>
    Object.entries(BASE).map(([label, base]) => ({
      label,
      price: base.toFixed(['USD/JPY','XAU/USD','NAS100','BTC/USD','ETH/USD'].some(x=>label===x)?2:4),
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
        return { ...item, price: newP.toFixed(isJpy||isLarge?2:4), change: Math.max(-3,Math.min(3,item.change+(Math.random()-.5)*0.02)) }
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
    <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF0', overflow:'hidden', height:40, display:'flex', alignItems:'center', position:'relative', flexShrink:0 }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:32, background:'linear-gradient(90deg,#fff,transparent)', zIndex:2, pointerEvents:'none' }} />
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:32, background:'linear-gradient(270deg,#fff,transparent)', zIndex:2, pointerEvents:'none' }} />
      <div ref={trackRef} style={{ display:'flex', alignItems:'center', transform:`translateX(-${offset}px)`, willChange:'transform', whiteSpace:'nowrap' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0 16px', borderRight:'1px solid #F0F2F5', height:40 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#5A6078' }}>{item.label}</span>
            <span style={{ fontSize:12, fontWeight:700, fontFamily:'SF Mono,monospace', color:item.change>=0?'#00B386':'#F44336' }}>
              {['XAU/USD','NAS100'].includes(item.label)?parseFloat(item.price).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):['BTC/USD','ETH/USD'].includes(item.label)?parseFloat(item.price).toLocaleString('en-US',{maximumFractionDigits:0}):item.price}
            </span>
            <span style={{ fontSize:10, padding:'1px 5px', borderRadius:4, fontFamily:'SF Mono,monospace', fontWeight:600, background:item.change>=0?'#E8FBF5':'#FFEBEE', color:item.change>=0?'#007A5C':'#C62828' }}>
              {item.change>=0?'▲':'▼'}{Math.abs(item.change).toFixed(2)}%
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
  return <span style={{ fontFamily:'SF Mono,monospace', fontSize:11, color:'#9EA6C0' }}>{time}</span>
}

function NavItem({ href, label, icon, badge, onClick }: { href:string; label:string; icon:string; badge?:string; onClick?:()=>void }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:9,
      padding:'9px 12px', borderRadius:10, marginBottom:1,
      fontSize:13, fontWeight:active?700:500,
      color:active?'#007A5C':'#5A6078',
      textDecoration:'none',
      background:active?'#E8FBF5':'transparent',
      transition:'all .15s',
      borderLeft:active?'3px solid #00B386':'3px solid transparent',
    }}>
      <span style={{ fontSize:14, opacity:active?1:0.6 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {badge && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:20, background:'#F44336', color:'#fff', fontWeight:800 }}>{badge}</span>}
    </Link>
  )
}

function Sidebar({ onClose }: { onClose?: ()=>void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo */}
      <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #E8EAF0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, boxShadow:'0 4px 12px rgba(0,179,134,0.3)' }}>⚡</div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif", lineHeight:1.2 }}>FundPro Plus</div>
            <div style={{ fontSize:10, color:'#9EA6C0', letterSpacing:'.05em', textTransform:'uppercase' }}>Prop Firm Tools</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:16, color:'#5A6078', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {nav.map(group => (
          <div key={group.group} style={{ marginBottom:8 }}>
            <div style={{ fontSize:10, letterSpacing:'.07em', textTransform:'uppercase', color:'#C4CAD9', padding:'6px 12px 3px', fontWeight:700 }}>{group.group}</div>
            {group.items.map(item => <NavItem key={item.href} {...item} onClick={onClose}/>)}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid #E8EAF0', background:'#FAFBFC' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <UserButton afterSignOutUrl="/"/>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'#1A1D2E' }}>Account</div>
            <div style={{ fontSize:10, color:'#9EA6C0' }}>fundproplus.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close sidebar on route change
  const pathname = usePathname()
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:'#F0F2F5', fontFamily:"'Nunito Sans',sans-serif" }}>

        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{
          width:230, background:'#fff',
          borderRight:'1px solid #E8EAF0',
          position:'fixed', top:0, left:0, height:'100vh', zIndex:50,
          boxShadow:'2px 0 12px rgba(0,0,0,0.04)',
        }}>
          <Sidebar/>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="mobile-overlay" onClick={()=>setMobileOpen(false)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:99,
            backdropFilter:'blur(2px)'
          }}/>
        )}

        {/* Mobile sidebar drawer */}
        <aside style={{
          position:'fixed', top:0, left:0, height:'100vh', zIndex:100,
          width:260, background:'#fff',
          boxShadow:'4px 0 24px rgba(0,0,0,0.15)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform .25s cubic-bezier(.4,0,.2,1)',
          display:'flex', flexDirection:'column',
        }}>
          <Sidebar onClose={()=>setMobileOpen(false)}/>
        </aside>

        {/* Main area */}
        <div className="main-content" style={{ marginLeft:230, flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* Mobile top bar */}
          <div className="mobile-topbar" style={{
            display:'none', background:'#fff', borderBottom:'1px solid #E8EAF0',
            padding:'10px 16px', alignItems:'center', justifyContent:'space-between',
            position:'sticky', top:0, zIndex:40,
          }}>
            <button onClick={()=>setMobileOpen(true)} style={{
              background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:10,
              width:38, height:38, cursor:'pointer', fontSize:18, color:'#1A1D2E',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>☰</button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
              <span style={{ fontWeight:800, fontSize:14, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>FundPro Plus</span>
            </div>
            <UserButton afterSignOutUrl="/"/>
          </div>

          {/* Ticker bar */}
          <TickerBar/>

          {/* Sub-topbar */}
          <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF0', padding:'8px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <LiveClock/>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#9EA6C0' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#00B386', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }}></span>
              Live
            </div>
          </div>

          {/* Page content */}
          <main style={{ flex:1, padding:'20px 20px 40px' }}>
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        * { -webkit-tap-highlight-color: transparent; }
        a, button { touch-action: manipulation; }
      `}</style>
    </>
  )
}
