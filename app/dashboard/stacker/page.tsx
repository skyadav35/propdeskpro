'use client'
import { useState } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, Alert, PageHeader, ResultBox, Btn } from '@/components/ui'

interface Account { id:number; firm:string; size:number; split:number; daily:number; days:number; status:string }
const FIRMS = ['FTMO','Topstep','The5%ers','MyFundedFX','Apex','Other']
const fmt = (n:number) => '$'+Math.round(n).toLocaleString()
let nextId = 3

export default function StackerPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id:1, firm:'FTMO',    size:100000, split:80, daily:0.5, days:20, status:'ACTIVE' },
    { id:2, firm:'Topstep', size:50000,  split:90, daily:0.6, days:20, status:'ACTIVE' },
  ])
  const update = (id:number, key:keyof Account, val:any) =>
    setAccounts(prev => prev.map(a => a.id===id ? {...a,[key]:val} : a))
  const remove = (id:number) => setAccounts(prev => prev.filter(a => a.id!==id))
  const add = () => setAccounts(prev => [...prev, { id:nextId++, firm:'FTMO', size:100000, split:80, daily:0.5, days:20, status:'ACTIVE' }])

  const active = accounts.filter(a => a.status==='ACTIVE')
  const totalCap = active.reduce((s,a) => s+a.size, 0)
  const totalDailyNet = active.reduce((s,a) => s+(a.size*a.daily/100*a.split/100), 0)
  const totalMonthly = active.reduce((s,a) => s+(a.size*a.daily/100*a.split/100*a.days), 0)

  const inp: React.CSSProperties = { background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:8, padding:'7px 10px', fontSize:13, color:'#1A1D2E', outline:'none', fontFamily:"'Nunito Sans',sans-serif", width:'100%' }
  const statusColor = (s:string) => s==='ACTIVE'?'#00B386':s==='BLOWN'?'#F44336':'#FF9800'

  return (
    <div>
      <PageHeader title="Multi-account stacker" subtitle="Track all your funded accounts and combined income."/>

      <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        <MetricCard label="Total capital"     value={fmt(totalCap)}        sub="under management" trend="neutral"/>
        <MetricCard label="Daily take-home"   value={fmt(totalDailyNet)}   color="#00B386" trend="up" sub="your cut"/>
        <MetricCard label="Monthly net"       value={fmt(totalMonthly)}    color="#00B386" trend="up" sub="estimated"/>
        <MetricCard label="Annual projection" value={fmt(totalMonthly*12)} color="#7C4DFF" trend="up"/>
      </div>

      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:11, letterSpacing:'.07em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:700 }}>Account portfolio</div>
          <button onClick={add} style={{ padding:'8px 16px', fontSize:12, fontWeight:700, borderRadius:10, background:'#00B386', border:'none', color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,179,134,0.3)', fontFamily:"'Nunito Sans',sans-serif" }}>+ Add account</button>
        </div>

        {/* Mobile card view */}
        <style>{`
          @media (max-width: 768px) { .acct-table { display: none !important; } .acct-cards { display: flex !important; } }
          @media (min-width: 769px) { .acct-cards { display: none !important; } }
        `}</style>

        {/* Desktop table */}
        <div className="acct-table" style={{ overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'130px 100px 80px 100px 100px 80px 70px 36px', gap:8, padding:'0 0 10px', borderBottom:'1px solid #F0F2F5', marginBottom:4 }}>
            {['Firm','Size ($)','Split (%)','Daily gain (%)','Trade days','Monthly','Status',''].map(h => (
              <span key={h} style={{ fontSize:11, letterSpacing:'.05em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:700 }}>{h}</span>
            ))}
          </div>
          {accounts.map(a => {
            const monthly = a.size*a.daily/100*a.split/100*a.days
            return (
              <div key={a.id} style={{ display:'grid', gridTemplateColumns:'130px 100px 80px 100px 100px 80px 70px 36px', gap:8, padding:'8px 0', borderBottom:'1px solid #F5F7FA', alignItems:'center' }}>
                <select value={a.firm} onChange={e=>update(a.id,'firm',e.target.value)} style={inp}>{FIRMS.map(f=><option key={f}>{f}</option>)}</select>
                <input type="number" value={a.size} onChange={e=>update(a.id,'size',Number(e.target.value))} style={inp}/>
                <input type="number" value={a.split} onChange={e=>update(a.id,'split',Number(e.target.value))} style={inp}/>
                <input type="number" value={a.daily} step={0.1} onChange={e=>update(a.id,'daily',parseFloat(e.target.value))} style={inp}/>
                <input type="number" value={a.days} onChange={e=>update(a.id,'days',Number(e.target.value))} style={inp}/>
                <span style={{ fontSize:13, fontWeight:700, color:'#00B386', fontFamily:'SF Mono,monospace' }}>{fmt(monthly)}</span>
                <select value={a.status} onChange={e=>update(a.id,'status',e.target.value)} style={{ ...inp, color:statusColor(a.status), fontWeight:700, fontSize:11 }}>
                  <option>ACTIVE</option><option>PAUSED</option><option>BLOWN</option><option>SCALED</option>
                </select>
                <button onClick={()=>remove(a.id)} style={{ width:28, height:28, borderRadius:7, background:'#FFEBEE', border:'none', color:'#F44336', cursor:'pointer', fontSize:14, fontWeight:700 }}>✕</button>
              </div>
            )
          })}
        </div>

        {/* Mobile cards */}
        <div className="acct-cards" style={{ display:'none', flexDirection:'column', gap:10 }}>
          {accounts.map(a => {
            const monthly = a.size*a.daily/100*a.split/100*a.days
            return (
              <div key={a.id} style={{ background:'#F7F8FA', border:'1px solid #E8EAF0', borderRadius:12, padding:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <select value={a.firm} onChange={e=>update(a.id,'firm',e.target.value)} style={{ ...inp, width:'auto', fontWeight:700, fontSize:14 }}>{FIRMS.map(f=><option key={f}>{f}</option>)}</select>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:'#00B386', fontFamily:'SF Mono,monospace' }}>{fmt(monthly)}<span style={{ fontSize:10, color:'#9EA6C0' }}>/mo</span></span>
                    <button onClick={()=>remove(a.id)} style={{ width:28, height:28, borderRadius:7, background:'#FFEBEE', border:'none', color:'#F44336', cursor:'pointer', fontSize:14, fontWeight:700 }}>✕</button>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Size ($)</label><input type="number" value={a.size} onChange={e=>update(a.id,'size',Number(e.target.value))} style={inp}/></div>
                  <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Split (%)</label><input type="number" value={a.split} onChange={e=>update(a.id,'split',Number(e.target.value))} style={inp}/></div>
                  <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Daily gain (%)</label><input type="number" value={a.daily} step={0.1} onChange={e=>update(a.id,'daily',parseFloat(e.target.value))} style={inp}/></div>
                  <div><label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Trade days</label><input type="number" value={a.days} onChange={e=>update(a.id,'days',Number(e.target.value))} style={inp}/></div>
                </div>
                <div style={{ marginTop:8 }}>
                  <label style={{ fontSize:10, color:'#9EA6C0', fontWeight:600 }}>Status</label>
                  <select value={a.status} onChange={e=>update(a.id,'status',e.target.value)} style={{ ...inp, color:statusColor(a.status), fontWeight:700 }}>
                    <option>ACTIVE</option><option>PAUSED</option><option>BLOWN</option><option>SCALED</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <SectionTitle>Income breakdown</SectionTitle>
          {active.length===0 ? <div style={{ color:'#9EA6C0', fontSize:12 }}>No active accounts yet</div> : active.map(a => {
            const m = a.size*a.daily/100*a.split/100*a.days
            const pct = totalMonthly ? Math.round(m/totalMonthly*100) : 0
            return (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:10, marginBottom:6, background:'#F7F8FA', border:'1px solid #F0F2F5' }}>
                <span style={{ fontSize:13, color:'#5A6078', fontWeight:500 }}>{a.firm} <span style={{ color:'#C4CAD9' }}>({(a.size/1000).toFixed(0)}K)</span></span>
                <span style={{ fontFamily:'SF Mono,monospace', fontWeight:700, color:'#00B386', fontSize:14 }}>{fmt(m)}<span style={{ color:'#C4CAD9', fontSize:11, marginLeft:6 }}>{pct}%</span></span>
              </div>
            )
          })}
        </Card>
        <Card>
          <SectionTitle>Income milestones</SectionTitle>
          <ResultBox>
            {[{label:'Hit $10K/month',target:10000},{label:'Hit $25K/month',target:25000},{label:'Hit $50K/month',target:50000}].map(({label,target}) => {
              const need = Math.max(0,target-totalMonthly)
              return <ResultRow key={label} label={label} value={need===0?'✓ Achieved':fmt(need)+' more/mo'} color={need===0?'#00B386':undefined}/>
            })}
            <ResultRow label="Annual projection" value={fmt(totalMonthly*12)} color="#00B386"/>
          </ResultBox>
          {totalMonthly>=50000 && <Alert type="success">Projecting $50K+/month. Stay consistent!</Alert>}
          {totalMonthly>0 && totalMonthly<10000 && <Alert type="info">Add more accounts to reach $10K/month faster.</Alert>}
        </Card>
      </div>
    </div>
  )
}
