'use client'
import { useState } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, Alert, PageHeader, NumInput, Field, ResultBox, SliderRow } from '@/components/ui'

const INSTRUMENTS: Record<string,{label:string;pipVal:number;unit:string}> = {
  forex:  {label:'Forex — major pairs',pipVal:10, unit:'pips'},
  gold:   {label:'Gold (XAU/USD)',     pipVal:1,  unit:'pips'},
  nas100: {label:'NAS100 / US100',     pipVal:1,  unit:'points'},
  spx:    {label:'S&P500 / US500',     pipVal:0.5,unit:'points'},
  btc:    {label:'Bitcoin (BTC)',      pipVal:1,  unit:'points'},
}

export default function RiskPage() {
  const [bal,setBal]=useState(100000); const [rp,setRp]=useState(1)
  const [sl,setSl]=useState(20); const [tp,setTp]=useState(60)
  const [inst,setInst]=useState('forex'); const [trades,setTrades]=useState(2); const [wr,setWr]=useState(55)

  const {pipVal,unit}=INSTRUMENTS[inst]
  const riskAmt=bal*rp/100; const lots=riskAmt/(sl*pipVal)
  const tpAmt=tp*pipVal*lots; const rr=tp/sl; const be=Math.round(100/(1+rr))
  const totalExp=riskAmt*trades; const ddLim=bal*0.05; const dayOk=totalExp<=ddLim
  const wins100=wr,losses100=100-wr,gpAll=wins100*tpAmt,glAll=losses100*riskAmt,net100=gpAll-glAll
  const expPerTrade=net100/100
  const riskLevel=rp<=0.5?1:rp<=1?2:rp<=1.5?3:rp<=2?4:rp<=3?5:6
  const riskColor=rp<=1?'#00B386':rp<=2?'#FF9800':'#F44336'

  const sel:React.CSSProperties={width:'100%',padding:'9px 12px',fontSize:13,background:'#F7F8FA',border:'1.5px solid #E8EAF0',borderRadius:8,color:'#1A1D2E',outline:'none',fontFamily:"'Nunito Sans',sans-serif"}

  return (
    <div>
      <PageHeader title="Risk manager" subtitle="Calculate your exact position size before every trade."/>
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16,alignItems:'start'}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card>
            <SectionTitle>Trade parameters</SectionTitle>
            <NumInput label="Account balance ($)" value={bal} onChange={setBal} step={1000}/>
            <SliderRow label="Risk per trade (%)" min={0.1} max={5} step={0.1} value={rp} onChange={setRp} display={rp.toFixed(1)+'%'}/>
            <NumInput label={`Stop loss (${unit})`} value={sl} onChange={setSl} min={1}/>
            <NumInput label={`Take profit (${unit})`} value={tp} onChange={setTp} min={1}/>
            <Field label="Instrument">
              <select value={inst} onChange={e=>setInst(e.target.value)} style={sel}>
                {Object.entries(INSTRUMENTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <NumInput label="Trades planned today" value={trades} onChange={setTrades} min={1} max={20}/>
          </Card>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            <MetricCard label="Risk amount" value={'$'+Math.round(riskAmt).toLocaleString()} color="#FF9800" trend="neutral"/>
            <MetricCard label="Position size" value={lots.toFixed(2)+' lots'} color="#2196F3" trend="neutral"/>
            <MetricCard label="Take profit" value={'$'+Math.round(tpAmt).toLocaleString()} color="#00B386" trend="up"/>
          </div>

          <Card>
            <SectionTitle>Position details</SectionTitle>
            <ResultBox>
              <ResultRow label={`${unit} value`} value={`$${pipVal} per ${unit}`}/>
              <ResultRow label="Risk / Reward ratio" value={'1 : '+rr.toFixed(1)} color="#00B386"/>
              <ResultRow label="Breakeven win rate" value={be+'%'}/>
              <ResultRow label="Your win rate" value={wr+'%'} color={wr>be?'#00B386':'#F44336'}/>
              <ResultRow label="Total exposure today" value={'$'+Math.round(totalExp).toLocaleString()} color="#FF9800"/>
              <ResultRow label="Daily DD limit (5%)" value={'$'+Math.round(ddLim).toLocaleString()}/>
              <ResultRow label="DD safety check" value={dayOk?'✓ Safe':'✗ Exceeds limit'} color={dayOk?'#00B386':'#F44336'}/>
            </ResultBox>
          </Card>

          <Card>
            <SectionTitle>Risk rating</SectionTitle>
            <div style={{display:'flex',gap:4,margin:'8px 0'}}>
              {[1,2,3,4,5,6].map(i=>(
                <div key={i} style={{flex:1,height:8,borderRadius:3,background:i<=2?'#00B386':i<=4?'#FF9800':'#F44336',opacity:i<=riskLevel?1:0.15,transition:'opacity .2s'}}/>
              ))}
            </div>
            <div style={{fontSize:12,color:riskColor,fontWeight:600,marginTop:4}}>{rp<=1?'Low risk — safe for prop firm rules':rp<=2?'Moderate — maintain strict discipline':'High risk — danger to drawdown limits'}</div>
          </Card>

          <Card>
            <SectionTitle>Expectancy over 100 trades</SectionTitle>
            <SliderRow label="Win rate (%)" min={20} max={80} value={wr} onChange={setWr} display={wr+'%'}/>
            <ResultBox>
              <ResultRow label="Winning trades" value={wins100+' of 100'} color="#00B386"/>
              <ResultRow label="Losing trades" value={losses100+' of 100'} color="#F44336"/>
              <ResultRow label="Gross profit" value={'$'+Math.round(gpAll).toLocaleString()} color="#00B386"/>
              <ResultRow label="Gross loss" value={'$'+Math.round(glAll).toLocaleString()} color="#F44336"/>
              <ResultRow label="Net result" value={(net100>=0?'+':'')+' $'+Math.abs(Math.round(net100)).toLocaleString()} color={net100>=0?'#00B386':'#F44336'}/>
              <ResultRow label="Expectancy / trade" value={(expPerTrade>=0?'+':'')+' $'+Math.abs(Math.round(expPerTrade)).toLocaleString()} color={expPerTrade>=0?'#00B386':'#F44336'}/>
            </ResultBox>
            {expPerTrade<0&&<Alert type="danger">Negative expectancy — adjust win rate or R:R ratio before trading.</Alert>}
            {expPerTrade>=0&&expPerTrade<riskAmt*0.1&&<Alert type="warn">Marginal edge — consistency and discipline are critical.</Alert>}
            {expPerTrade>=riskAmt*0.1&&<Alert type="success">Positive expectancy — this strategy has a real edge.</Alert>}
          </Card>
        </div>
      </div>
    </div>
  )
}
