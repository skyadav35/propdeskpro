'use client'
// app/dashboard/simulator/page.tsx

import { useState, useRef, useEffect } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, Alert, PageHeader, SliderRow, ResultBox, Btn } from '@/components/ui'

const PRESETS = {
  ftmo:    { label: 'FTMO',       pt: 10, mdd: 5, tdd: 10, days: 30 },
  topstep: { label: 'Topstep',    pt: 6,  mdd: 4, tdd: 8,  days: 30 },
  the5:    { label: 'The5%ers',   pt: 6,  mdd: 4, tdd: 8,  days: 60 },
  custom:  { label: 'Custom',     pt: 10, mdd: 5, tdd: 10, days: 30 },
}

const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString()

interface SimResult {
  passRate: number; passed: number; fDDD: number; fTDD: number; fTime: number
  avgPnl: number; ddBreachRate: number; best: number; worst: number
  med: number; p95: number; p5: number; nsims: number
  passPaths: number[][]; failPaths: number[][]
}

export default function SimulatorPage() {
  const [preset, setPreset] = useState('ftmo')
  const [acc,   setAcc]   = useState(100000)
  const [pt,    setPt]    = useState(10)
  const [mdd,   setMdd]   = useState(5)
  const [tdd,   setTdd]   = useState(10)
  const [days,  setDays]  = useState(30)
  const [wr,    setWr]    = useState(55)
  const [rr,    setRr]    = useState(2)
  const [rpt,   setRpt]   = useState(0.5)
  const [tpd,   setTpd]   = useState(2)
  const [nsims, setNsims] = useState(500)
  const [running, setRunning] = useState(false)
  const [result,  setResult]  = useState<SimResult | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadPreset = (key: string) => {
    const p = PRESETS[key as keyof typeof PRESETS]
    setPreset(key); setPt(p.pt); setMdd(p.mdd); setTdd(p.tdd); setDays(p.days)
  }

  const runSim = () => {
    setRunning(true)
    setTimeout(() => {
      const target = acc * pt / 100
      const mddAmt = acc * mdd / 100
      const tddAmt = acc * tdd / 100
      const effDays = Math.min(days, 60)
      const wrFrac = wr / 100

      let passed = 0, fDDD = 0, fTDD = 0, fTime = 0
      const allPnl: number[] = []
      const passPaths: number[][] = []
      const failPaths: number[][] = []

      for (let s = 0; s < nsims; s++) {
        let pnl = 0, outcome = 'time'
        const path = [0]
        outer:
        for (let d = 0; d < effDays; d++) {
          let dayPnl = 0
          for (let t = 0; t < tpd; t++) {
            const risk = (acc + pnl) * rpt / 100
            const win = Math.random() < wrFrac
            const tradePnl = win ? risk * rr : -risk
            pnl += tradePnl; dayPnl += tradePnl
            if (pnl >= target)         { outcome = 'pass';  break outer }
            if (dayPnl <= -mddAmt)     { outcome = 'f_ddd'; break outer }
            if (pnl <= -tddAmt)        { outcome = 'f_tdd'; break outer }
          }
          path.push(Math.round(pnl))
        }
        allPnl.push(pnl)
        if (outcome === 'pass') { passed++; if (passPaths.length < 8) passPaths.push(path) }
        else {
          if (outcome === 'f_ddd') fDDD++
          else if (outcome === 'f_tdd') fTDD++
          else fTime++
          if (failPaths.length < 8) failPaths.push(path)
        }
      }

      allPnl.sort((a, b) => a - b)
      const med  = allPnl[Math.floor(nsims / 2)]
      const p95  = allPnl[Math.floor(nsims * 0.95)]
      const p5   = allPnl[Math.floor(nsims * 0.05)]
      const avgPnl = allPnl.reduce((s, v) => s + v, 0) / nsims

      setResult({
        passRate: Math.round(passed / nsims * 100),
        passed, fDDD, fTDD, fTime,
        avgPnl, ddBreachRate: Math.round((fDDD + fTDD) / nsims * 100),
        best: allPnl[allPnl.length - 1], worst: allPnl[0],
        med, p95, p5, nsims, passPaths, failPaths
      })
      setRunning(false)
    }, 50)
  }

  // Draw chart after result changes
  useEffect(() => {
    if (!result || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const W = canvas.offsetWidth, H = canvas.offsetHeight

    const target = acc * pt / 100
    const tddAmt = acc * tdd / 100
    const allPaths = [...result.failPaths, ...result.passPaths]
    const maxLen = Math.max(...allPaths.map(p => p.length))
    const allVals = allPaths.flat()
    const minV = Math.min(...allVals, -tddAmt) * 1.1
    const maxV = Math.max(...allVals, target) * 1.15

    const toX = (i: number, len: number) => (i / (len - 1)) * (W - 40) + 20
    const toY = (v: number) => H - 24 - ((v - minV) / (maxV - minV)) * (H - 36)

    ctx.clearRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(30,34,53,.8)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = 12 + (i / 4) * (H - 36)
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y); ctx.stroke()
    }

    // Zero line
    ctx.strokeStyle = 'rgba(122,130,160,.3)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 4])
    const y0 = toY(0)
    ctx.beginPath(); ctx.moveTo(20, y0); ctx.lineTo(W - 20, y0); ctx.stroke()
    ctx.setLineDash([])

    // Target line
    ctx.strokeStyle = '#3ddc84'; ctx.lineWidth = 1; ctx.setLineDash([5, 5])
    const yT = toY(target)
    ctx.beginPath(); ctx.moveTo(20, yT); ctx.lineTo(W - 20, yT); ctx.stroke()

    // DD floor
    ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 1
    const yDD = toY(-tddAmt)
    ctx.beginPath(); ctx.moveTo(20, yDD); ctx.lineTo(W - 20, yDD); ctx.stroke()
    ctx.setLineDash([])

    // Fail paths
    result.failPaths.forEach(path => {
      ctx.strokeStyle = 'rgba(255,92,92,.35)'; ctx.lineWidth = 1
      ctx.beginPath()
      path.forEach((v, i) => {
        const x = toX(i, path.length), y = toY(v)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    })

    // Pass paths
    result.passPaths.forEach(path => {
      ctx.strokeStyle = 'rgba(61,220,132,.55)'; ctx.lineWidth = 1.5
      ctx.beginPath()
      path.forEach((v, i) => {
        const x = toX(i, path.length), y = toY(v)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    })

    // Labels
    ctx.font = '11px monospace'; ctx.fillStyle = '#404660'
    ctx.fillText('+' + fmt(target), 24, yT - 4)
    ctx.fillStyle = '#f5a623'
    ctx.fillText('−' + fmt(tddAmt), 24, yDD - 4)
  }, [result, acc, pt, tdd])

  // Pre-calc
  const riskAmt = acc * rpt / 100
  const winAmt  = riskAmt * rr
  const exp     = (wr / 100) * winAmt - (1 - wr / 100) * riskAmt
  const expPer  = exp / riskAmt
  const edpnl   = exp * tpd
  const targetA = acc * pt / 100
  const dtt     = edpnl > 0 ? Math.ceil(targetA / edpnl) : -1
  const be      = Math.round(100 / (1 + rr))

  return (
    <div>
      <PageHeader title="Challenge simulator"
        subtitle="Run Monte Carlo simulations to find your pass probability before buying a real challenge." />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <SectionTitle>Firm preset</SectionTitle>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {Object.entries(PRESETS).map(([k, p]) => (
                <button key={k} onClick={() => loadPreset(k)} style={{
                  padding: '4px 10px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
                  background: preset === k ? '#081830' : 'transparent',
                  border: preset === k ? '1px solid #4d9fff' : '1px solid #2a2e38',
                  color: preset === k ? '#4d9fff' : '#7a82a0',
                }}>{p.label}</button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Challenge rules</SectionTitle>
            <SliderRow label="Profit target (%)" min={4} max={20} step={0.5} value={pt} onChange={setPt} display={pt + '%'} />
            <SliderRow label="Max daily DD (%)" min={1} max={10} step={0.5} value={mdd} onChange={setMdd} display={mdd + '%'} />
            <SliderRow label="Max total DD (%)" min={2} max={20} step={0.5} value={tdd} onChange={setTdd} display={tdd + '%'} />
            <SliderRow label="Trading days" min={10} max={60} value={days} onChange={setDays} display={days.toString()} />
          </Card>

          <Card>
            <SectionTitle>Your strategy</SectionTitle>
            <SliderRow label="Win rate (%)" min={20} max={80} value={wr} onChange={setWr} display={wr + '%'} />
            <SliderRow label="Risk/reward ratio" min={0.5} max={5} step={0.1} value={rr} onChange={setRr} display={'1:' + rr.toFixed(1)} />
            <SliderRow label="Risk per trade (%)" min={0.1} max={3} step={0.1} value={rpt} onChange={setRpt} display={rpt.toFixed(1) + '%'} />
            <SliderRow label="Trades per day" min={1} max={10} value={tpd} onChange={setTpd} display={tpd.toString()} />
            <SliderRow label="Simulations" min={100} max={2000} step={100} value={nsims} onChange={setNsims} display={nsims.toString()} />
            <Btn onClick={runSim} full style={{ marginTop: 8 }}>
              {running ? 'Running…' : 'Run simulation'}
            </Btn>
          </Card>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Pre-calc */}
          <Card>
            <SectionTitle>Pre-simulation estimates</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <MetricCard label="Expectancy" value={(expPer >= 0 ? '+' : '') + expPer.toFixed(3)}
                color={expPer >= 0 ? '#3ddc84' : '#ff5c5c'} sub="per $1 risked" />
              <MetricCard label="Expected daily P&L" value={(edpnl >= 0 ? '+' : '') + fmt(edpnl)}
                color={edpnl >= 0 ? '#3ddc84' : '#ff5c5c'} />
            </div>
            <ResultBox>
              <ResultRow label="Breakeven win rate" value={be + '% (yours: ' + wr + '%)'} color={wr > be ? '#3ddc84' : '#ff5c5c'} />
              <ResultRow label="Days to hit target (expected)" value={dtt > 0 ? dtt + ' days' : 'Never — negative EV'} color={dtt > 0 && dtt <= days ? '#3ddc84' : '#ff5c5c'} />
            </ResultBox>
          </Card>

          {/* Chart + results */}
          {!result ? (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 240, color: '#404660', fontSize: 13, border: '1px dashed #1e2235', borderRadius: 10 }}>
                Adjust sliders and click "Run simulation" to test your strategy
              </div>
            </Card>
          ) : (
            <>
              {/* Verdict */}
              <div style={{
                borderRadius: 10, padding: '10px 16px', textAlign: 'center', fontSize: 14, fontWeight: 600,
                background: result.passRate >= 70 ? '#0a2218' : result.passRate >= 40 ? '#231500' : '#1f0a0a',
                color: result.passRate >= 70 ? '#3ddc84' : result.passRate >= 40 ? '#f5a623' : '#ff5c5c',
                border: `1px solid ${result.passRate >= 70 ? '#0d4020' : result.passRate >= 40 ? '#3a2000' : '#5a1a1a'}`
              }}>
                {result.passRate >= 70
                  ? `Strategy likely passes — ${result.passRate}% simulated pass rate. Ready to buy the challenge.`
                  : result.passRate >= 40
                  ? `Marginal strategy — ${result.passRate}% pass rate. Tweak risk or win rate first.`
                  : `Strategy likely fails — ${result.passRate}% pass rate. Significant adjustments needed.`}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                <MetricCard label="Pass rate" value={result.passRate + '%'}
                  color={result.passRate >= 70 ? '#3ddc84' : result.passRate >= 40 ? '#f5a623' : '#ff5c5c'} />
                <MetricCard label="Avg final P&L" value={(result.avgPnl >= 0 ? '+' : '') + fmt(result.avgPnl)}
                  color={result.avgPnl >= 0 ? '#3ddc84' : '#ff5c5c'} />
                <MetricCard label="DD breach rate" value={result.ddBreachRate + '%'}
                  color={result.ddBreachRate < 20 ? '#3ddc84' : '#ff5c5c'} />
                <MetricCard label="Simulations" value={result.nsims.toString()} />
              </div>

              {/* Equity chart */}
              <Card>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#565a6e', marginBottom: 8 }}>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#3ddc84', marginRight: 4, verticalAlign: 'middle' }}></span>Pass path</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#ff5c5c', marginRight: 4, verticalAlign: 'middle' }}></span>Fail path</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#3ddc84', borderTop: '2px dashed #3ddc84', marginRight: 4, verticalAlign: 'middle' }}></span>Target</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#f5a623', borderTop: '2px dashed #f5a623', marginRight: 4, verticalAlign: 'middle' }}></span>DD floor</span>
                </div>
                <div style={{ position: 'relative', width: '100%', height: 240 }}>
                  <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                </div>
              </Card>

              {/* Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <SectionTitle>Outcome breakdown</SectionTitle>
                  <ResultBox>
                    <ResultRow label="Passed challenge" value={result.passed + ' runs'} color="#3ddc84" />
                    <ResultRow label="Failed — daily DD" value={result.fDDD + ' runs'} color="#ff5c5c" />
                    <ResultRow label="Failed — total DD" value={result.fTDD + ' runs'} color="#ff5c5c" />
                    <ResultRow label="Failed — time expired" value={result.fTime + ' runs'} color="#f5a623" />
                    <ResultRow label="Best result" value={'+' + fmt(result.best)} color="#3ddc84" />
                    <ResultRow label="Worst result" value={fmt(result.worst)} color="#ff5c5c" />
                  </ResultBox>
                </Card>
                <Card>
                  <SectionTitle>P&L distribution</SectionTitle>
                  <ResultBox>
                    <ResultRow label="Median final P&L" value={(result.med >= 0 ? '+' : '') + fmt(result.med)}
                      color={result.med >= 0 ? '#3ddc84' : '#ff5c5c'} />
                    <ResultRow label="95th percentile" value={'+' + fmt(result.p95)} color="#3ddc84" />
                    <ResultRow label="5th percentile" value={(result.p5 >= 0 ? '+' : '') + fmt(result.p5)}
                      color={result.p5 >= 0 ? '#3ddc84' : '#ff5c5c'} />
                  </ResultBox>
                  {result.fDDD > result.fTDD && (
                    <Alert type="warn">Most failures are daily DD breaches — reduce trades per day or risk per trade.</Alert>
                  )}
                  {result.fTime > result.fDDD + result.fTDD && (
                    <Alert type="info">Most failures are time expiry — consider slightly increasing position size or trade frequency.</Alert>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
