'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, PageHeader, SectionTitle, MetricCard, ResultRow, Alert, Field, ResultBox } from '@/components/ui'

interface Trade { id:string; date:string; instrument:string; direction:string; pnl:number; result:string; lotSize:number; entryPrice:number; exitPrice:number; setup:string; notes:string; session:string }
interface Payout { id:string; firm:string; amount:number; date:string; status:'received'|'pending'|'processing'; method:string; notes:string }

const PAIRS = ['EUR/USD','GBP/USD','USD/JPY','XAU/USD','NAS100','SPX500','BTC/USD','ETH/USD','AUD/USD','USD/CAD']
const BASE_PRICES: Record<string,number> = {
  'EUR/USD':1.0853,'GBP/USD':1.2677,'USD/JPY':154.31,'XAU/USD':2324.80,
  'NAS100':18204,'SPX500':5218,'BTC/USD':67488,'ETH/USD':3179,'AUD/USD':0.6542,'USD/CAD':1.3621
}
const PIP_VALUES: Record<string,number> = {
  'EUR/USD':10,'GBP/USD':10,'USD/JPY':9.2,'XAU/USD':1,'NAS100':1,'SPX500':0.5,'BTC/USD':1,'ETH/USD':1,'AUD/USD':10,'USD/CAD':10
}
const fmt = (n:number) => '$'+Math.abs(Math.round(n)).toLocaleString()
const fmtPnl = (n:number) => (n>=0?'+':'')+' $'+Math.abs(Math.round(n)).toLocaleString()

function TradeTicket({ onTrade }: { onTrade:(t:any)=>void }) {
  const [pair,setPair]=useState('EUR/USD'); const [lots,setLots]=useState(0.1)
  const [sl,setSl]=useState(20); const [tp,setTp]=useState(40)
  const [setup,setSetup]=useState('Trend Follow'); const [notes,setNotes]=useState('')
  const [submitting,setSubmitting]=useState<'LONG'|'SHORT'|null>(null)
  const [flash,setFlash]=useState<{dir:string;pnl:number}|null>(null)

  const price = BASE_PRICES[pair]||1
  const pipVal = PIP_VALUES[pair]||10
  const riskAmt = sl*pipVal*lots; const tpAmt = tp*pipVal*lots; const rr = tp/sl

  const getSession = () => { const h=new Date().getUTCHours(); return h>=8&&h<13?'LONDON':h>=13&&h<18?'NEW_YORK':h>=0&&h<9?'ASIAN':'OVERLAP' }

  const placeTrade = async (direction:'LONG'|'SHORT') => {
    setSubmitting(direction)
    const won = Math.random()<0.55; const pnl = won?tpAmt:-riskAmt
    const entryPrice = price+(Math.random()-0.5)*0.0002
    const isBull = direction==='LONG'
    const exitPrice = isBull ? (won?entryPrice+(tp*0.0001):entryPrice-(sl*0.0001)) : (won?entryPrice-(tp*0.0001):entryPrice+(sl*0.0001))
    const trade = { date:new Date().toISOString().split('T')[0], instrument:pair, direction, session:getSession(), entryPrice:parseFloat(entryPrice.toFixed(5)), exitPrice:parseFloat(exitPrice.toFixed(5)), lotSize:lots, pnl, result:won?'WIN':'LOSS', setup, notes }
    await onTrade(trade)
    setFlash({dir:direction,pnl}); setTimeout(()=>setFlash(null),3000); setSubmitting(null)
  }

  const inp: React.CSSProperties = { background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8, padding:'8px 10px', fontSize:13, color:'#1A1D2E', outline:'none', fontFamily:"'Nunito Sans',sans-serif", fontWeight:500, width:'100%' }

  return (
    <Card>
      <SectionTitle>Trade ticket</SectionTitle>
      {flash && (
        <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:14, textAlign:'center', background:flash.pnl>=0?'#E8FBF5':'#FFEBEE', border:`1.5px solid ${flash.pnl>=0?'#B3EAD9':'#FFCDD2'}` }}>
          <div style={{ fontSize:20, fontWeight:800, color:flash.pnl>=0?'#00B386':'#F44336', fontFamily:"'Nunito',sans-serif" }}>{fmtPnl(flash.pnl)}</div>
          <div style={{ fontSize:12, color:'#9EA6C0', marginTop:2 }}>{flash.dir} {pair} — {flash.pnl>=0?'WIN ✓':'LOSS ✗'} · Logged</div>
        </div>
      )}
      <Field label="Instrument"><select value={pair} onChange={e=>setPair(e.target.value)} style={inp}>{PAIRS.map(p=><option key={p}>{p}</option>)}</select></Field>

      <div style={{ background:'#F7F8FA', borderRadius:10, padding:'12px 14px', marginBottom:14, border:'1px solid #F0F2F5' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <span style={{ fontSize:11, color:'#9EA6C0', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Market price</span>
          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'#E8FBF5', color:'#007A5C', fontWeight:700 }}>● LIVE</span>
        </div>
        <div style={{ fontSize:24, fontWeight:800, color:'#1A1D2E', fontFamily:'SF Mono,monospace', letterSpacing:'-.01em' }}>
          {['NAS100','SPX500','BTC/USD','ETH/USD','XAU/USD'].includes(pair)?price.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):price.toFixed(5)}
        </div>
        <div style={{ display:'flex', gap:16, marginTop:6 }}>
          {[['BID',(price-0.00015).toFixed(5),'#F44336'],['ASK',(price+0.00015).toFixed(5),'#00B386'],['SPREAD','1.5','#5A6078']].map(([l,v,c])=>(
            <div key={l}><div style={{ fontSize:10, color:'#9EA6C0', fontWeight:500 }}>{l}</div><div style={{ fontSize:12, fontWeight:700, color:c, fontFamily:'SF Mono,monospace' }}>{v}</div></div>
          ))}
        </div>
      </div>

      <Field label={`Lot size: ${lots}`}>
        <input type="range" min={0.01} max={2} step={0.01} value={lots} onChange={e=>setLots(parseFloat(e.target.value))} style={{ width:'100%', height:4, accentColor:'#00B386', border:'none', padding:0, background:'#E8EAF0' }}/>
      </Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <Field label={`SL: ${sl} pips`}><input type="range" min={5} max={100} value={sl} onChange={e=>setSl(Number(e.target.value))} style={{ width:'100%', height:4, accentColor:'#F44336', border:'none', padding:0, background:'#E8EAF0' }}/></Field>
        <Field label={`TP: ${tp} pips`}><input type="range" min={10} max={200} value={tp} onChange={e=>setTp(Number(e.target.value))} style={{ width:'100%', height:4, accentColor:'#00B386', border:'none', padding:0, background:'#E8EAF0' }}/></Field>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, background:'#F7F8FA', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
        {[{l:'Risk',v:fmt(riskAmt),c:'#F44336'},{l:'Reward',v:fmt(tpAmt),c:'#00B386'},{l:'R:R',v:'1:'+rr.toFixed(1),c:rr>=2?'#00B386':rr>=1?'#FF9800':'#F44336'}].map(s=>(
          <div key={s.l} style={{ textAlign:'center' }}><div style={{ fontSize:9, color:'#9EA6C0', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:2 }}>{s.l}</div><div style={{ fontSize:13, fontWeight:800, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div></div>
        ))}
      </div>

      <Field label="Setup"><select value={setup} onChange={e=>setSetup(e.target.value)} style={inp}>{['Trend Follow','Breakout','Reversal','Support/Resistance','ICT/SMC','News Trade','Other'].map(v=><option key={v}>{v}</option>)}</select></Field>
      <Field label="Notes"><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Quick note..." style={{ ...inp, height:48, resize:'none' }}/></Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <button onClick={()=>placeTrade('LONG')} disabled={!!submitting} style={{ padding:'13px', fontSize:14, fontWeight:800, borderRadius:12, cursor:'pointer', background:'linear-gradient(135deg,#00B386,#00C896)', border:'none', color:'#fff', fontFamily:"'Nunito',sans-serif", boxShadow:'0 4px 16px rgba(0,179,134,0.35)' }}>
          {submitting==='LONG'?'Placing…':'BUY ↑'}
        </button>
        <button onClick={()=>placeTrade('SHORT')} disabled={!!submitting} style={{ padding:'13px', fontSize:14, fontWeight:800, borderRadius:12, cursor:'pointer', background:'linear-gradient(135deg,#F44336,#FF5252)', border:'none', color:'#fff', fontFamily:"'Nunito',sans-serif", boxShadow:'0 4px 16px rgba(244,67,54,0.35)' }}>
          {submitting==='SHORT'?'Placing…':'SELL ↓'}
        </button>
      </div>
      <div style={{ fontSize:11, color:'#C4CAD9', textAlign:'center', marginTop:8 }}>Trades auto-log to your journal</div>
    </Card>
  )
}

function PayoutManager() {
  const [payouts,setPayouts]=useState<Payout[]>([
    { id:'1', firm:'FTMO',     amount:3200, date:'2026-04-01', status:'received',   method:'Bank Transfer', notes:'April payout' },
    { id:'2', firm:'Topstep',  amount:1800, date:'2026-03-15', status:'received',   method:'Bank Transfer', notes:'March profits' },
    { id:'3', firm:"The5%ers", amount:2400, date:'2026-04-10', status:'pending',    method:'PayPal',        notes:'Awaiting confirmation' },
  ])
  const [showForm,setShowForm]=useState(false)
  const [firm,setFirm]=useState('FTMO'); const [amount,setAmount]=useState(''); const [date,setDate]=useState(new Date().toISOString().split('T')[0])
  const [status,setStatus]=useState<'received'|'pending'|'processing'>('received'); const [method,setMethod]=useState('Bank Transfer'); const [notes,setNotes]=useState('')

  const addPayout=()=>{
    if(!amount)return
    setPayouts(prev=>[{id:Date.now().toString(),firm,amount:parseFloat(amount),date,status,method,notes},...prev])
    setAmount('');setNotes('');setShowForm(false)
  }

  const totalReceived = payouts.filter(p=>p.status==='received').reduce((s,p)=>s+p.amount,0)
  const totalPending  = payouts.filter(p=>p.status!=='received').reduce((s,p)=>s+p.amount,0)
  const statusColors  = { received:{bg:'#E8FBF5',color:'#007A5C',label:'Received ✓'}, pending:{bg:'#FFF3E0',color:'#E65100',label:'Pending'}, processing:{bg:'#E3F2FD',color:'#1565C0',label:'Processing'} }
  const inp: React.CSSProperties = { background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8, padding:'8px 10px', fontSize:13, color:'#1A1D2E', outline:'none', fontFamily:"'Nunito Sans',sans-serif", width:'100%' }

  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'.07em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:700, marginBottom:4 }}>Payout tracker</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:20, fontWeight:800, color:'#00B386', fontFamily:"'Nunito',sans-serif" }}>{fmt(totalReceived)}</span>
            <span style={{ fontSize:12, color:'#9EA6C0' }}>received · {fmt(totalPending)} pending</span>
          </div>
        </div>
        <button onClick={()=>setShowForm(p=>!p)} style={{ padding:'8px 16px', fontSize:12, fontWeight:700, borderRadius:10, background:'#00B386', border:'none', color:'#fff', cursor:'pointer', fontFamily:"'Nunito Sans',sans-serif" }}>+ Add payout</button>
      </div>

      {showForm&&(
        <div style={{ background:'#F7FBF9', border:'1.5px solid #B3EAD9', borderRadius:12, padding:'14px', marginBottom:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Firm</label><select value={firm} onChange={e=>setFirm(e.target.value)} style={inp}>{['FTMO','Topstep',"The5%ers",'MyFundedFX','Apex','Other'].map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Amount ($)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="3200" style={inp}/></div>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Status</label><select value={status} onChange={e=>setStatus(e.target.value as any)} style={inp}><option value="received">Received</option><option value="pending">Pending</option><option value="processing">Processing</option></select></div>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Method</label><select value={method} onChange={e=>setMethod(e.target.value)} style={inp}>{['Bank Transfer','PayPal','Wise','Crypto','Other'].map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Notes</label><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="April profits" style={inp}/></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addPayout} style={{ padding:'8px 18px', fontSize:12, fontWeight:700, background:'#00B386', border:'none', borderRadius:9, color:'#fff', cursor:'pointer' }}>Save</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', fontSize:12, fontWeight:700, background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:9, color:'#5A6078', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {payouts.map(p=>{
          const sc=statusColors[p.status]
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px', borderRadius:12, background:'#F7F8FA', border:'1px solid #F0F2F5', flexWrap:'wrap' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#E8FBF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💰</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#1A1D2E' }}>{p.firm}</span>
                  <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:sc.bg, color:sc.color, fontWeight:700 }}>{sc.label}</span>
                </div>
                <div style={{ fontSize:11, color:'#9EA6C0' }}>{p.date} · {p.method}{p.notes?` · ${p.notes}`:''}</div>
              </div>
              <span style={{ fontSize:16, fontWeight:800, color:p.status==='received'?'#00B386':'#FF9800', fontFamily:"'Nunito',sans-serif" }}>+{fmt(p.amount)}</span>
              <button onClick={()=>setPayouts(prev=>prev.filter(x=>x.id!==p.id))} style={{ background:'#FFEBEE', border:'none', color:'#F44336', borderRadius:7, cursor:'pointer', padding:'5px 9px', fontSize:12, fontWeight:700 }}>✕</button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function TradingPage() {
  const [trades,setTrades]=useState<Trade[]>([])
  const [stats,setStats]=useState({ totalPnl:0, wins:0, losses:0, winRate:0, totalTrades:0 })

  const fetchTrades=useCallback(async()=>{
    try{ const r=await fetch('/api/trades');const d=await r.json();const t=d.trades||[];setTrades(t)
      const wins=t.filter((x:Trade)=>x.result==='WIN');const totalPnl=t.reduce((s:number,x:Trade)=>s+Number(x.pnl),0)
      setStats({totalPnl,wins:wins.length,losses:t.filter((x:Trade)=>x.result==='LOSS').length,winRate:t.length?Math.round(wins.length/t.length*100):0,totalTrades:t.length})
    }catch{}
  },[])
  useEffect(()=>{fetchTrades()},[fetchTrades])

  const handleTrade=async(trade:any)=>{
    try{const r=await fetch('/api/trades',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(trade)});if(r.ok)await fetchTrades()}catch{}
  }

  return (
    <div>
      <PageHeader title="Trading desk" subtitle="Place trades, track payouts and monitor your challenge ROI."/>
      <Alert type="info">Trades are logged for journaling purposes. For real execution use your broker platform (MT4/MT5).</Alert>

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, margin:'16px 0' }}>
        <MetricCard label="Total P&L" value={(stats.totalPnl>=0?'+':'')+' $'+Math.abs(Math.round(stats.totalPnl)).toLocaleString()} color={stats.totalPnl>=0?'#00B386':'#F44336'} trend={stats.totalPnl>=0?'up':'down'}/>
        <MetricCard label="Win rate"  value={stats.winRate+'%'} color={stats.winRate>=50?'#00B386':'#F44336'} trend={stats.winRate>=50?'up':'down'}/>
        <MetricCard label="W / L"     value={`${stats.wins} / ${stats.losses}`} color="#7C4DFF" trend="neutral"/>
        <MetricCard label="Trades"    value={stats.totalTrades.toString()} color="#2196F3" trend="neutral"/>
      </div>

      {/* Stack on mobile */}
      <style>{`
        .trading-grid { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
        @media (max-width: 768px) { .trading-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="trading-grid">
        <TradeTicket onTrade={handleTrade}/>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {trades.length>0&&(
            <Card>
              <SectionTitle>Recent trades</SectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {trades.slice(0,6).map((t,i)=>(
                  <div key={t.id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#F7F8FA', flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:700, background:t.direction==='LONG'?'#E8FBF5':'#FFEBEE', color:t.direction==='LONG'?'#007A5C':'#C62828' }}>{t.direction}</span>
                    <span style={{ flex:1, fontSize:13, fontWeight:700, color:'#1A1D2E' }}>{t.instrument}</span>
                    <span style={{ fontSize:11, color:'#9EA6C0' }}>{t.date}</span>
                    <span style={{ fontSize:14, fontWeight:800, fontFamily:'SF Mono,monospace', color:Number(t.pnl)>=0?'#00B386':'#F44336' }}>{Number(t.pnl)>=0?'+':''} ${Math.abs(Math.round(Number(t.pnl))).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <PayoutManager/>
        </div>
      </div>
    </div>
  )
}
