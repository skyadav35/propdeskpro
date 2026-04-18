'use client'
// app/dashboard/stacker/page.tsx

import { useState } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, PageHeader, ResultBox, Btn, Alert, inputStyle } from '@/components/ui'

interface Account { id: number; firm: string; size: number; split: number; daily: number; days: number; status: string }

const FIRMS = ['FTMO','Topstep','The5%ers','MyFundedFX','Apex','Funded Engineer','Other']
const fmt = (n: number) => '$' + Math.round(n).toLocaleString()

let nextId = 3

export default function StackerPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, firm: 'FTMO',    size: 100000, split: 80, daily: 0.5, days: 20, status: 'ACTIVE' },
    { id: 2, firm: 'Topstep', size: 50000,  split: 90, daily: 0.6, days: 20, status: 'ACTIVE' },
  ])

  const update = (id: number, key: keyof Account, val: any) =>
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, [key]: val } : a))

  const remove = (id: number) => setAccounts(prev => prev.filter(a => a.id !== id))

  const add = () => {
    setAccounts(prev => [...prev, {
      id: nextId++, firm: 'FTMO', size: 100000, split: 80, daily: 0.5, days: 20, status: 'ACTIVE'
    }])
  }

  const active = accounts.filter(a => a.status === 'ACTIVE')
  const totalCap       = active.reduce((s, a) => s + a.size, 0)
  const totalDailyGross= active.reduce((s, a) => s + (a.size * a.daily / 100), 0)
  const totalDailyNet  = active.reduce((s, a) => s + (a.size * a.daily / 100 * a.split / 100), 0)
  const totalMonthly   = active.reduce((s, a) => s + (a.size * a.daily / 100 * a.split / 100 * a.days), 0)

  const sel: React.CSSProperties = {
    background: '#1c2030', border: '1px solid #2a2e38',
    borderRadius: 6, padding: '6px 8px', fontSize: 12, color: '#dde2f0', outline: 'none'
  }
  const inp: React.CSSProperties = {
    background: '#1c2030', border: '1px solid #2a2e38',
    borderRadius: 6, padding: '6px 8px', fontSize: 12,
    color: '#dde2f0', outline: 'none', fontFamily: 'monospace', width: '100%'
  }

  return (
    <div>
      <PageHeader title="Multi-account stacker" subtitle="Track all funded accounts in one view. See your combined income." />

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <MetricCard label="Total capital" value={fmt(totalCap)} sub="under management" />
        <MetricCard label="Daily gross" value={fmt(totalDailyGross)} sub="before split" />
        <MetricCard label="Daily take-home" value={fmt(totalDailyNet)} color="#3ddc84" sub="your cut" />
        <MetricCard label="Monthly net" value={fmt(totalMonthly)} color="#3ddc84" sub="estimated" />
      </div>

      {/* Account table */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <SectionTitle>Account portfolio</SectionTitle>
          <Btn onClick={add}>+ Add account</Btn>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 110px 90px 100px 100px 100px 70px 36px',
            gap: 8, padding: '0 0 8px', borderBottom: '1px solid #1e2235' }}>
            {['Firm','Size ($)','Split (%)','Daily gain (%)','Trade days','Monthly','Status',''].map(h => (
              <span key={h} style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
                color: '#404660', fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#404660', fontSize: 13 }}>
              No accounts yet. Click "+ Add account" to start.
            </div>
          ) : accounts.map(a => {
            const monthly = a.size * a.daily / 100 * a.split / 100 * a.days
            return (
              <div key={a.id} style={{ display: 'grid',
                gridTemplateColumns: '140px 110px 90px 100px 100px 100px 70px 36px',
                gap: 8, padding: '8px 0', borderBottom: '1px solid #1e2235', alignItems: 'center' }}>
                <select value={a.firm} onChange={e => update(a.id, 'firm', e.target.value)} style={sel}>
                  {FIRMS.map(f => <option key={f}>{f}</option>)}
                </select>
                <input type="number" value={a.size} onChange={e => update(a.id, 'size', Number(e.target.value))} style={inp} />
                <input type="number" value={a.split} onChange={e => update(a.id, 'split', Number(e.target.value))} style={inp} />
                <input type="number" value={a.daily} step={0.1} onChange={e => update(a.id, 'daily', parseFloat(e.target.value))} style={inp} />
                <input type="number" value={a.days} onChange={e => update(a.id, 'days', Number(e.target.value))} style={inp} />
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#3ddc84' }}>
                  {fmt(monthly)}
                </span>
                <select value={a.status} onChange={e => update(a.id, 'status', e.target.value)} style={{
                  ...sel, fontSize: 11,
                  color: a.status === 'ACTIVE' ? '#3ddc84' : a.status === 'BLOWN' ? '#ff5c5c' : '#f5a623'
                }}>
                  <option>ACTIVE</option><option>PAUSED</option><option>BLOWN</option><option>SCALED</option>
                </select>
                <button onClick={() => remove(a.id)} style={{
                  width: 28, height: 28, borderRadius: 6, background: 'transparent',
                  border: '1px solid #1e2235', color: '#404660', cursor: 'pointer', fontSize: 12
                }}>✕</button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionTitle>Income breakdown</SectionTitle>
          {active.length === 0 ? (
            <div style={{ color: '#404660', fontSize: 12, padding: '8px 0' }}>No active accounts</div>
          ) : active.map(a => {
            const m = a.size * a.daily / 100 * a.split / 100 * a.days
            const pct = totalMonthly ? Math.round(m / totalMonthly * 100) : 0
            return (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 10px', borderRadius: 8, marginBottom: 5, background: '#1c2030' }}>
                <span style={{ fontSize: 12, color: '#7a82a0' }}>
                  {a.firm} <span style={{ color: '#404660' }}>({(a.size / 1000).toFixed(0)}K)</span>
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3ddc84', fontSize: 13 }}>
                  {fmt(m)}
                  <span style={{ fontSize: 10, color: '#404660', marginLeft: 6 }}>{pct}%</span>
                </span>
              </div>
            )
          })}
        </Card>

        <Card>
          <SectionTitle>Income milestones</SectionTitle>
          <ResultBox>
            {[
              { label: 'Hit $10K/month', target: 10000 },
              { label: 'Hit $25K/month', target: 25000 },
              { label: 'Hit $50K/month', target: 50000 },
            ].map(({ label, target }) => {
              const need = Math.max(0, target - totalMonthly)
              const done = need === 0
              return (
                <ResultRow key={label} label={label}
                  value={done ? '✓ Achieved' : fmt(need) + ' more/mo'}
                  color={done ? '#3ddc84' : undefined} />
              )
            })}
            <ResultRow
              label="Annual projection"
              value={fmt(totalMonthly * 12)}
              color="#3ddc84" />
          </ResultBox>
          {totalMonthly === 0 && (
            <Alert type="info">Add your active funded accounts above to see your income milestones.</Alert>
          )}
          {totalMonthly > 0 && totalMonthly < 10000 && (
            <Alert type="info">
              You need {fmt(10000 - totalMonthly)} more monthly income to hit $10K. Try adding another funded account.
            </Alert>
          )}
          {totalMonthly >= 50000 && (
            <Alert type="success">You're projecting $50K+/month. Focus on consistency and scale with caution.</Alert>
          )}
        </Card>
      </div>
    </div>
  )
}
