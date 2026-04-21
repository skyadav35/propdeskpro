'use client'
import { useState, useEffect, useCallback } from 'react'

interface Trade {
  id: string; date: string; instrument: string; direction: string;
  session: string; entryPrice: number; exitPrice: number; lotSize: number;
  pnl: number; result: string; setup: string; notes: string
}

// ─── Heatmap Calendar ────────────────────────────────────────────
function HeatmapCalendar({ trades }: { trades: Trade[] }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  // Build daily P&L map
  const dailyMap: Record<string, { pnl: number; trades: number; wins: number }> = {}
  trades.forEach(t => {
    const key = t.date.split('T')[0]
    if (!dailyMap[key]) dailyMap[key] = { pnl: 0, trades: 0, wins: 0 }
    dailyMap[key].pnl += Number(t.pnl)
    dailyMap[key].trades++
    if (t.result === 'WIN') dailyMap[key].wins++
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const allPnls = Object.values(dailyMap).map(d => d.pnl)
  const maxAbs = Math.max(...allPnls.map(Math.abs), 1)

  const getColor = (pnl: number) => {
    const intensity = Math.min(Math.abs(pnl) / maxAbs, 1)
    if (pnl > 0) {
      const g = Math.round(100 + intensity * 122)
      return `rgba(${Math.round(20 - intensity * 10)}, ${g}, ${Math.round(40 + intensity * 40)}, ${0.3 + intensity * 0.7})`
    }
    if (pnl < 0) {
      const r = Math.round(150 + intensity * 98)
      return `rgba(${r}, ${Math.round(30 - intensity * 10)}, ${Math.round(30 - intensity * 10)}, ${0.3 + intensity * 0.7})`
    }
    return 'transparent'
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const monthPnl = Object.entries(dailyMap)
    .filter(([k]) => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    .reduce((s, [,v]) => s + v.pnl, 0)

  const monthTrades = Object.entries(dailyMap)
    .filter(([k]) => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    .reduce((s, [,v]) => s + v.trades, 0)

  const [tooltip, setTooltip] = useState<{ day: number; x: number; y: number } | null>(null)

  return (
    <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#4a5580', marginBottom:4 }}>P&L calendar</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:20, fontWeight:700, color: monthPnl >= 0 ? '#4ade80' : '#f87171', fontFamily:"'DM Mono',monospace" }}>
              {monthPnl >= 0 ? '+' : ''}${Math.round(Math.abs(monthPnl)).toLocaleString()}
            </span>
            <span style={{ fontSize:12, color:'#8892b0' }}>{monthTrades} trades this month</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={prev} style={{ width:28, height:28, borderRadius:7, background:'transparent', border:'1px solid #1e2538', color:'#8892b0', cursor:'pointer', fontSize:12 }}>‹</button>
          <span style={{ fontSize:13, fontWeight:600, color:'#e8edf8', minWidth:130, textAlign:'center' }}>{monthName}</span>
          <button onClick={next} style={{ width:28, height:28, borderRadius:7, background:'transparent', border:'1px solid #1e2538', color:'#8892b0', cursor:'pointer', fontSize:12 }}>›</button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'#4a5580', letterSpacing:'.04em', padding:'2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, position:'relative' }}>
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const data = dailyMap[key]
          const isToday = new Date().toISOString().split('T')[0] === key
          const isWeekend = [0,6].includes(new Date(year, month, day).getDay())

          return (
            <div
              key={day}
              onMouseEnter={e => setTooltip({ day, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                background: data ? getColor(data.pnl) : isWeekend ? 'rgba(30,37,56,0.3)' : 'rgba(30,37,56,0.5)',
                border: isToday ? '1.5px solid #5b6af0' : '1px solid rgba(30,37,56,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: data ? 'pointer' : 'default',
                transition: 'transform .1s, box-shadow .1s',
                position: 'relative',
              }}
              onMouseOver={e => { if (data) { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLElement).style.zIndex = '10' } }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.zIndex = '1' }}
            >
              <span style={{ fontSize: 10, color: data ? '#e8edf8' : isWeekend ? '#2a3355' : '#4a5580', fontWeight: isToday ? 700 : 400 }}>{day}</span>
              {data && (
                <span style={{ fontSize: 8, color: data.pnl >= 0 ? '#4ade80' : '#f87171', fontFamily:"'DM Mono',monospace", lineHeight:1 }}>
                  {data.pnl >= 0 ? '+' : ''}{Math.round(data.pnl)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', gap:20, marginTop:14, fontSize:11, color:'#4a5580' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', gap:2 }}>
            {[0.2,0.5,0.8,1].map(i => (
              <div key={i} style={{ width:14, height:14, borderRadius:3, background:`rgba(20,${Math.round(100+i*122)},${Math.round(40+i*40)},${0.3+i*0.7})` }} />
            ))}
          </div>
          <span>Profit</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', gap:2 }}>
            {[0.2,0.5,0.8,1].map(i => (
              <div key={i} style={{ width:14, height:14, borderRadius:3, background:`rgba(${Math.round(150+i*98)},20,20,${0.3+i*0.7})` }} />
            ))}
          </div>
          <span>Loss</span>
        </div>
        <span style={{ marginLeft:'auto' }}>Hover a day for details</span>
      </div>

      {/* Tooltip */}
      {tooltip && (() => {
        const key = `${year}-${String(month+1).padStart(2,'0')}-${String(tooltip.day).padStart(2,'0')}`
        const data = dailyMap[key]
        if (!data) return null
        return (
          <div style={{
            position:'fixed', left: tooltip.x + 12, top: tooltip.y - 60,
            background:'#161c28', border:'1px solid #263048', borderRadius:10,
            padding:'10px 14px', fontSize:12, zIndex:999, pointerEvents:'none',
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontWeight:600, color:'#e8edf8', marginBottom:4 }}>
              {new Date(year, month, tooltip.day).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
            </div>
            <div style={{ color: data.pnl >= 0 ? '#4ade80' : '#f87171', fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700 }}>
              {data.pnl >= 0 ? '+' : ''}${Math.round(data.pnl).toLocaleString()}
            </div>
            <div style={{ color:'#8892b0', marginTop:2 }}>{data.trades} trade{data.trades !== 1 ? 's' : ''} · {data.wins} win{data.wins !== 1 ? 's' : ''}</div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Yearly Heatmap (GitHub style) ───────────────────────────────
function YearlyHeatmap({ trades }: { trades: Trade[] }) {
  const dailyMap: Record<string, number> = {}
  trades.forEach(t => {
    const key = t.date.split('T')[0]
    dailyMap[key] = (dailyMap[key] || 0) + Number(t.pnl)
  })

  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 364)

  const days: { date: string; pnl: number | null }[] = []
  const cur = new Date(start)
  while (cur <= today) {
    const key = cur.toISOString().split('T')[0]
    days.push({ date: key, pnl: dailyMap[key] ?? null })
    cur.setDate(cur.getDate() + 1)
  }

  const allPnls = days.filter(d => d.pnl !== null).map(d => d.pnl as number)
  const maxAbs = Math.max(...allPnls.map(Math.abs), 1)

  // Pad to start on Sunday
  const startDay = start.getDay()
  const padded = [...Array(startDay).fill(null), ...days]

  const weeks: ({ date: string; pnl: number | null } | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7) as any)
  }

  const months: { label: string; col: number }[] = []
  weeks.forEach((week, wi) => {
    week.forEach(day => {
      if (day && day.date) {
        const d = new Date(day.date)
        if (d.getDate() <= 7) {
          const label = d.toLocaleString('en-US', { month: 'short' })
          if (!months.length || months[months.length-1].label !== label) {
            months.push({ label, col: wi })
          }
        }
      }
    })
  })

  const getColor = (pnl: number | null) => {
    if (pnl === null) return '#111520'
    if (pnl === 0) return '#1e2538'
    const i = Math.min(Math.abs(pnl) / maxAbs, 1)
    if (pnl > 0) return `rgba(${Math.round(20 - i*10)},${Math.round(100+i*122)},${Math.round(40+i*40)},${0.4+i*0.6})`
    return `rgba(${Math.round(150+i*98)},20,20,${0.4+i*0.6})`
  }

  const totalPnl = allPnls.reduce((s, v) => s + v, 0)
  const tradingDays = allPnls.filter(v => v !== 0).length

  return (
    <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#4a5580', marginBottom:4 }}>365-day performance</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:18, fontWeight:700, color: totalPnl >= 0 ? '#4ade80' : '#f87171', fontFamily:"'DM Mono',monospace" }}>
              {totalPnl >= 0 ? '+' : ''}${Math.round(Math.abs(totalPnl)).toLocaleString()}
            </span>
            <span style={{ fontSize:12, color:'#8892b0' }}>{tradingDays} active days</span>
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${weeks.length},1fr)`, marginBottom:4, position:'relative', height:16 }}>
        {months.map((m, i) => (
          <div key={i} style={{ position:'absolute', left:`${(m.col / weeks.length) * 100}%`, fontSize:10, color:'#4a5580' }}>{m.label}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${weeks.length},1fr)`, gap:2 }}>
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <div key={`${wi}-${di}`} title={day ? `${day.date}: ${day.pnl !== null ? (day.pnl >= 0 ? '+' : '') + '$' + Math.round(day.pnl) : 'No trades'}` : ''} style={{
              height: 11, borderRadius: 2,
              background: day ? getColor(day.pnl) : 'transparent',
              cursor: day?.pnl !== null ? 'pointer' : 'default',
            }} />
          ))
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6, marginTop:10, fontSize:10, color:'#4a5580' }}>
        <span>Less</span>
        {[0.1,0.3,0.6,0.85,1].map(i => (
          <div key={i} style={{ width:11, height:11, borderRadius:2, background:`rgba(${Math.round(20-i*10)},${Math.round(100+i*122)},${Math.round(40+i*40)},${0.4+i*0.6})` }} />
        ))}
        <span>More profit</span>
      </div>
    </div>
  )
}

// ─── Stats row ───────────────────────────────────────────────────
function StatsRow({ trades }: { trades: Trade[] }) {
  const wins = trades.filter(t => t.result === 'WIN')
  const losses = trades.filter(t => t.result === 'LOSS')
  const totalPnl = trades.reduce((s, t) => s + Number(t.pnl), 0)
  const winRate = trades.length > 0 ? Math.round(wins.length / (wins.length + losses.length || 1) * 100) : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length) : 0
  const pf = avgLoss > 0 ? (wins.length * avgWin) / (losses.length * avgLoss) : 0
  const best = trades.length > 0 ? Math.max(...trades.map(t => Number(t.pnl))) : 0
  const worst = trades.length > 0 ? Math.min(...trades.map(t => Number(t.pnl))) : 0

  const stats = [
    { label:'Total P&L',     val: (totalPnl >= 0 ? '+' : '') + '$' + Math.abs(Math.round(totalPnl)).toLocaleString(), color: totalPnl >= 0 ? '#4ade80' : '#f87171' },
    { label:'Win rate',      val: winRate + '%',                                                color: winRate >= 50 ? '#4ade80' : '#f87171' },
    { label:'Profit factor', val: pf ? pf.toFixed(2) : '—',                                    color: pf >= 1.5 ? '#4ade80' : pf >= 1 ? '#fbbf24' : '#f87171' },
    { label:'Best trade',    val: '+$' + Math.round(best).toLocaleString(),                     color: '#4ade80' },
    { label:'Worst trade',   val: '$' + Math.round(Math.abs(worst)).toLocaleString(),           color: '#f87171' },
    { label:'Total trades',  val: trades.length.toString(),                                      color: '#818cf8' },
  ]

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:10, padding:'12px 14px' }}>
          <div style={{ fontSize:10, letterSpacing:'.07em', textTransform:'uppercase', color:'#4a5580', marginBottom:5 }}>{s.label}</div>
          <div style={{ fontSize:18, fontWeight:700, color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.val}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Journal Page ───────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width:'100%', padding:'8px 10px', fontSize:13,
  background:'#111520', border:'1px solid #1e2538',
  borderRadius:8, color:'#e8edf8', outline:'none', fontFamily:"'DM Mono',monospace"
}
const selStyle: React.CSSProperties = { ...inputStyle }

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'log' | 'heatmap' | 'yearly'>('log')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [inst, setInst] = useState('EUR/USD')
  const [dir, setDir] = useState('LONG')
  const [sess, setSess] = useState('LONDON')
  const [entry, setEntry] = useState('')
  const [exit, setExit] = useState('')
  const [lots, setLots] = useState('')
  const [pnl, setPnl] = useState('')
  const [result, setResult] = useState('WIN')
  const [setup, setSetup] = useState('Trend Follow')
  const [notes, setNotes] = useState('')

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/trades')
      const d = await r.json()
      setTrades(d.trades || [])
    } catch {
      const saved = localStorage.getItem('pd_trades')
      if (saved) setTrades(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const saveTrade = async () => {
    if (!pnl) return
    setSaving(true)
    const trade = { date, instrument: inst, direction: dir, session: sess, entryPrice: parseFloat(entry)||0, exitPrice: parseFloat(exit)||0, lotSize: parseFloat(lots)||0, pnl: parseFloat(pnl), result, setup, notes }
    try {
      const r = await fetch('/api/trades', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(trade) })
      if (r.ok) await fetchTrades()
    } catch {
      const saved = localStorage.getItem('pd_trades')
      const existing = saved ? JSON.parse(saved) : []
      localStorage.setItem('pd_trades', JSON.stringify([{ ...trade, id: Date.now().toString() }, ...existing]))
      setTrades(prev => [{ ...trade, id: Date.now().toString() } as Trade, ...prev])
    }
    setPnl(''); setEntry(''); setExit(''); setLots(''); setNotes('')
    setSaving(false)
  }

  const deleteTrade = async (id: string) => {
    try { await fetch(`/api/trades/${id}`, { method:'DELETE' }) } catch {}
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  const exportCSV = () => {
    const hdr = 'Date,Instrument,Direction,Session,Entry,Exit,Lots,PnL,Result,Setup,Notes\n'
    const rows = trades.map(t => [t.date,t.instrument,t.direction,t.session,t.entryPrice,t.exitPrice,t.lotSize,t.pnl,t.result,t.setup,`"${t.notes}"`].join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([hdr+rows],{type:'text/csv'}))
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const filtered = filter === 'all' ? trades : trades.filter(t => t.result.toLowerCase() === filter)

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#e8edf8', marginBottom:4, letterSpacing:'-.02em' }}>Trade journal</h1>
          <p style={{ fontSize:13, color:'#8892b0' }}>Log every trade. The pattern in your losses will tell you everything.</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[
            { key:'log', label:'Log' },
            { key:'heatmap', label:'Calendar' },
            { key:'yearly', label:'365-day' },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key as any)} style={{
              padding:'7px 14px', fontSize:12, fontWeight:500, borderRadius:8, cursor:'pointer',
              background: view === v.key ? '#5b6af0' : 'transparent',
              border: view === v.key ? 'none' : '1px solid #1e2538',
              color: view === v.key ? '#fff' : '#8892b0', transition:'all .15s',
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Stats always visible */}
      <StatsRow trades={trades} />

      {/* Views */}
      {view === 'heatmap' && <HeatmapCalendar trades={trades} />}
      {view === 'yearly' && <YearlyHeatmap trades={trades} />}

      {view === 'log' && (
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16, alignItems:'start' }}>
          {/* Log form */}
          <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#4a5580', marginBottom:14, paddingBottom:8, borderBottom:'1px solid #1e2538' }}>Log trade</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ marginBottom:0 }}>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Instrument</label>
                <select value={inst} onChange={e=>setInst(e.target.value)} style={selStyle}>
                  {['EUR/USD','GBP/USD','USD/JPY','XAU/USD','NAS100','SPX500','BTC/USD','ETH/USD','Other'].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Direction</label>
                <select value={dir} onChange={e=>setDir(e.target.value)} style={selStyle}>
                  <option value="LONG">LONG ↑</option><option value="SHORT">SHORT ↓</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Session</label>
                <select value={sess} onChange={e=>setSess(e.target.value)} style={selStyle}>
                  {['LONDON','NEW_YORK','ASIAN','OVERLAP'].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Entry</label>
                <input value={entry} onChange={e=>setEntry(e.target.value)} placeholder="1.08540" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Exit</label>
                <input value={exit} onChange={e=>setExit(e.target.value)} placeholder="1.08720" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Lots</label>
                <input value={lots} onChange={e=>setLots(e.target.value)} placeholder="1.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>P&L ($)</label>
                <input value={pnl} onChange={e=>setPnl(e.target.value)} placeholder="180" style={{ ...inputStyle, borderColor: pnl && parseFloat(pnl) >= 0 ? 'rgba(74,222,128,0.3)' : pnl ? 'rgba(248,113,113,0.3)' : '#1e2538' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Result</label>
                <select value={result} onChange={e=>setResult(e.target.value)} style={selStyle}>
                  <option value="WIN">Win ✓</option><option value="LOSS">Loss ✗</option><option value="BREAKEVEN">Break even</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Setup</label>
                <select value={setup} onChange={e=>setSetup(e.target.value)} style={selStyle}>
                  {['Trend Follow','Breakout','Reversal','Range','News','Other'].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop:10 }}>
              <label style={{ display:'block', fontSize:11, color:'#8892b0', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' }}>Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What did you see? What did you learn?" style={{ ...inputStyle, height:68, resize:'vertical' }} />
            </div>
            <button onClick={saveTrade} style={{ width:'100%', marginTop:12, padding:'10px', fontSize:13, fontWeight:600, background:'#5b6af0', border:'none', borderRadius:9, color:'#fff', cursor:'pointer', fontFamily:"'Syne',sans-serif" }}>
              {saving ? 'Saving…' : 'Log trade'}
            </button>
          </div>

          {/* Trade list */}
          <div>
            <div style={{ background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', gap:4 }}>
                  {['all','win','loss'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 12px', fontSize:11, borderRadius:20, cursor:'pointer', background: filter===f ? '#161c28' : 'transparent', border: filter===f ? '1px solid #263048' : '1px solid transparent', color: filter===f ? '#e8edf8' : '#4a5580' }}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={exportCSV} style={{ padding:'5px 12px', fontSize:11, background:'transparent', border:'1px solid #1e2538', borderRadius:8, color:'#8892b0', cursor:'pointer' }}>Export CSV</button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#4a5580', fontSize:13 }}>Loading trades…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#4a5580' }}>
                  <div style={{ fontSize:32, marginBottom:12, opacity:.3 }}>◧</div>
                  <div style={{ fontSize:13 }}>No trades yet. Log your first trade.</div>
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr>{['Date','Pair','Dir','P&L','Result','Setup','Notes',''].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#4a5580', borderBottom:'1px solid #1e2538', fontWeight:600 }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {filtered.map(t => (
                        <tr key={t.id} style={{ borderBottom:'1px solid #111520' }}
                          onMouseEnter={e=>(e.currentTarget.style.background='#111520')}
                          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                          <td style={{ padding:'9px 10px', color:'#8892b0' }}>{t.date?.split('T')[0]}</td>
                          <td style={{ padding:'9px 10px', fontWeight:600, color:'#e8edf8' }}>{t.instrument}</td>
                          <td style={{ padding:'9px 10px' }}>
                            <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, fontWeight:600, background: t.direction==='LONG' ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)', color: t.direction==='LONG' ? '#4ade80' : '#f87171' }}>{t.direction}</span>
                          </td>
                          <td style={{ padding:'9px 10px', fontFamily:"'DM Mono',monospace", fontWeight:700, color: Number(t.pnl)>=0 ? '#4ade80' : '#f87171' }}>
                            {Number(t.pnl)>=0?'+':''}${Math.abs(Math.round(Number(t.pnl))).toLocaleString()}
                          </td>
                          <td style={{ padding:'9px 10px' }}>
                            <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, fontWeight:600, background: t.result==='WIN'?'rgba(74,222,128,.1)':t.result==='LOSS'?'rgba(248,113,113,.1)':'rgba(251,191,36,.1)', color: t.result==='WIN'?'#4ade80':t.result==='LOSS'?'#f87171':'#fbbf24' }}>{t.result}</span>
                          </td>
                          <td style={{ padding:'9px 10px', color:'#8892b0' }}>{t.setup}</td>
                          <td style={{ padding:'9px 10px', color:'#4a5580', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.notes||'—'}</td>
                          <td style={{ padding:'9px 10px' }}>
                            <button onClick={()=>deleteTrade(t.id)} style={{ background:'transparent', border:'1px solid #1e2538', color:'#4a5580', borderRadius:6, cursor:'pointer', padding:'3px 8px', fontSize:11 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
