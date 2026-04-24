'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, PageHeader, SectionTitle, MetricCard, ResultRow, Alert, Field, ResultBox, Badge } from '@/components/ui'

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

// ─── Trade Ticket ─────────────────────────────────────────────────
function TradeTicket({ onTrade }: { onTrade: (t:any)=>void }) {
  const [pair, setPair] = useState('EUR/USD')
  const [lots, setLots] = useState(0.1)
  const [sl, setSl] = useState(20)
  const [tp, setTp] = useState(40)
  const [setup, setSetup] = useState('Trend Follow')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState<'BUY'|'SELL'|null>(null)
  const [flash, setFlash] = useState<{dir:string;pnl:number}|null>(null)

  const price = BASE_PRICES[pair] || 1
  const pipVal = PIP_VALUES[pair] || 10
  const riskAmt = sl * pipVal * lots
  const tpAmt = tp * pipVal * lots
  const rr = tp / sl

  const placeTrade = async (direction: 'LONG'|'SHORT') => {
    setSubmitting(direction)
    const slippage = (Math.random()-0.5)*0.0002
    const entryPrice = price + slippage
    const isBull = direction === 'LONG'

    // Simulate outcome based on 55% win rate
    const won = Math.random() < 0.55
    const pnl = won ? tpAmt : -riskAmt
    const exitPrice = isBull
      ? won ? entryPrice + (tp*0.0001) : entryPrice - (sl*0.0001)
      : won ? entryPrice - (tp*0.0001) : entryPrice + (sl*0.0001)

    const trade = {
      date: new Date().toISOString().split('T')[0],
      instrument: pair, direction,
      session: getSession(),
      entryPrice: parseFloat(entryPrice.toFixed(5)),
      exitPrice: parseFloat(exitPrice.toFixed(5)),
      lotSize: lots, pnl,
      result: won ? 'WIN' : 'LOSS',
      setup, notes,
    }

    await onTrade(trade)
    setFlash({ dir: direction, pnl })
    setTimeout(() => setFlash(null), 3000)
    setSubmitting(null)
  }

  const getSession = () => {
    const h = new Date().getUTCHours()
    if (h>=8&&h<13) return 'LONDON'
    if (h>=13&&h<18) return 'NEW_YORK'
    if (h>=0&&h<9) return 'ASIAN'
    return 'OVERLAP'
  }

  const inp: React.CSSProperties = {
    background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8,
    padding:'8px 10px', fontSize:13, color:'#1A1D2E', outline:'none',
    fontFamily:"'Nunito Sans',sans-serif", fontWeight:500, width:'100%'
  }

  return (
    <Card style={{ position:'sticky', top:24 }}>
      <SectionTitle>Trade ticket</SectionTitle>

      {flash && (
        <div style={{
          padding:'12px 16px', borderRadius:10, marginBottom:14, textAlign:'center',
          background: flash.pnl>=0?'#E8FBF5':'#FFEBEE',
          border: `1.5px solid ${flash.pnl>=0?'#B3EAD9':'#FFCDD2'}`,
          animation:'fadeIn .3s ease'
        }}>
          <div style={{ fontSize:20, fontWeight:800, color:flash.pnl>=0?'#00B386':'#F44336', fontFamily:"'Nunito',sans-serif" }}>
            {fmtPnl(flash.pnl)}
          </div>
          <div style={{ fontSize:12, color:'#9EA6C0', marginTop:2 }}>{flash.dir} {pair} — {flash.pnl>=0?'WIN ✓':'LOSS ✗'} · Trade logged</div>
        </div>
      )}

      {/* Pair selector */}
      <Field label="Instrument">
        <select value={pair} onChange={e=>setPair(e.target.value)} style={inp}>
          {PAIRS.map(p=><option key={p}>{p}</option>)}
        </select>
      </Field>

      {/* Live price display */}
      <div style={{ background:'#F7F8FA', borderRadius:10, padding:'12px 14px', marginBottom:14, border:'1px solid #F0F2F5' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9EA6C0', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase' }}>Market price</span>
          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'#E8FBF5', color:'#007A5C', fontWeight:700 }}>● LIVE</span>
        </div>
        <div style={{ fontSize:26, fontWeight:800, color:'#1A1D2E', fontFamily:'SF Mono,monospace', marginTop:4, letterSpacing:'-.01em' }}>
          {['NAS100','SPX500','BTC/USD','ETH/USD','XAU/USD'].includes(pair)
            ? price.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
            : price.toFixed(5)}
        </div>
        <div style={{ display:'flex', gap:16, marginTop:6 }}>
          <div>
            <div style={{ fontSize:10, color:'#9EA6C0', fontWeight:500 }}>BID</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#F44336', fontFamily:'SF Mono,monospace' }}>
              {(price-0.00015).toFixed(['NAS100','SPX500'].includes(pair)?1:5)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:'#9EA6C0', fontWeight:500 }}>ASK</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#00B386', fontFamily:'SF Mono,monospace' }}>
              {(price+0.00015).toFixed(['NAS100','SPX500'].includes(pair)?1:5)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, color:'#9EA6C0', fontWeight:500 }}>SPREAD</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#5A6078', fontFamily:'SF Mono,monospace' }}>1.5</div>
          </div>
        </div>
      </div>

      {/* Lot size */}
      <Field label={`Lot size: ${lots}`}>
        <input type="range" min={0.01} max={2} step={0.01} value={lots}
          onChange={e=>setLots(parseFloat(e.target.value))}
          style={{ width:'100%', height:4, accentColor:'#00B386', border:'none', padding:0, background:'#E8EAF0' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#C4CAD9', marginTop:3 }}>
          <span>0.01</span><span>0.10</span><span>0.50</span><span>1.00</span><span>2.00</span>
        </div>
      </Field>

      {/* SL / TP */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <Field label={`Stop loss: ${sl} pips`}>
          <input type="range" min={5} max={100} value={sl} onChange={e=>setSl(Number(e.target.value))}
            style={{ width:'100%', height:4, accentColor:'#F44336', border:'none', padding:0, background:'#E8EAF0' }}/>
        </Field>
        <Field label={`Take profit: ${tp} pips`}>
          <input type="range" min={10} max={200} value={tp} onChange={e=>setTp(Number(e.target.value))}
            style={{ width:'100%', height:4, accentColor:'#00B386', border:'none', padding:0, background:'#E8EAF0' }}/>
        </Field>
      </div>

      {/* Risk summary */}
      <div style={{ background:'#F7F8FA', borderRadius:10, padding:'10px 14px', marginBottom:14, border:'1px solid #F0F2F5' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Risk', val:fmt(riskAmt), color:'#F44336' },
            { label:'Reward', val:fmt(tpAmt), color:'#00B386' },
            { label:'R:R', val:'1:'+rr.toFixed(1), color:rr>=2?'#00B386':rr>=1?'#FF9800':'#F44336' },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#9EA6C0', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:14, fontWeight:800, color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <Field label="Setup">
        <select value={setup} onChange={e=>setSetup(e.target.value)} style={inp}>
          {['Trend Follow','Breakout','Reversal','Support/Resistance','ICT/SMC','News Trade','Other'].map(v=><option key={v}>{v}</option>)}
        </select>
      </Field>

      <Field label="Notes (optional)">
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Quick note about this trade..."
          style={{ ...inp, height:50, resize:'none' }}/>
      </Field>

      {/* Buy / Sell buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <button onClick={()=>placeTrade('LONG')} disabled={!!submitting} style={{
          padding:'14px', fontSize:14, fontWeight:800, borderRadius:12, cursor:submitting?'not-allowed':'pointer',
          background: submitting==='BUY'?'#E8FBF5':'linear-gradient(135deg,#00B386,#00C896)',
          border:'none', color: submitting==='BUY'?'#00B386':'#fff',
          fontFamily:"'Nunito',sans-serif",
          boxShadow: submitting?'none':'0 4px 16px rgba(0,179,134,0.35)',
          transition:'all .2s'
        }}>
          {submitting==='BUY'?'Placing…':'BUY / LONG ↑'}
        </button>
        <button onClick={()=>placeTrade('SHORT')} disabled={!!submitting} style={{
          padding:'14px', fontSize:14, fontWeight:800, borderRadius:12, cursor:submitting?'not-allowed':'pointer',
          background: submitting==='SELL'?'#FFEBEE':'linear-gradient(135deg,#F44336,#FF5252)',
          border:'none', color: submitting==='SELL'?'#F44336':'#fff',
          fontFamily:"'Nunito',sans-serif",
          boxShadow: submitting?'none':'0 4px 16px rgba(244,67,54,0.35)',
          transition:'all .2s'
        }}>
          {submitting==='SELL'?'Placing…':'SELL / SHORT ↓'}
        </button>
      </div>

      <div style={{ fontSize:11, color:'#C4CAD9', textAlign:'center', marginTop:10, fontWeight:500 }}>
        Trades are logged to your journal instantly
      </div>
    </Card>
  )
}

// ─── Payout Manager ───────────────────────────────────────────────
function PayoutManager() {
  const [payouts, setPayouts] = useState<Payout[]>([
    { id:'1', firm:'FTMO', amount:3200, date:'2026-04-01', status:'received', method:'Bank Transfer', notes:'Phase 1 — April payout' },
    { id:'2', firm:'Topstep', amount:1800, date:'2026-03-15', status:'received', method:'Bank Transfer', notes:'March profits' },
    { id:'3', firm:'The5%ers', amount:2400, date:'2026-04-10', status:'pending', method:'PayPal', notes:'Awaiting confirmation' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [firm, setFirm] = useState('FTMO')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<'received'|'pending'|'processing'>('received')
  const [method, setMethod] = useState('Bank Transfer')
  const [notes, setNotes] = useState('')

  const addPayout = () => {
    if (!amount) return
    const p: Payout = { id:Date.now().toString(), firm, amount:parseFloat(amount), date, status, method, notes }
    setPayouts(prev=>[p,...prev])
    setAmount(''); setNotes(''); setShowForm(false)
  }
  const removePayout = (id:string) => setPayouts(prev=>prev.filter(p=>p.id!==id))

  const totalReceived = payouts.filter(p=>p.status==='received').reduce((s,p)=>s+p.amount,0)
  const totalPending = payouts.filter(p=>p.status!=='received').reduce((s,p)=>s+p.amount,0)

  const statusColors = {
    received:   { bg:'#E8FBF5', color:'#007A5C', label:'Received ✓' },
    pending:    { bg:'#FFF3E0', color:'#E65100', label:'Pending' },
    processing: { bg:'#E3F2FD', color:'#1565C0', label:'Processing' },
  }

  const inp: React.CSSProperties = {
    background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8,
    padding:'8px 10px', fontSize:13, color:'#1A1D2E', outline:'none',
    fontFamily:"'Nunito Sans',sans-serif", fontWeight:500, width:'100%'
  }

  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'.07em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:700, marginBottom:4 }}>Payout tracker</div>
          <div style={{ display:'flex', gap:16, alignItems:'baseline' }}>
            <span style={{ fontSize:22, fontWeight:800, color:'#00B386', fontFamily:"'Nunito',sans-serif" }}>{fmt(totalReceived)}</span>
            <span style={{ fontSize:12, color:'#9EA6C0', fontWeight:500 }}>received · {fmt(totalPending)} pending</span>
          </div>
        </div>
        <button onClick={()=>setShowForm(p=>!p)} style={{
          padding:'8px 16px', fontSize:12, fontWeight:700, borderRadius:10,
          background:'#00B386', border:'none', color:'#fff', cursor:'pointer',
          boxShadow:'0 4px 12px rgba(0,179,134,0.3)', fontFamily:"'Nunito Sans',sans-serif"
        }}>+ Add payout</button>
      </div>

      {showForm && (
        <div style={{ background:'#F7FBF9', border:'1.5px solid #B3EAD9', borderRadius:12, padding:'16px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#007A5C', marginBottom:12 }}>New payout entry</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <Field label="Firm">
              <select value={firm} onChange={e=>setFirm(e.target.value)} style={inp}>
                {['FTMO','Topstep','The5%ers','MyFundedFX','Apex','Other'].map(v=><option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Amount ($)">
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="3200" style={inp}/>
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/>
            </Field>
            <Field label="Status">
              <select value={status} onChange={e=>setStatus(e.target.value as any)} style={inp}>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </Field>
            <Field label="Payment method">
              <select value={method} onChange={e=>setMethod(e.target.value)} style={inp}>
                {['Bank Transfer','PayPal','Wise','Crypto','Other'].map(v=><option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. April profits" style={inp}/>
            </Field>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addPayout} style={{ padding:'8px 18px', fontSize:12, fontWeight:700, background:'#00B386', border:'none', borderRadius:9, color:'#fff', cursor:'pointer' }}>Save payout</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', fontSize:12, fontWeight:700, background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:9, color:'#5A6078', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {payouts.map(p=>{
          const sc = statusColors[p.status]
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, background:'#F7F8FA', border:'1px solid #F0F2F5', transition:'background .1s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#F0F2F5')}
              onMouseLeave={e=>(e.currentTarget.style.background='#F7F8FA')}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#E8FBF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💰</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>{p.firm}</span>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:sc.bg, color:sc.color, fontWeight:700 }}>{sc.label}</span>
                </div>
                <div style={{ fontSize:12, color:'#9EA6C0', fontWeight:500 }}>{p.date} · {p.method}{p.notes?` · ${p.notes}`:''}</div>
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:p.status==='received'?'#00B386':'#FF9800', fontFamily:"'Nunito',sans-serif", marginRight:8 }}>
                +{fmt(p.amount)}
              </div>
              <button onClick={()=>removePayout(p.id)} style={{ background:'#FFEBEE', border:'none', color:'#F44336', borderRadius:7, cursor:'pointer', padding:'5px 9px', fontSize:12, fontWeight:700 }}>✕</button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Challenge Fee Tracker ────────────────────────────────────────
function FeeTracker() {
  const [fees, setFees] = useState([
    { id:'1', firm:'FTMO', size:'$100K', fee:499, date:'2026-01-15', result:'PASSED', payout:3200 },
    { id:'2', firm:'FTMO', size:'$100K', fee:499, date:'2026-02-01', result:'FAILED', payout:0 },
    { id:'3', firm:'Topstep', size:'$50K', fee:149, date:'2026-03-01', result:'PASSED', payout:1800 },
    { id:'4', firm:'The5%ers', size:'$100K', fee:299, date:'2026-04-01', result:'ACTIVE', payout:0 },
  ])

  const totalSpent = fees.reduce((s,f)=>s+f.fee,0)
  const totalEarned = fees.reduce((s,f)=>s+f.payout,0)
  const netProfit = totalEarned - totalSpent
  const roi = totalSpent > 0 ? Math.round((netProfit/totalSpent)*100) : 0

  const resultColor = (r:string) => r==='PASSED'?{bg:'#E8FBF5',color:'#007A5C'}:r==='FAILED'?{bg:'#FFEBEE',color:'#C62828'}:{bg:'#FFF3E0',color:'#E65100'}

  return (
    <Card>
      <SectionTitle>Challenge fee ROI tracker</SectionTitle>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Total spent', val:fmt(totalSpent), color:'#F44336' },
          { label:'Total earned', val:fmt(totalEarned), color:'#00B386' },
          { label:'Net profit', val:(netProfit>=0?'+':'')+fmt(netProfit), color:netProfit>=0?'#00B386':'#F44336' },
          { label:'ROI', val:(roi>=0?'+':'')+roi+'%', color:roi>=0?'#00B386':'#F44336' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#F7F8FA', borderRadius:10, padding:'12px 14px', border:'1px solid #F0F2F5' }}>
            <div style={{ fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:600, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>{['Firm','Account','Fee paid','Date','Result','Payout','Net'].map(h=>(
              <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:11, letterSpacing:'.05em', textTransform:'uppercase', color:'#9EA6C0', borderBottom:'2px solid #F0F2F5', fontWeight:700 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {fees.map(f=>{
              const rc = resultColor(f.result)
              const net = f.payout - f.fee
              return (
                <tr key={f.id} style={{ borderBottom:'1px solid #F5F7FA' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='#F7F8FA')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{ padding:'11px 12px', fontWeight:700, color:'#1A1D2E' }}>{f.firm}</td>
                  <td style={{ padding:'11px 12px', color:'#5A6078', fontWeight:500 }}>{f.size}</td>
                  <td style={{ padding:'11px 12px', fontFamily:'SF Mono,monospace', fontWeight:700, color:'#F44336' }}>${f.fee}</td>
                  <td style={{ padding:'11px 12px', color:'#9EA6C0', fontWeight:500 }}>{f.date}</td>
                  <td style={{ padding:'11px 12px' }}>
                    <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, fontWeight:700, background:rc.bg, color:rc.color }}>{f.result}</span>
                  </td>
                  <td style={{ padding:'11px 12px', fontFamily:'SF Mono,monospace', fontWeight:700, color:'#00B386' }}>{f.payout>0?'+'+fmt(f.payout):'—'}</td>
                  <td style={{ padding:'11px 12px', fontFamily:'SF Mono,monospace', fontWeight:800, color:net>=0?'#00B386':'#F44336', fontSize:14 }}>
                    {f.result==='ACTIVE'?'Active':(net>=0?'+':'')+fmt(net)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Recent trades ─────────────────────────────────────────────────
function RecentTrades({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(0,8)
  if (!recent.length) return null
  return (
    <Card>
      <SectionTitle>Recent trades</SectionTitle>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {recent.map((t,i)=>(
          <div key={t.id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'#F7F8FA', border:'1px solid #F0F2F5' }}>
            <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, fontWeight:700,
              background:t.direction==='LONG'?'#E8FBF5':'#FFEBEE', color:t.direction==='LONG'?'#007A5C':'#C62828' }}>{t.direction}</span>
            <span style={{ flex:1, fontSize:13, fontWeight:700, color:'#1A1D2E' }}>{t.instrument}</span>
            <span style={{ fontSize:11, color:'#9EA6C0', fontWeight:500 }}>{t.date}</span>
            <span style={{ fontSize:14, fontWeight:800, fontFamily:'SF Mono,monospace', color:Number(t.pnl)>=0?'#00B386':'#F44336' }}>
              {Number(t.pnl)>=0?'+':''} ${Math.abs(Math.round(Number(t.pnl))).toLocaleString()}
            </span>
            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700,
              background:t.result==='WIN'?'#E8FBF5':'#FFEBEE', color:t.result==='WIN'?'#007A5C':'#C62828' }}>{t.result}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────
export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState({ totalPnl:0, wins:0, losses:0, winRate:0, totalTrades:0 })

  const fetchTrades = useCallback(async () => {
    try {
      const r = await fetch('/api/trades'); const d = await r.json()
      const t = d.trades || []
      setTrades(t)
      const wins = t.filter((x:Trade)=>x.result==='WIN')
      const losses = t.filter((x:Trade)=>x.result==='LOSS')
      const totalPnl = t.reduce((s:number,x:Trade)=>s+Number(x.pnl),0)
      setStats({ totalPnl, wins:wins.length, losses:losses.length, winRate:t.length?Math.round(wins.length/t.length*100):0, totalTrades:t.length })
    } catch {}
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const handleTrade = async (trade: any) => {
    try {
      const r = await fetch('/api/trades',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(trade)})
      if (r.ok) await fetchTrades()
    } catch {}
  }

  return (
    <div>
      <PageHeader title="Trading desk" subtitle="Place trades, track payouts and monitor your challenge ROI — all in one place."/>

      <Alert type="info">This is a trade logging system. Trades are simulated for journaling purposes. For real execution use your broker's platform (MT4/MT5).</Alert>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, margin:'16px 0' }}>
        <MetricCard label="Total P&L" value={(stats.totalPnl>=0?'+':'')+' $'+Math.abs(Math.round(stats.totalPnl)).toLocaleString()} color={stats.totalPnl>=0?'#00B386':'#F44336'} trend={stats.totalPnl>=0?'up':'down'}/>
        <MetricCard label="Win rate" value={stats.winRate+'%'} color={stats.winRate>=50?'#00B386':'#F44336'} trend={stats.winRate>=50?'up':'down'}/>
        <MetricCard label="Wins / Losses" value={`${stats.wins} / ${stats.losses}`} color="#7C4DFF" trend="neutral"/>
        <MetricCard label="Total trades" value={stats.totalTrades.toString()} color="#2196F3" trend="neutral"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16, alignItems:'start' }}>
        <TradeTicket onTrade={handleTrade}/>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <RecentTrades trades={trades}/>
          <PayoutManager/>
          <FeeTracker/>
        </div>
      </div>
    </div>
  )
}
