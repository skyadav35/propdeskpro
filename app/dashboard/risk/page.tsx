'use client'
// app/dashboard/risk/page.tsx

import { useState } from 'react'
import {
  Card, SectionTitle, MetricCard, ResultRow, Alert,
  PageHeader, NumInput, Field, ResultBox, SliderRow, Btn
} from '@/components/ui'

const INSTRUMENTS: Record<string, { label: string; pipVal: number; unit: string }> = {
  forex:  { label: 'Forex — major pairs', pipVal: 10,  unit: 'pips' },
  gold:   { label: 'Gold (XAU/USD)',       pipVal: 1,   unit: 'pips' },
  nas100: { label: 'NAS100 / US100',       pipVal: 1,   unit: 'points' },
  spx:    { label: 'S&P500 / US500',       pipVal: 0.5, unit: 'points' },
  btc:    { label: 'Bitcoin (BTC)',         pipVal: 1,   unit: 'points' },
  eth:    { label: 'Ethereum (ETH)',        pipVal: 0.1, unit: 'points' },
}

const fmt  = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString()
const fmtD = (n: number, d = 2) => n.toFixed(d)

export default function RiskPage() {
  const [bal,    setBal]    = useState(100000)
  const [rp,     setRp]     = useState(1)
  const [sl,     setSl]     = useState(20)
  const [tp,     setTp]     = useState(60)
  const [inst,   setInst]   = useState('forex')
  const [trades, setTrades] = useState(2)
  const [wr,     setWr]     = useState(55)

  const { pipVal, unit } = INSTRUMENTS[inst]

  const riskAmt  = bal * rp / 100
  const lots     = riskAmt / (sl * pipVal)
  const tpAmt    = tp * pipVal * lots
  const rr       = tp / sl
  const be       = Math.round(100 / (1 + rr))
  const totalExp = riskAmt * trades
  const ddLim    = bal * 0.05
  const dayOk    = totalExp <= ddLim

  // Expectancy table (100 trades)
  const wins100     = wr
  const losses100   = 100 - wr
  const gpAll       = wins100 * tpAmt
  const glAll       = losses100 * riskAmt
  const net100      = gpAll - glAll
  const expPerTrade = net100 / 100

  const riskLevel = rp <= 0.5 ? 1 : rp <= 1 ? 2 : rp <= 1.5 ? 3 : rp <= 2 ? 4 : rp <= 3 ? 5 : 6
  const riskLabel = rp <= 1 ? 'Low — safe for prop firm rules'
    : rp <= 2 ? 'Moderate — trade with discipline'
    : 'High — danger to drawdown limits'
  const riskColor = rp <= 1 ? '#3ddc84' : rp <= 2 ? '#f5a623' : '#ff5c5c'

  return (
    <div>
      <PageHeader title="Risk manager" subtitle="Calculate your position size before every trade." />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <SectionTitle>Trade parameters</SectionTitle>
            <NumInput label="Account balance ($)" value={bal} onChange={setBal} step={1000} />
            <SliderRow label="Risk per trade (%)" min={0.1} max={5} step={0.1} value={rp}
              onChange={setRp} display={rp.toFixed(1) + '%'} />
            <NumInput label={`Stop loss (${unit})`} value={sl} onChange={setSl} min={1} />
            <NumInput label={`Take profit (${unit})`} value={tp} onChange={setTp} min={1} />
            <Field label="Instrument">
              <select value={inst} onChange={e => setInst(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: 13,
                  background: '#1c2030', border: '1px solid #2a2e38',
                  borderRadius: 8, color: '#dde2f0', outline: 'none' }}>
                {Object.entries(INSTRUMENTS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
            <NumInput label="Trades planned today" value={trades} onChange={setTrades} min={1} max={20} />
          </Card>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <MetricCard label="Risk amount" value={fmt(riskAmt)} color="#f5a623" />
            <MetricCard label="Position size" value={fmtD(lots, 2) + ' lots'} color="#4d9fff" />
            <MetricCard label="Take profit" value={fmt(tpAmt)} color="#3ddc84" />
          </div>

          <Card>
            <SectionTitle>Position details</SectionTitle>
            <ResultBox>
              <ResultRow label={`Pip / point value`} value={`$${pipVal} per ${unit}`} />
              <ResultRow label="Risk / Reward ratio" value={'1 : ' + fmtD(rr, 1)} color="#3ddc84" />
              <ResultRow label="Breakeven win rate" value={be + '%'} />
              <ResultRow label="Your win rate" value={wr + '%'} color={wr > be ? '#3ddc84' : '#ff5c5c'} />
              <ResultRow label="Total exposure today" value={fmt(totalExp)} color="#f5a623" />
              <ResultRow label="Daily DD limit (5%)" value={fmt(ddLim)} />
              <ResultRow label="Daily DD check" value={dayOk ? '✓ Safe' : '✗ Exceeds limit — reduce risk%'}
                color={dayOk ? '#3ddc84' : '#ff5c5c'} />
            </ResultBox>
          </Card>

          {/* Risk rating */}
          <Card>
            <SectionTitle>Risk rating</SectionTitle>
            <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  flex: 1, height: 8, borderRadius: 2,
                  background: i <= 2 ? '#3ddc84' : i <= 4 ? '#f5a623' : '#ff5c5c',
                  opacity: i <= riskLevel ? 1 : 0.2, transition: 'opacity .2s'
                }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: riskColor, marginTop: 6 }}>{riskLabel}</div>
          </Card>

          {/* Expectancy table */}
          <Card>
            <SectionTitle>Expectancy over 100 trades (win rate: {wr}%)</SectionTitle>
            <Field label="Win rate for projection (%)">
              <input type="range" min={20} max={80} step={1} value={wr}
                onChange={e => setWr(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#5b6af0' }} />
              <div style={{ textAlign: 'right', fontSize: 12, color: '#dde2f0', marginTop: 3 }}>{wr}%</div>
            </Field>
            <ResultBox>
              <ResultRow label="Winning trades" value={wins100 + ' of 100'} color="#3ddc84" />
              <ResultRow label="Losing trades" value={losses100 + ' of 100'} color="#ff5c5c" />
              <ResultRow label="Gross profit" value={fmt(gpAll)} color="#3ddc84" />
              <ResultRow label="Gross loss" value={fmt(glAll)} color="#ff5c5c" />
              <ResultRow label="Net result" value={(net100 >= 0 ? '+' : '') + fmt(net100)}
                color={net100 >= 0 ? '#3ddc84' : '#ff5c5c'} />
              <ResultRow label="Expectancy per trade"
                value={(expPerTrade >= 0 ? '+' : '') + fmt(expPerTrade)}
                color={expPerTrade >= 0 ? '#3ddc84' : '#ff5c5c'} />
            </ResultBox>
            {expPerTrade < 0 && (
              <Alert type="danger">Negative expectancy — you will lose money long-term at these settings. Improve win rate or R:R ratio.</Alert>
            )}
            {expPerTrade >= 0 && expPerTrade < riskAmt * 0.1 && (
              <Alert type="warn">Marginal expectancy. Small edge — consistency and discipline are critical.</Alert>
            )}
            {expPerTrade >= riskAmt * 0.1 && (
              <Alert type="success">Positive expectancy. This strategy has a real edge — protect it with proper risk management.</Alert>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
