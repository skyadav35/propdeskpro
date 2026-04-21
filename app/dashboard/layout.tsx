'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/dashboard',           label: 'Overview',   icon: '▣' },
  { href: '/dashboard/challenge', label: 'Challenge',  icon: '◎' },
  { href: '/dashboard/risk',      label: 'Risk Mgr',   icon: '◈' },
  { href: '/dashboard/journal',   label: 'Journal',    icon: '◧' },
  { href: '/dashboard/stacker',   label: 'Multi-Acct', icon: '◫' },
  { href: '/dashboard/simulator', label: 'Simulator',  icon: '◬' },
]

// ─── Ticker data ─────────────────────────────────────────────────
interface TickerItem { symbol: string; price: string; change: number; label: string }

const PAIRS = [
  { symbol: 'EURUSD=X', label: 'EUR/USD' },
  { symbol: 'GBPUSD=X', label: 'GBP/USD' },
  { symbol: 'USDJPY=X', label: 'USD/JPY' },
  { symbol: 'XAUUSD=X', label: 'XAU/USD' },
  { symbol: 'NQ=F',     label: 'NAS100'  },
  { symbol: 'ES=F',     label: 'S&P500'  },
  { symbol: 'BTC-USD',  label: 'BTC/USD' },
  { symbol: 'ETH-USD',  label: 'ETH/USD' },
]

// Simulated prices with realistic values — updates every 3s with micro-movement
const BASE_PRICES: Record<string, number> = {
  'EUR/USD': 1.0854, 'GBP/USD': 1.2671, 'USD/JPY': 154.32,
  'XAU/USD': 2324.80, 'NAS100': 18204, 'S&P500': 5218,
  'BTC/USD': 67420, 'ETH/USD': 3180,
}

function useTicker() {
  const [items, setItems] = useState<TickerItem[]>(() =>
    PAIRS.map(p => ({
      symbol: p.symbol,
      label: p.label,
      price: BASE_PRICES[p.label]?.toFixed(p.label.includes('JPY') ? 2 : p.label.includes('NAS') || p.label.includes('S&P') || p.label.includes('BTC') || p.label.includes('ETH') || p.label.includes('XAU') ? 2 : 4) || '0',
      change: (Math.random() - 0.5) * 0.4,
    }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        const base = BASE_PRICES[item.label] || 1
        const isJpy = item.label.includes('JPY')
        const isLarge = item.label.includes('NAS') || item.label.includes('S&P') || item.label.includes('BTC') || item.label.includes('ETH') || item.label.includes('XAU')
        const volatility = isLarge ? base * 0.0003 : isJpy ? 0.04 : 0.00015
        const delta = (Math.random() - 0.5) * 2 * volatility
        const currentPrice = parseFloat(item.price)
        const newPrice = Math.max(0.0001, currentPrice + delta)
        const decimals = isJpy ? 2 : isLarge ? 2 : 4
        const dailyChangePct = item.change + (Math.random() - 0.5) * 0.02
        return {
          ...item,
          price: newPrice.toFixed(decimals),
          change: Math.max(-3, Math.min(3, dailyChangePct)),
        }
      }))
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return items
}

// ─── Ticker bar ──────────────────────────────────────────────────
function TickerBar() {
  const items = useTicker()
  const [offset, setOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animId: number
    let pos = 0
    const speed = 0.4
    const animate = () => {
      pos += speed
      const trackW = trackRef.current?.scrollWidth ?? 1000
      if (pos >= trackW / 2) pos = 0
      setOffset(pos)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  const doubled = [...items, ...items]

  return (
    <div style={{
      background: '#080a10',
      borderBottom: '1px solid #1e2538',
      overflow: 'hidden',
      height: 36,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Left fade */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:60, background:'linear-gradient(90deg,#080a10,transparent)', zIndex:2, pointerEvents:'none' }} />
      {/* Right fade */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:60, background:'linear-gradient(270deg,#080a10,transparent)', zIndex:2, pointerEvents:'none' }} />

      <div ref={trackRef} style={{
        display: 'flex', alignItems: 'center',
        transform: `translateX(-${offset}px)`,
        willChange: 'transform',
        whiteSpace: 'nowrap',
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 24px', borderRight: '1px solid #1e2538',
            height: 36,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8892b0', letterSpacing: '.03em' }}>
              {item.label}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              fontFamily: "'DM Mono',monospace",
              color: item.change >= 0 ? '#4ade80' : '#f87171',
            }}>
              {item.label === 'XAU/USD' || item.label === 'NAS100' || item.label === 'S&P500'
                ? parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : item.label === 'BTC/USD' || item.label === 'ETH/USD'
                ? parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : item.price}
            </span>
            <span style={{
              fontSize: 10, fontFamily: "'DM Mono',monospace",
              color: item.change >= 0 ? '#4ade80' : '#f87171',
              background: item.change >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              padding: '1px 5px', borderRadius: 4,
            }}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Nav item ────────────────────────────────────────────────────
function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 9, marginBottom: 2,
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#818cf8' : '#8892b0',
      textDecoration: 'none',
      background: active ? 'rgba(91,106,240,.12)' : 'transparent',
      transition: 'all .15s',
      borderLeft: active ? '2px solid #5b6af0' : '2px solid transparent',
    }}>
      <span style={{ fontSize: 15, opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </Link>
  )
}

// ─── Layout ──────────────────────────────────────────────────────
import { useRef } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080a10', fontFamily: "'Syne',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0d1018',
        borderRight: '1px solid #1e2538',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e2538' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width:32, height:32, background:'#5b6af0', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>⚡</div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#e8edf8' }}>FundPro Plus</div>
              <div style={{ fontSize:10, color:'#4a5580', letterSpacing:'.06em', textTransform:'uppercase' }}>Prop Firm Tools</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {nav.map(item => <NavItem key={item.href} {...item} />)}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #1e2538' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <UserButton afterSignOutUrl="/" />
            <div>
              <div style={{ fontSize:12, color:'#8892b0' }}>Account</div>
              <div style={{ fontSize:10, color:'#4a5580' }}>Manage profile</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ marginLeft:220, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Ticker bar — full width at top */}
        <TickerBar />

        {/* Top bar with time */}
        <div style={{
          background:'#0d1018', borderBottom:'1px solid #1e2538',
          padding:'10px 28px', display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{ fontSize:11, color:'#4a5580', letterSpacing:'.04em' }}>
            <LiveClock />
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#4a5580' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }}></span>
              Live prices
            </div>
            <a href="https://fundproplus.com" target="_blank" style={{ fontSize:11, color:'#4a5580', textDecoration:'none' }}>fundproplus.com</a>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex:1, padding:'28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleString('en-GB', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ fontFamily:"'DM Mono',monospace" }}>{time}</span>
}
