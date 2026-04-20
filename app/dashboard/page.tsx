'use client'
import { useEffect, useRef, useState } from 'react'

interface Trade { pnl: number; date: string; instrument: string; result: string }

function EquityCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState({ totalPnl: 0, winRate: 0, bestTrade: 0, totalTrades: 0 })
  const [animProgress, setAnimProgress] = useState(0)
  const animRef = useRef<number>()

  useEffect(() => {
    fetch('/api/trades').then(r => r.json()).then(d => {
      const t = d.trades || []
      setTrades(t)
      const wins = t.filter((x: Trade) => x.result === 'WIN')
      const totalPnl = t.reduce((s: number, x: Trade) => s + Number(x.pnl), 0)
      const winRate = t.length > 0 ? Math.round(wins.length / t.length * 100) : 0
      const bestTrade = t.length > 0 ? Math.max(...t.map((x: Trade) => Number(x.pnl))) : 0
      setStats({ totalPnl, winRate, bestTrade, totalTrades: t.length })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (trades.length === 0) { setAnimProgress(1); return }
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1800, 1)
      setAnimProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [trades])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const points: number[] = [0]
    let running = 0
    sorted.forEach(t => { running += Number(t.pnl); points.push(running) })

    if (points.length < 2) {
      ctx.strokeStyle = 'rgba(91,106,240,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(40, H/2); ctx.lineTo(W-20, H/2); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = '#4a5580'; ctx.font = '11px DM Mono,monospace'; ctx.textAlign = 'center'
      ctx.fillText('Log your first trade to see the equity curve', W/2, H/2 + 16)
      return
    }

    const visible = points.slice(0, Math.max(2, Math.floor(points.length * animProgress)))
    const minV = Math.min(...visible), maxV = Math.max(...visible)
    const range = maxV - minV || 1
    const pad = { top: 28, bottom: 24, left: 52, right: 16 }
    const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom
    const toX = (i: number) => pad.left + (i / (points.length - 1)) * cW
    const toY = (v: number) => pad.top + cH - ((v - minV) / range) * cH

    // Grid
    ctx.strokeStyle = 'rgba(30,37,56,0.7)'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * cH
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke()
    }
    // Y labels
    ctx.fillStyle = '#4a5580'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const v = minV + (range * (4 - i)) / 4
      ctx.fillText((v >= 0 ? '+' : '') + '$' + Math.round(v).toLocaleString(), pad.left - 6, pad.top + (i/4)*cH + 3)
    }
    // Zero line
    const zY = toY(0)
    if (zY >= pad.top && zY <= H - pad.bottom) {
      ctx.strokeStyle = 'rgba(136,146,176,0.2)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(pad.left, zY); ctx.lineTo(W - pad.right, zY); ctx.stroke(); ctx.setLineDash([])
    }

    const isPos = visible[visible.length - 1] >= 0
    const lineColor = isPos ? '#4ade80' : '#f87171'

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom)
    if (isPos) { grad.addColorStop(0, 'rgba(74,222,128,0.2)'); grad.addColorStop(1, 'rgba(74,222,128,0)') }
    else { grad.addColorStop(0, 'rgba(248,113,113,0)'); grad.addColorStop(1, 'rgba(248,113,113,0.2)') }
    ctx.beginPath(); ctx.moveTo(toX(0), toY(visible[0]))
    visible.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)) })
    ctx.lineTo(toX(visible.length - 1), H - pad.bottom); ctx.lineTo(toX(0), H - pad.bottom)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(toX(0), toY(visible[0]))
    visible.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)) })
    ctx.stroke()

    // Trade dots
    visible.forEach((v, i) => {
      if (i === 0) return
      const t = sorted[i - 1]
      const c = t?.result === 'WIN' ? '#4ade80' : t?.result === 'LOSS' ? '#f87171' : '#fbbf24'
      ctx.beginPath(); ctx.arc(toX(i), toY(v), 3.5, 0, Math.PI*2)
      ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = '#080a10'; ctx.lineWidth = 1.5; ctx.stroke()
    })

    // Live dot at end
    if (visible.length > 1) {
      const lx = toX(visible.length-1), ly = toY(visible[visible.length-1])
      ctx.beginPath(); ctx.arc(lx, ly, 10, 0, Math.PI*2); ctx.fillStyle = `${lineColor}15`; ctx.fill()
      ctx.beginPath(); ctx.arc(lx, ly, 5.5, 0, Math.PI*2); ctx.fillStyle = lineColor; ctx.fill()
      ctx.strokeStyle = '#080a10'; ctx.lineWidth = 2; ctx.stroke()
    }
  }, [trades, animProgress])

  const fmt = (n: number) => (n >= 0 ? '+' : '') + '$' + Math.abs(Math.round(n)).toLocaleString()
  const pnlColor = stats.totalPnl >= 0 ? '#4ade80' : '#f87171'

  return (
    <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#4a5580', marginBottom:4 }}>Total P&L — equity curve</div>
          <div style={{ fontSize:28, fontWeight:700, color:pnlColor, fontFamily:"'DM Mono',monospace", letterSpacing:'-.01em' }}>
            {fmt(stats.totalPnl)}
          </div>
          <div style={{ fontSize:11, color:'#8892b0', marginTop:3 }}>
            {stats.totalTrades} trades · {stats.winRate}% win rate
          </div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#4a5580', marginBottom:3 }}>Best trade</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#4ade80', fontFamily:"'DM Mono',monospace" }}>{fmt(stats.bestTrade)}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#4a5580', marginBottom:3 }}>Win rate</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#818cf8', fontFamily:"'DM Mono',monospace" }}>{stats.winRate}%</div>
          </div>
        </div>
      </div>
      <div style={{ position:'relative', width:'100%', height:220 }}>
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      </div>
      <div style={{ display:'flex', gap:16, marginTop:10, fontSize:11, color:'#4a5580' }}>
        {[['#4ade80','Win'],['#f87171','Loss'],['#fbbf24','Break even']].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}></span>{l}
          </span>
        ))}
        <span style={{ marginLeft:'auto', color:'#4a5580' }}>Each dot = one trade</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#e8edf8', marginBottom:4, letterSpacing:'-.02em' }}>Overview</h1>
        <p style={{ fontSize:13, color:'#8892b0' }}>Your prop firm trading command center.</p>
      </div>

      {/* Equity Curve — full width */}
      <div style={{ marginBottom:16 }}>
        <EquityCurve />
      </div>

      {/* Quick access + CTA */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
          <div style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#4a5580', marginBottom:12, paddingBottom:8, borderBottom:'1px solid #1e2538' }}>Quick access</div>
          {[
            { label:'Challenge Tracker', href:'/dashboard/challenge', color:'#818cf8', desc:'Track evaluation progress' },
            { label:'Risk Manager',      href:'/dashboard/risk',      color:'#fbbf24', desc:'Calculate position sizes' },
            { label:'Trade Journal',     href:'/dashboard/journal',   color:'#4ade80', desc:'Log and review trades' },
            { label:'Simulator',         href:'/dashboard/simulator', color:'#f472b6', desc:'Test before buying challenge' },
            { label:'Multi-Account',     href:'/dashboard/stacker',   color:'#38bdf8', desc:'Track all funded accounts' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 10px', borderRadius:9, textDecoration:'none', transition:'background .15s' }}
               onMouseEnter={e=>(e.currentTarget.style.background='#111520')}
               onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:item.color, display:'inline-block', flexShrink:0 }}></span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.label}</div>
                <div style={{ fontSize:11, color:'#8892b0' }}>{item.desc}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'linear-gradient(135deg,rgba(91,106,240,.15),rgba(91,106,240,.05))', border:'1px solid rgba(91,106,240,.3)', borderRadius:14, padding:'20px 22px', flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#e8edf8', marginBottom:6 }}>Ready to get funded?</div>
            <div style={{ fontSize:12, color:'#8892b0', marginBottom:16, lineHeight:1.6 }}>
              Run the Monte Carlo simulator to know your pass probability before spending $500 on a real challenge.
            </div>
            <a href='/dashboard/simulator' style={{ display:'inline-block', padding:'9px 18px', background:'#5b6af0', borderRadius:9, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none' }}>
              Run simulator →
            </a>
          </div>
          <div style={{ background:'linear-gradient(135deg,rgba(74,222,128,.1),rgba(74,222,128,.03))', border:'1px solid rgba(74,222,128,.2)', borderRadius:14, padding:'16px 20px' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#4ade80', marginBottom:4 }}>Log your trades daily</div>
            <div style={{ fontSize:12, color:'#8892b0', marginBottom:12 }}>The equity curve above updates every time you log a trade.</div>
            <a href='/dashboard/journal' style={{ display:'inline-block', padding:'7px 14px', background:'rgba(74,222,128,.15)', borderRadius:9, fontSize:12, fontWeight:600, color:'#4ade80', textDecoration:'none' }}>
              Open journal →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
