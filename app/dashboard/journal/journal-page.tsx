'use client'

/**
 * app/dashboard/journal/page.tsx
 *
 * Prerequisites — add to globals.css:
 *   --gold: #C8A84A;  --bg: #0B1A2C;  --bg2: #0F2238;
 *   --bg3: #162D48;   --win: #28B47A;  --loss: #D94F4F;
 *
 * npm packages needed (likely already installed):
 *   chart.js  react-chartjs-2
 */

import { useEffect, useState, useCallback } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

// ── Types ─────────────────────────────────────────────────────────────────────

type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN'
type Direction   = 'LONG' | 'SHORT'
type Session     = 'LONDON' | 'NEW_YORK' | 'ASIAN' | 'OVERLAP'

interface Trade {
  id: string
  date: string
  instrument: string
  direction: Direction
  session?: Session
  pnl: number
  result: TradeResult
  setup?: string
  notes?: string
  challengeId?: string
}

interface ApiResponse {
  trades: Trade[]
  stats: {
    total: number
    wins: number
    losses: number
    winRate: number
    totalPnl: number
    avgWin: number
    avgLoss: number
    profitFactor: number
  }
}

// ── Theme tokens (match your CSS variables) ───────────────────────────────────

const C = {
  bg:    '#0B1A2C',
  bg2:   '#0F2238',
  bg3:   '#162D48',
  bg4:   '#1E3858',
  gold:  '#C8A84A',
  goldA: 'rgba(200,168,74,0.14)',
  goldB: 'rgba(200,168,74,0.07)',
  goldBd:'rgba(200,168,74,0.20)',
  win:   '#28B47A',
  loss:  '#D94F4F',
  t1:    '#E6DCB8',
  t2:    '#7A90A8',
  t3:    '#4A6070',
  bd:    'rgba(200,168,74,0.18)',
  bd2:   'rgba(255,255,255,0.07)',
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtPnl = (n: number) =>
  (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(0)

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: '2-digit',
    })
  } catch {
    return iso.split('T')[0]
  }
}

const INSTRUMENTS = [
  'EUR/USD','GBP/USD','USD/JPY','GBP/JPY',
  'XAU/USD','NAS100','US30','USD/CAD','AUD/USD',
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, color,
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: C.bg2,
      border: `1px solid ${C.bd2}`,
      borderLeft: `2px solid ${C.gold}`,
      borderRadius: 8,
      padding: '14px 16px',
    }}>
      <p style={{
        fontSize: 9, letterSpacing: '2px', color: C.t3,
        textTransform: 'uppercase', marginBottom: 7,
        fontFamily: "'DM Mono', monospace",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 26,
        fontWeight: 600,
        color: color ?? C.gold,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}

function ResultBadge({ result }: { result: TradeResult }) {
  const map: Record<TradeResult, { bg: string; color: string; border: string }> = {
    WIN:       { bg: 'rgba(40,180,122,0.12)', color: C.win,  border: 'rgba(40,180,122,0.30)' },
    LOSS:      { bg: 'rgba(217,79,79,0.12)',  color: C.loss, border: 'rgba(217,79,79,0.30)'  },
    BREAKEVEN: { bg: 'rgba(122,144,168,0.12)',color: C.t2,   border: 'rgba(122,144,168,0.30)'},
  }
  const s = map[result]
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: 9,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontFamily: "'DM Mono', monospace",
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {result}
    </span>
  )
}

function EquityChart({ trades }: { trades: Trade[] }) {
  const equity = trades.reduce<number[]>(
    (acc, t) => [...acc, acc[acc.length - 1] + t.pnl],
    [0],
  )

  const pointColors = [
    C.gold,
    ...trades.map(t =>
      t.result === 'WIN' ? C.win : t.result === 'LOSS' ? C.loss : C.t2
    ),
  ]

  const data = {
    labels: equity.map((_, i) => i === 0 ? 'Start' : `#${i}`),
    datasets: [{
      data: equity,
      borderColor: C.gold,
      borderWidth: 1.5,
      pointBackgroundColor: pointColors,
      pointBorderColor: 'transparent',
      pointRadius: equity.map((_, i) => i === 0 ? 0 : 4),
      pointHoverRadius: 6,
      fill: true,
      backgroundColor: 'rgba(200,168,74,0.06)',
      tension: 0.3,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.bg3,
        borderColor: C.goldBd,
        borderWidth: 1,
        titleColor: C.t2,
        bodyColor: C.t1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => ` ${fmtPnl(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', lineWidth: 0.5 },
        ticks: {
          color: C.t3,
          font: { family: "'DM Mono', monospace", size: 9 },
        },
        border: { color: 'transparent' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)', lineWidth: 0.5 },
        ticks: {
          color: C.t3,
          font: { family: "'DM Mono', monospace", size: 9 },
          callback: (v: any) => `$${v}`,
        },
        border: { color: 'transparent' },
      },
    },
  } as const

  return <Line data={data} options={options as any} />
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  instrument: 'EUR/USD',
  direction: 'LONG' as Direction,
  session: 'LONDON' as Session,
  pnl: '',
  result: 'WIN' as TradeResult,
  setup: '',
  notes: '',
}

export default function JournalPage() {
  const [trades, setTrades]   = useState<Trade[]>([])
  const [stats, setStats]     = useState<ApiResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter]   = useState<'ALL' | TradeResult>('ALL')
  const [form, setForm]       = useState(defaultForm)
  const [error, setError]     = useState('')

  const loadTrades = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/trades')
      const data: ApiResponse = await res.json()
      setTrades(data.trades ?? [])
      setStats(data.stats ?? null)
    } catch {
      setError('Failed to load trades.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTrades() }, [loadTrades])

  const handleSubmit = async () => {
    if (!form.date || !form.pnl) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pnl: parseFloat(form.pnl) }),
      })
      if (!res.ok) throw new Error()
      setForm({ ...defaultForm, date: form.date })
      await loadTrades()
    } catch {
      setError('Failed to save trade. Check the console.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    await loadTrades()
  }

  const exportCSV = () => {
    const rows = [
      ['Date','Pair','Direction','Session','PnL','Result','Setup','Notes'],
      ...trades.map(t => [
        t.date, t.instrument, t.direction,
        t.session ?? '', t.pnl, t.result,
        t.setup ?? '', t.notes ?? '',
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const link = document.createElement('a')
    link.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    link.download = 'trades.csv'
    link.click()
  }

  const visible = filter === 'ALL'
    ? trades
    : trades.filter(t => t.result === filter)

  // ── Styles (scoped inline for portability) ──────────────────────────────

  const panel: React.CSSProperties = {
    background: C.bg2,
    border: `1px solid ${C.bd2}`,
    borderRadius: 10,
    padding: 18,
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: '2px',
    color: C.t3,
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${C.bd2}`,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.bg3,
    border: `1px solid ${C.bd2}`,
    color: C.t1,
    padding: '7px 10px',
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 9,
    letterSpacing: '1px',
    color: C.t3,
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginBottom: 4,
  }

  const field = (label: string, input: React.ReactNode) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {input}
    </div>
  )

  const sel = (id: keyof typeof form, opts: string[]) => (
    <select
      value={form[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ ...inputStyle, cursor: 'pointer' }}
    >
      {opts.map(o => <option key={o} style={{ background: C.bg3 }}>{o}</option>)}
    </select>
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'DM Mono', monospace",
      color: C.t1,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24,
        paddingBottom: 18, borderBottom: `1px solid ${C.bd}`,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28, fontWeight: 700,
            color: C.gold, letterSpacing: '0.5px',
          }}>
            Trade Journal
          </h1>
          <p style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>
            Log every trade. The pattern in your losses will tell you everything.
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            background: C.goldB, border: `1px solid ${C.bd}`,
            color: C.t2, padding: '7px 16px', borderRadius: 6,
            cursor: 'pointer', fontSize: 10, letterSpacing: '1px',
            textTransform: 'uppercase', fontFamily: "'DM Mono', monospace",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 22,
      }}>
        <StatCard label="Total Trades" value={String(stats?.total ?? 0)} />
        <StatCard
          label="Win Rate"
          value={stats?.total ? `${stats.winRate}%` : '—'}
          color={C.win}
        />
        <StatCard
          label="Total P&L"
          value={stats?.total ? fmtPnl(stats.totalPnl) : '$0'}
          color={(stats?.totalPnl ?? 0) >= 0 ? C.win : C.loss}
        />
        <StatCard
          label="Profit Factor"
          value={stats?.profitFactor ? stats.profitFactor.toFixed(2) : '—'}
          color={(stats?.profitFactor ?? 0) >= 1 ? C.win : C.t2}
        />
      </div>

      {error && (
        <div style={{
          background: 'rgba(217,79,79,0.1)', border: `1px solid rgba(217,79,79,0.3)`,
          color: C.loss, padding: '10px 14px', borderRadius: 6,
          fontSize: 12, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Middle row: form + chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Log Trade form */}
        <div style={panel}>
          <p style={sectionTitle}>Log Trade</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Date',
                <input type="date" value={form.date} style={inputStyle}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              )}
              {field('Instrument', sel('instrument', INSTRUMENTS))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Direction', sel('direction', ['LONG', 'SHORT']))}
              {field('Session',   sel('session',   ['LONDON','NEW_YORK','ASIAN','OVERLAP']))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('P&L ($)',
                <input type="number" placeholder="e.g. 234" value={form.pnl}
                  style={inputStyle}
                  onChange={e => setForm(f => ({ ...f, pnl: e.target.value }))} />
              )}
              {field('Result', sel('result', ['WIN', 'LOSS', 'BREAKEVEN']))}
            </div>
            {field('Setup',
              <input type="text" placeholder="e.g. Trend Follow, Breakout…" value={form.setup}
                style={inputStyle}
                onChange={e => setForm(f => ({ ...f, setup: e.target.value }))} />
            )}
            {field('Notes',
              <input type="text" placeholder="Optional notes…" value={form.notes}
                style={inputStyle}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.pnl}
              style={{
                width: '100%',
                background: submitting ? C.bg3 : C.goldA,
                border: `1px solid ${C.gold}`,
                color: submitting ? C.t3 : C.gold,
                padding: '10px', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
              }}
            >
              {submitting ? 'Saving…' : '+ Log Trade'}
            </button>
          </div>
        </div>

        {/* Equity curve + performance stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={panel}>
            <p style={sectionTitle}>Equity Curve</p>
            {loading
              ? <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3, fontSize: 12 }}>Loading…</div>
              : trades.length === 0
                ? <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.t3, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>No trades yet</div>
                : <EquityChart trades={trades} />
            }
          </div>
          <div style={panel}>
            <p style={sectionTitle}>Performance Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { k: 'Wins',        v: stats?.wins ?? 0,      c: C.win  },
                { k: 'Losses',      v: stats?.losses ?? 0,    c: C.loss },
                { k: 'Avg Win',     v: stats?.avgWin ? fmtPnl(stats.avgWin) : '—',  c: C.win  },
                { k: 'Avg Loss',    v: stats?.avgLoss ? `$${stats.avgLoss.toFixed(0)}` : '—', c: C.loss },
                { k: 'Best Trade',  v: trades.length ? fmtPnl(Math.max(...trades.map(t => t.pnl))) : '—', c: C.win  },
                { k: 'Worst Trade', v: trades.length ? fmtPnl(Math.min(...trades.map(t => t.pnl))) : '—', c: C.loss },
              ].map(({ k, v, c }) => (
                <div key={k}>
                  <p style={{ fontSize: 9, color: C.t3, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2, fontFamily: "'DM Mono', monospace" }}>{k}</p>
                  <p style={{ fontSize: 15, color: c, fontFamily: "'DM Mono', monospace" }}>{String(v)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade History table */}
      <div style={{
        background: C.bg2,
        border: `1px solid ${C.bd2}`,
        borderRadius: 10, overflow: 'hidden',
      }}>
        {/* Table header row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '12px 18px',
          borderBottom: `1px solid ${C.bd2}`,
        }}>
          <p style={{ fontSize: 9, letterSpacing: '2px', color: C.t3, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
            Trade History
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'WIN', 'LOSS', 'BREAKEVEN'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? C.goldA : 'transparent',
                border: `1px solid ${filter === f ? C.gold : C.bd2}`,
                color: filter === f ? C.gold : C.t3,
                padding: '3px 10px', borderRadius: 4,
                cursor: 'pointer', fontSize: 9, letterSpacing: '1px',
                textTransform: 'uppercase', fontFamily: "'DM Mono', monospace",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 28, textAlign: 'center', color: C.t3, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>Loading trades…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: C.t3, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>No trades yet — log your first trade above</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Pair', 'Dir', 'P&L', 'Result', 'Setup', 'Notes', ''].map(h => (
                  <th key={h} style={{
                    fontSize: 9, letterSpacing: '1.5px', color: C.t3,
                    textTransform: 'uppercase', padding: '9px 14px',
                    textAlign: 'left', borderBottom: `1px solid ${C.bd2}`,
                    fontWeight: 400, fontFamily: "'DM Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...visible].reverse().map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: C.t3 }}>{fmtDate(t.date)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: C.t1, fontWeight: 500 }}>{t.instrument}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: t.direction === 'LONG' ? '#5B9FE0' : '#E88A5B' }}>{t.direction}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: t.pnl >= 0 ? C.win : C.loss }}>{fmtPnl(t.pnl)}</td>
                  <td style={{ padding: '10px 14px' }}><ResultBadge result={t.result} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: C.t3 }}>{t.setup || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: C.t3 }}>{t.notes || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        background: 'transparent', border: 'none',
                        color: C.t3, cursor: 'pointer', fontSize: 14,
                        lineHeight: 1, padding: '2px 6px', borderRadius: 3,
                      }}
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
