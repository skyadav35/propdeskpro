'use client'
// app/dashboard/challenge/page.tsx

import { useState, useCallback } from 'react'
import {
  Card, SectionTitle, MetricCard, ResultRow, ProgressBar,
  Alert, PageHeader, NumInput, ResultBox, Btn
} from '@/components/ui'

const PRESETS = {
  ftmo:    { acc: 100000, pt: 10, mdd: 5,  tdd: 10, days: 30, name: 'FTMO' },
  topstep: { acc: 50000,  pt: 6,  mdd: 4,  tdd: 8,  days: 30, name: 'Topstep' },
  the5:    { acc: 100000, pt: 6,  mdd: 4,  tdd: 8,  days: 60, name: 'The5%ers' },
  myfx:    { acc: 100000, pt: 8,  mdd: 5,  tdd: 10, days: 30, name: 'MyFundedFX' },
  apex:    { acc: 50000,  pt: 6,  mdd: 3,  tdd: 6,  days: 30, name: 'Apex' },
}

const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString()

export default function ChallengePage() {
  const [preset, setPreset] = useState('ftmo')
  const [acc,     setAcc]     = useState(100000)
  const [pt,      setPt]      = useState(10)
  const [mdd,     setMdd]     = useState(5)
  const [tdd,     setTdd]     = useState(10)
  const [days,    setDays]    = useState(30)
  const [curPnl,  setCurPnl]  = useState(4200)
  const [doneDays,setDoneDays]= useState(12)
  const [bigLoss, setBigLoss] = useState(800)

  const loadPreset = (key: string) => {
    const p = PRESETS[key as keyof typeof PRESETS]
    setPreset(key); setAcc(p.acc); setPt(p.pt); setMdd(p.mdd); setTdd(p.tdd); setDays(p.days)
  }

  // Derived calculations
  const targetAmt   = acc * pt / 100
  const mddAmt      = acc * mdd / 100
  const tddAmt      = acc * tdd / 100
  const dailyBase   = targetAmt / days
  const remain      = Math.max(0, targetAmt - curPnl)
  const drem        = Math.max(1, days - doneDays)
  const newDaily    = remain / drem
  const bal         = acc + curPnl
  const distFromDD  = tddAmt - Math.abs(Math.min(0, curPnl))
  const profPct     = Math.min(100, Math.round(curPnl / targetAmt * 100))
  const timePct     = Math.min(100, Math.round(doneDays / days * 100))
  const ddPct       = Math.min(100, Math.round(Math.abs(Math.min(0, curPnl)) / tddAmt * 100))
  const onTrack     = curPnl / targetAmt >= doneDays / days * 0.85
  const passed      = curPnl >= targetAmt

  const statusColor = passed ? '#3ddc84' : onTrack ? '#3ddc84' : '#ff5c5c'
  const statusText  = passed ? 'PASSED ✓' : onTrack ? 'ON TRACK' : 'BEHIND — PUSH'

  const alertType = passed ? 'success'
    : bigLoss >= mddAmt * 0.8 ? 'danger'
    : !onTrack ? 'warn' : 'info'
  const alertMsg = passed ? 'Challenge target hit! Request the funded account now.'
    : bigLoss >= mddAmt * 0.8 ? 'WARNING: Single trade close to daily drawdown limit — reduce size immediately.'
    : !onTrack ? 'Behind pace. Slightly increase trade frequency (not size) to catch up.'
    : 'Pace is healthy — keep position sizing consistent.'

  return (
    <div>
      <PageHeader title="Challenge tracker" subtitle="Track your prop firm evaluation in real time." />

      {/* Firm presets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button key={key} onClick={() => loadPreset(key)} style={{
            padding: '6px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
            background: preset === key ? '#081830' : 'transparent',
            border: preset === key ? '1px solid #4d9fff' : '1px solid #2a2e38',
            color: preset === key ? '#4d9fff' : '#7a82a0', transition: 'all .15s'
          }}>{p.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left: inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <SectionTitle>Challenge rules</SectionTitle>
            <NumInput label="Account size ($)" value={acc} onChange={setAcc} step={1000} min={1000} />
            <NumInput label="Profit target (%)" value={pt} onChange={setPt} step={0.5} min={1} max={30} />
            <NumInput label="Max daily drawdown (%)" value={mdd} onChange={setMdd} step={0.5} min={1} max={15} />
            <NumInput label="Max total drawdown (%)" value={tdd} onChange={setTdd} step={0.5} min={1} max={30} />
            <NumInput label="Trading days allowed" value={days} onChange={setDays} min={1} max={90} />
          </Card>
          <Card>
            <SectionTitle>Current progress</SectionTitle>
            <NumInput label="Current P&L ($)" value={curPnl} onChange={setCurPnl} />
            <NumInput label="Days traded so far" value={doneDays} onChange={setDoneDays} min={0} />
            <NumInput label="Largest single loss ($)" value={bigLoss} onChange={setBigLoss} min={0} />
          </Card>
        </div>

        {/* Right: results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            <MetricCard label="Target" value={fmt(targetAmt)} sub="profit needed" />
            <MetricCard label="Balance" value={fmt(bal)} sub="current" color={bal >= acc ? '#3ddc84' : '#ff5c5c'} />
            <MetricCard label="Remaining" value={fmt(remain)} sub={`${drem} days left`} />
            <MetricCard label="Status" value={statusText} color={statusColor} />
          </div>

          {/* Results */}
          <Card>
            <SectionTitle>Live targets</SectionTitle>
            <ResultBox>
              <ResultRow label="Daily target (base)" value={fmt(dailyBase) + '/day'} />
              <ResultRow label="Revised daily target" value={fmt(newDaily) + '/day'} color="#f5a623" />
              <ResultRow label="Max daily loss ($)" value={fmt(mddAmt)} color="#f5a623" />
              <ResultRow label="Max total loss ($)" value={fmt(tddAmt)} color="#f5a623" />
              <ResultRow label="Distance from DD breach" value={fmt(distFromDD)} color={distFromDD < tddAmt * 0.3 ? '#ff5c5c' : '#3ddc84'} />
              <ResultRow label="Challenge status" value={statusText} color={statusColor} />
            </ResultBox>
          </Card>

          {/* Progress gauges */}
          <Card>
            <SectionTitle>Progress gauges</SectionTitle>
            <ProgressBar
              pct={profPct}
              color={profPct >= 80 ? '#3ddc84' : profPct >= 50 ? '#5b6af0' : '#f5a623'}
              label="Profit progress"
              sublabel={`${profPct}%`}
            />
            <ProgressBar pct={timePct} color="#f5a623" label="Time consumed" sublabel={`${timePct}%`} />
            <ProgressBar pct={ddPct} color={ddPct > 70 ? '#ff5c5c' : '#f5a623'} label="Drawdown used" sublabel={`${ddPct}%`} />
            <Alert type={alertType}>{alertMsg}</Alert>
          </Card>
        </div>
      </div>
    </div>
  )
}
