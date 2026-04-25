'use client'
// app/dashboard/journal/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  Card, SectionTitle, MetricCard, ResultRow, Alert,
  PageHeader, Field, ResultBox, Btn, Badge, inputStyle
} from '@/components/ui'

interface Trade {
  id: string; date: string; instrument: string; direction: string;
  session: string; entryPrice: number; exitPrice: number; lotSize: number;
  pnl: number; result: string; setup: string; notes: string
}

interface Stats {
  total: number; wins: number; losses: number; winRate: number;
  totalPnl: number; avgWin: number; avgLoss: number; profitFactor: number;
}

const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString()
const today = () => new Date().toISOString().split('T')[0]

export default function JournalPage() {
  const [trades,  setTrades]  = useState<Trade[]>([])
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [filter,  setFilter]  = useState('all')

  // Form state
  const [date,   setDate]   = useState(today())
  const [inst,   setInst]   = useState('EUR/USD')
  const [dir,    setDir]    = useState('LONG')
  const [sess,   setSess]   = useState('LONDON')
  const [entry,  setEntry]  = useState('')
  const [exit,   setExit]   = useState('')
  const [lots,   setLots]   = useState('')
  const [pnl,    setPnl]    = useState('')
  const [result, setResult] = useState('WIN')
  const [setup,  setSetup]  = useState('Trend Follow')
  const [notes,  setNotes]  = useState('')

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/trades')
      const d = await r.json()
      setTrades(d.trades || [])
      setStats(d.stats || null)
    } catch {
      // fallback: load from localStorage for free-tier users
      const saved = localStorage.getItem('pd_trades')
      if (saved) { const d = JSON.parse(saved); setTrades(d) }
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const saveTrade = async () => {
    if (!pnl) return
    setSaving(true)
    const trade = {
      date, instrument: inst, direction: dir, session: sess,
      entryPrice: parseFloat(entry) || 0, exitPrice: parseFloat(exit) || 0,
      lotSize: parseFloat(lots) || 0, pnl: parseFloat(pnl),
      result, setup, notes
    }
    try {
      const r = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trade) })
      if (r.ok) await fetchTrades()
    } catch {
      // fallback: save to localStorage
      const saved = localStorage.getItem('pd_trades')
      const existing = saved ? JSON.parse(saved) : []
      const newTrade = { ...trade, id: Date.now().toString() }
      const updated = [newTrade, ...existing]
      localStorage.setItem('pd_trades', JSON.stringify(updated))
      setTrades(updated)
    }
    setPnl(''); setEntry(''); setExit(''); setLots(''); setNotes('')
    setSaving(false)
  }

  const deleteTrade = async (id: string) => {
    try {
      await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    } catch {
      const saved = localStorage.getItem('pd_trades')
      if (saved) {
        const updated = JSON.parse(saved).filter((t: Trade) => t.id !== id)
        localStorage.setItem('pd_trades', JSON.stringify(updated))
      }
    }
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  const exportCSV = () => {
    const hdr = 'Date,Instrument,Direction,Session,Entry,Exit,Lots,PnL,Result,Setup,Notes\n'
    const rows = trades.map(t =>
      [t.date, t.instrument, t.direction, t.session, t.entryPrice, t.exitPrice,
       t.lotSize, t.pnl, t.result, t.setup, `"${t.notes}"`].join(',')
    ).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([hdr + rows], { type: 'text/csv' }))
    a.download = `trades_${today()}.csv`
    a.click()
  }

  // Computed stats from local trades (fallback if API stats unavailable)
  const localWins   = trades.filter(t => t.result === 'WIN')
  const localLosses = trades.filter(t => t.result === 'LOSS')
  const localPnl    = trades.reduce((s, t) => s + t.pnl, 0)
  const localWR     = trades.length ? Math.round(localWins.length / (localWins.length + localLosses.length || 1) * 100) : 0
  const avgWin      = localWins.length ? localWins.reduce((s, t) => s + t.pnl, 0) / localWins.length : 0
  const avgLoss     = localLosses.length ? Math.abs(localLosses.reduce((s, t) => s + t.pnl, 0) / localLosses.length) : 0
  const pf          = avgLoss ? (localWins.length * avgWin) / (localLosses.length * avgLoss) : 0

  const filtered = filter === 'all' ? trades
    : trades.filter(t => t.result.toLowerCase() === filter)

  const sel: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 13,
    background: '#1c2030', border: '1px solid #2a2e38',
    borderRadius: 8, color: '#dde2f0', outline: 'none'
  }

  return (
    <div>
      <PageHeader title="Trade journal" subtitle="Log every trade. The pattern in your losses will tell you everything." />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <MetricCard label="Total trades" value={trades.length.toString()} />
        <MetricCard label="Win rate" value={trades.length ? localWR + '%' : '—'} color={localWR >= 50 ? '#3ddc84' : '#ff5c5c'} />
        <MetricCard label="Total P&L" value={trades.length ? (localPnl >= 0 ? '+' : '') + fmt(localPnl) : '—'} color={localPnl >= 0 ? '#3ddc84' : '#ff5c5c'} />
        <MetricCard label="Profit factor" value={pf ? pf.toFixed(2) : '—'} color={pf >= 1.5 ? '#3ddc84' : pf >= 1 ? '#f5a623' : '#ff5c5c'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Log form */}
        <Card>
          <SectionTitle>Log trade</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Date">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Instrument">
              <select value={inst} onChange={e => setInst(e.target.value)} style={sel}>
                {['EUR/USD','GBP/USD','USD/JPY','XAU/USD','NAS100','SPX500','BTC/USD','ETH/USD','Other'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select value={dir} onChange={e => setDir(e.target.value)} style={sel}>
                <option value="LONG">LONG ↑</option>
                <option value="SHORT">SHORT ↓</option>
              </select>
            </Field>
            <Field label="Session">
              <select value={sess} onChange={e => setSess(e.target.value)} style={sel}>
                {['LONDON','NEW_YORK','ASIAN','OVERLAP'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Entry price">
              <input value={entry} onChange={e => setEntry(e.target.value)} placeholder="1.08540" style={inputStyle} />
            </Field>
            <Field label="Exit price">
              <input value={exit} onChange={e => setExit(e.target.value)} placeholder="1.08720" style={inputStyle} />
            </Field>
            <Field label="Lot size">
              <input value={lots} onChange={e => setLots(e.target.value)} placeholder="1.00" style={inputStyle} />
            </Field>
            <Field label="P&L ($)">
              <input value={pnl} onChange={e => setPnl(e.target.value)} placeholder="180" style={inputStyle} />
            </Field>
            <Field label="Result">
              <select value={result} onChange={e => setResult(e.target.value)} style={sel}>
                <option value="WIN">Win ✓</option>
                <option value="LOSS">Loss ✗</option>
                <option value="BREAKEVEN">Break even</option>
              </select>
            </Field>
            <Field label="Setup">
              <select value={setup} onChange={e => setSetup(e.target.value)} style={sel}>
                {['Trend Follow','Breakout','Reversal','Range','News','Other'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes / lessons">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="What did you see? What did you learn?"
              style={{ ...inputStyle, height: 70, resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn onClick={saveTrade} full>
              {saving ? 'Saving…' : 'Log trade'}
            </Btn>
          </div>
        </Card>

        {/* Trade list */}
        <div>
          <Card style={{ marginBottom: 12 }}>
            <SectionTitle>Performance stats</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ResultBox>
                <ResultRow label="Wins" value={localWins.length.toString()} color="#3ddc84" />
                <ResultRow label="Losses" value={localLosses.length.toString()} color="#ff5c5c" />
                <ResultRow label="Best trade" value={trades.length ? '+' + fmt(Math.max(...trades.map(t => t.pnl))) : '—'} color="#3ddc84" />
                <ResultRow label="Worst trade" value={trades.length ? fmt(Math.min(...trades.map(t => t.pnl))) : '—'} color="#ff5c5c" />
              </ResultBox>
              <ResultBox>
                <ResultRow label="Avg win" value={localWins.length ? '+' + fmt(avgWin) : '—'} color="#3ddc84" />
                <ResultRow label="Avg loss" value={localLosses.length ? '−' + fmt(avgLoss) : '—'} color="#ff5c5c" />
                <ResultRow label="Profit factor" value={pf ? pf.toFixed(2) + (pf >= 1.5 ? ' ✓' : ' ✗') : '—'} color={pf >= 1.5 ? '#3ddc84' : '#ff5c5c'} />
                <ResultRow label="Expectancy" value={trades.length ? (localPnl >= 0 ? '+' : '') + fmt(localPnl / trades.length) + '/trade' : '—'} color={localPnl >= 0 ? '#3ddc84' : '#ff5c5c'} />
              </ResultBox>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all','win','loss'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '4px 12px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
                    background: filter === f ? '#1c2030' : 'transparent',
                    border: filter === f ? '1px solid #2a2f45' : '1px solid transparent',
                    color: filter === f ? '#dde2f0' : '#565a6e'
                  }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={exportCSV}>Export CSV</Btn>
                <Btn variant="danger" onClick={() => { if (confirm('Clear ALL trades?')) { setTrades([]); localStorage.removeItem('pd_trades') } }}>Clear all</Btn>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#565a6e', fontSize: 13 }}>Loading trades…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#404660' }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: .3 }}>◧</div>
                <div style={{ fontSize: 13 }}>No trades logged yet. Use the form to log your first trade.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['Date','Pair','Dir','P&L','Result','Setup','Notes',''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10,
                          letterSpacing: '.06em', textTransform: 'uppercase', color: '#404660',
                          borderBottom: '1px solid #1e2235', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #1e2235' }}>
                        <td style={{ padding: '9px 10px', color: '#7a82a0' }}>{t.date}</td>
                        <td style={{ padding: '9px 10px', fontWeight: 600, color: '#dde2f0' }}>{t.instrument}</td>
                        <td style={{ padding: '9px 10px' }}>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                            background: t.direction === 'LONG' ? '#0a2218' : '#1f0a0a',
                            color: t.direction === 'LONG' ? '#3ddc84' : '#ff5c5c' }}>
                            {t.direction}
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px', fontFamily: 'monospace', fontWeight: 700,
                          color: t.pnl >= 0 ? '#3ddc84' : '#ff5c5c' }}>
                          {t.pnl >= 0 ? '+' : ''}{fmt(t.pnl)}
                        </td>
                        <td style={{ padding: '9px 10px' }}>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                            background: t.result === 'WIN' ? '#0a2218' : t.result === 'LOSS' ? '#1f0a0a' : '#231500',
                            color: t.result === 'WIN' ? '#3ddc84' : t.result === 'LOSS' ? '#ff5c5c' : '#f5a623' }}>
                            {t.result}
                          </span>
                        </td>
                        <td style={{ padding: '9px 10px', color: '#7a82a0' }}>{t.setup}</td>
                        <td style={{ padding: '9px 10px', color: '#565a6e', maxWidth: 160,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={t.notes}>{t.notes || '—'}</td>
                        <td style={{ padding: '9px 10px' }}>
                          <button onClick={() => deleteTrade(t.id)} style={{
                            background: 'transparent', border: '1px solid #1e2235',
                            color: '#565a6e', borderRadius: 6, cursor: 'pointer', padding: '3px 8px', fontSize: 11
                          }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
