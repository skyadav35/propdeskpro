'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, Alert, PageHeader, Field, ResultBox, Btn } from '@/components/ui'

interface Trade {
  id:string; date:string; instrument:string; direction:string;
  session:string; entryPrice:number; exitPrice:number; lotSize:number;
  pnl:number; result:string; setup:string; notes:string
}

function HeatmapCalendar({ trades }: { trades: Trade[] }) {
  const [year,setYear]=useState(new Date().getFullYear())
  const [month,setMonth]=useState(new Date().getMonth())
  const [tooltip,setTooltip]=useState<{day:number;x:number;y:number}|null>(null)

  const dailyMap: Record<string,{pnl:number;trades:number;wins:number}> = {}
  trades.forEach(t=>{
    const key=t.date.split('T')[0]
    if(!dailyMap[key])dailyMap[key]={pnl:0,trades:0,wins:0}
    dailyMap[key].pnl+=Number(t.pnl); dailyMap[key].trades++
    if(t.result==='WIN')dailyMap[key].wins++
  })

  const daysInMonth=new Date(year,month+1,0).getDate()
  const firstDay=new Date(year,month,1).getDay()
  const monthName=new Date(year,month).toLocaleString('en-US',{month:'long',year:'numeric'})
  const allPnls=Object.values(dailyMap).map(d=>d.pnl)
  const maxAbs=Math.max(...allPnls.map(Math.abs),1)

  const getColor=(pnl:number)=>{
    const i=Math.min(Math.abs(pnl)/maxAbs,1)
    if(pnl>0)return `rgba(${Math.round(0+i*20)},${Math.round(150+i*29)},${Math.round(100+i*34)},${0.2+i*0.8})`
    if(pnl<0)return `rgba(${Math.round(200+i*44)},${Math.round(50+i*17)},${Math.round(50+i*4)},${0.2+i*0.8})`
    return 'transparent'
  }

  const prev=()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1)}
  const next=()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1)}
  const prefix=`${year}-${String(month+1).padStart(2,'0')}`
  const monthPnl=Object.entries(dailyMap).filter(([k])=>k.startsWith(prefix)).reduce((s,[,v])=>s+v.pnl,0)
  const monthTrades=Object.entries(dailyMap).filter(([k])=>k.startsWith(prefix)).reduce((s,[,v])=>s+v.trades,0)

  return (
    <Card>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:11,letterSpacing:'.06em',textTransform:'uppercase',color:'#9EA6C0',fontWeight:600,marginBottom:4}}>P&L Calendar</div>
          <div style={{display:'flex',alignItems:'baseline',gap:10}}>
            <span style={{fontSize:22,fontWeight:800,color:monthPnl>=0?'#00B386':'#F44336',fontFamily:"'Nunito',sans-serif"}}>
              {monthPnl>=0?'+':''} ${Math.abs(Math.round(monthPnl)).toLocaleString()}
            </span>
            <span style={{fontSize:12,color:'#9EA6C0',fontWeight:500}}>{monthTrades} trades this month</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={prev} style={{width:30,height:30,borderRadius:8,background:'#F7F8FA',border:'1.5px solid #E8EAF0',color:'#5A6078',cursor:'pointer',fontSize:14,fontWeight:700}}>‹</button>
          <span style={{fontSize:13,fontWeight:700,color:'#1A1D2E',minWidth:140,textAlign:'center',fontFamily:"'Nunito',sans-serif"}}>{monthName}</span>
          <button onClick={next} style={{width:30,height:30,borderRadius:8,background:'#F7F8FA',border:'1.5px solid #E8EAF0',color:'#5A6078',cursor:'pointer',fontSize:14,fontWeight:700}}>›</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:4}}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
          <div key={d} style={{textAlign:'center',fontSize:10,color:'#C4CAD9',letterSpacing:'.04em',fontWeight:600,padding:'2px 0'}}>{d}</div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,position:'relative'}}>
        {Array.from({length:firstDay},(_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const day=i+1
          const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const data=dailyMap[key]
          const isToday=new Date().toISOString().split('T')[0]===key
          const isWeekend=[0,6].includes(new Date(year,month,day).getDay())
          return (
            <div key={day}
              onMouseEnter={e=>setTooltip({day,x:e.clientX,y:e.clientY})}
              onMouseLeave={()=>setTooltip(null)}
              style={{
                aspectRatio:'1',borderRadius:6,cursor:data?'pointer':'default',
                background:data?getColor(data.pnl):isWeekend?'#F7F8FA':'#F0F2F5',
                border:isToday?'2px solid #00B386':'1px solid #E8EAF0',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                transition:'transform .1s',
              }}
              onMouseOver={e=>{if(data)(e.currentTarget as HTMLElement).style.transform='scale(1.15)'}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)'}}
            >
              <span style={{fontSize:10,color:data?'#1A1D2E':isWeekend?'#C4CAD9':'#9EA6C0',fontWeight:isToday?800:500}}>{day}</span>
              {data&&<span style={{fontSize:8,color:data.pnl>=0?'#007A5C':'#C62828',fontFamily:'SF Mono,monospace',fontWeight:700,lineHeight:1}}>
                {data.pnl>=0?'+':''}{Math.round(data.pnl)}
              </span>}
            </div>
          )
        })}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:20,marginTop:14,fontSize:11,color:'#9EA6C0',fontWeight:500}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{display:'flex',gap:2}}>
            {[0.2,0.5,0.8,1].map(i=><div key={i} style={{width:14,height:14,borderRadius:3,background:`rgba(0,${Math.round(150+i*29)},${Math.round(100+i*34)},${0.2+i*0.8})`}}/>)}
          </div>
          <span>Profit</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{display:'flex',gap:2}}>
            {[0.2,0.5,0.8,1].map(i=><div key={i} style={{width:14,height:14,borderRadius:3,background:`rgba(${Math.round(200+i*44)},50,50,${0.2+i*0.8})`}}/>)}
          </div>
          <span>Loss</span>
        </div>
        <span style={{marginLeft:'auto'}}>Hover a day for details</span>
      </div>

      {tooltip&&(()=>{
        const key=`${year}-${String(month+1).padStart(2,'0')}-${String(tooltip.day).padStart(2,'0')}`
        const data=dailyMap[key]; if(!data)return null
        return (
          <div style={{position:'fixed',left:tooltip.x+12,top:tooltip.y-60,background:'#fff',border:'1px solid #E8EAF0',borderRadius:12,padding:'10px 14px',fontSize:12,zIndex:999,pointerEvents:'none',boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>
            <div style={{fontWeight:700,color:'#1A1D2E',marginBottom:4,fontFamily:"'Nunito',sans-serif"}}>
              {new Date(year,month,tooltip.day).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
            </div>
            <div style={{color:data.pnl>=0?'#00B386':'#F44336',fontFamily:'SF Mono,monospace',fontSize:15,fontWeight:800}}>
              {data.pnl>=0?'+':''} ${Math.round(data.pnl).toLocaleString()}
            </div>
            <div style={{color:'#9EA6C0',marginTop:2,fontWeight:500}}>{data.trades} trade{data.trades!==1?'s':''} · {data.wins} win{data.wins!==1?'s':''}</div>
          </div>
        )
      })()}
    </Card>
  )
}

function YearlyHeatmap({ trades }: { trades: Trade[] }) {
  const dailyMap:Record<string,number>={}
  trades.forEach(t=>{const k=t.date.split('T')[0];dailyMap[k]=(dailyMap[k]||0)+Number(t.pnl)})
  const today=new Date(),start=new Date(today); start.setDate(today.getDate()-364)
  const days:[string,number|null][]=[]
  const cur=new Date(start)
  while(cur<=today){const k=cur.toISOString().split('T')[0];days.push([k,dailyMap[k]??null]);cur.setDate(cur.getDate()+1)}
  const allPnls=days.filter(([,v])=>v!==null).map(([,v])=>v as number)
  const maxAbs=Math.max(...allPnls.map(Math.abs),1)
  const startDay=start.getDay()
  const padded=[...Array(startDay).fill(null),...days]
  const weeks:([string,number|null]|null)[][]=[]
  for(let i=0;i<padded.length;i+=7)weeks.push(padded.slice(i,i+7) as any)
  const months:{label:string;col:number}[]=[]
  weeks.forEach((week,wi)=>{week.forEach(day=>{if(day&&day[0]){const d=new Date(day[0]);if(d.getDate()<=7){const label=d.toLocaleString('en-US',{month:'short'});if(!months.length||months[months.length-1].label!==label)months.push({label,col:wi})}}})})
  const getColor=(pnl:number|null)=>{
    if(pnl===null)return '#F7F8FA'; if(pnl===0)return '#F0F2F5'
    const i=Math.min(Math.abs(pnl)/maxAbs,1)
    if(pnl>0)return `rgba(${Math.round(0+i*20)},${Math.round(150+i*29)},${Math.round(100+i*34)},${0.3+i*0.7})`
    return `rgba(${Math.round(200+i*44)},50,50,${0.3+i*0.7})`
  }
  const totalPnl=allPnls.reduce((s,v)=>s+v,0)
  const tradingDays=allPnls.filter(v=>v!==0).length
  return (
    <Card>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:11,letterSpacing:'.06em',textTransform:'uppercase',color:'#9EA6C0',fontWeight:600,marginBottom:4}}>365-day performance</div>
          <div style={{display:'flex',alignItems:'baseline',gap:10}}>
            <span style={{fontSize:20,fontWeight:800,color:totalPnl>=0?'#00B386':'#F44336',fontFamily:"'Nunito',sans-serif"}}>{totalPnl>=0?'+':''} ${Math.abs(Math.round(totalPnl)).toLocaleString()}</span>
            <span style={{fontSize:12,color:'#9EA6C0',fontWeight:500}}>{tradingDays} active days</span>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${weeks.length},1fr)`,marginBottom:4,position:'relative',height:16}}>
        {months.map((m,i)=><div key={i} style={{position:'absolute',left:`${(m.col/weeks.length)*100}%`,fontSize:10,color:'#9EA6C0',fontWeight:600}}>{m.label}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${weeks.length},1fr)`,gap:2}}>
        {weeks.map((week,wi)=>week.map((day,di)=>(
          <div key={`${wi}-${di}`} title={day?`${day[0]}: ${day[1]!==null?(day[1]>=0?'+':'')+' $'+Math.round(day[1]):'No trades'}`:''}
            style={{height:11,borderRadius:2,background:day?getColor(day[1]):'transparent',cursor:day&&day[1]!==null?'pointer':'default'}}/>
        )))}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6,marginTop:10,fontSize:10,color:'#9EA6C0',fontWeight:500}}>
        <span>Less</span>
        {[0.1,0.3,0.6,0.85,1].map(i=><div key={i} style={{width:11,height:11,borderRadius:2,background:`rgba(0,${Math.round(150+i*29)},${Math.round(100+i*34)},${0.3+i*0.7})`}}/>)}
        <span>More profit</span>
      </div>
    </Card>
  )
}

const inputStyle:React.CSSProperties={width:'100%',padding:'9px 12px',fontSize:13,background:'#F7F8FA',border:'1.5px solid #E8EAF0',borderRadius:8,color:'#1A1D2E',outline:'none',fontFamily:"'Nunito Sans',sans-serif",fontWeight:500}

export default function JournalPage() {
  const [trades,setTrades]=useState<Trade[]>([])
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false)
  const [filter,setFilter]=useState('all'); const [view,setView]=useState<'log'|'calendar'|'yearly'>('log')
  const [date,setDate]=useState(new Date().toISOString().split('T')[0])
  const [inst,setInst]=useState('EUR/USD'); const [dir,setDir]=useState('LONG')
  const [sess,setSess]=useState('LONDON'); const [entry,setEntry]=useState('')
  const [exit,setExit]=useState(''); const [lots,setLots]=useState('')
  const [pnl,setPnl]=useState(''); const [result,setResult]=useState('WIN')
  const [setup,setSetup]=useState('Trend Follow'); const [notes,setNotes]=useState('')

  const fetchTrades=useCallback(async()=>{
    setLoading(true)
    try{const r=await fetch('/api/trades');const d=await r.json();setTrades(d.trades||[])}
    catch{const s=localStorage.getItem('pd_trades');if(s)setTrades(JSON.parse(s))}
    setLoading(false)
  },[])
  useEffect(()=>{fetchTrades()},[fetchTrades])

  const saveTrade=async()=>{
    if(!pnl)return; setSaving(true)
    const trade={date,instrument:inst,direction:dir,session:sess,entryPrice:parseFloat(entry)||0,exitPrice:parseFloat(exit)||0,lotSize:parseFloat(lots)||0,pnl:parseFloat(pnl),result,setup,notes}
    try{const r=await fetch('/api/trades',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(trade)});if(r.ok)await fetchTrades()}
    catch{const s=localStorage.getItem('pd_trades');const e=s?JSON.parse(s):[];localStorage.setItem('pd_trades',JSON.stringify([{...trade,id:Date.now().toString()},...e]));setTrades(p=>[{...trade,id:Date.now().toString()} as Trade,...p])}
    setPnl('');setEntry('');setExit('');setLots('');setNotes('');setSaving(false)
  }

  const deleteTrade=async(id:string)=>{
    try{await fetch(`/api/trades/${id}`,{method:'DELETE'})}catch{}
    setTrades(p=>p.filter(t=>t.id!==id))
  }

  const exportCSV=()=>{
    const h='Date,Instrument,Direction,Session,Entry,Exit,Lots,PnL,Result,Setup,Notes\n'
    const r=trades.map(t=>[t.date,t.instrument,t.direction,t.session,t.entryPrice,t.exitPrice,t.lotSize,t.pnl,t.result,t.setup,`"${t.notes}"`].join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([h+r],{type:'text/csv'}));a.download=`trades_${new Date().toISOString().split('T')[0]}.csv`;a.click()
  }

  const wins=trades.filter(t=>t.result==='WIN'),losses=trades.filter(t=>t.result==='LOSS')
  const totalPnl=trades.reduce((s,t)=>s+Number(t.pnl),0)
  const winRate=trades.length?Math.round(wins.length/(wins.length+losses.length||1)*100):0
  const avgWin=wins.length?wins.reduce((s,t)=>s+Number(t.pnl),0)/wins.length:0
  const avgLoss=losses.length?Math.abs(losses.reduce((s,t)=>s+Number(t.pnl),0)/losses.length):0
  const pf=avgLoss?(wins.length*avgWin)/(losses.length*avgLoss):0
  const filtered=filter==='all'?trades:trades.filter(t=>t.result.toLowerCase()===filter)
  const sel:React.CSSProperties={...inputStyle}

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <PageHeader title="Trade journal" subtitle="Log every trade. The pattern in your losses will tell you everything."/>
        <div style={{display:'flex',gap:6,marginTop:4}}>
          {[{key:'log',label:'📝 Log'},{key:'calendar',label:'📅 Calendar'},{key:'yearly',label:'📊 365-day'}].map(v=>(
            <button key={v.key} onClick={()=>setView(v.key as any)} style={{padding:'8px 16px',fontSize:12,fontWeight:700,borderRadius:10,cursor:'pointer',background:view===v.key?'#00B386':'#fff',border:view===v.key?'none':'1.5px solid #E8EAF0',color:view===v.key?'#fff':'#5A6078',boxShadow:view===v.key?'0 4px 12px rgba(0,179,134,0.3)':'none',transition:'all .15s',fontFamily:"'Nunito Sans',sans-serif"}}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Stats row — always visible */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:16}}>
        {[
          {label:'Total P&L',val:(totalPnl>=0?'+':'')+' $'+Math.abs(Math.round(totalPnl)).toLocaleString(),color:totalPnl>=0?'#00B386':'#F44336',trend:(totalPnl>=0?'up':'down') as 'up'|'down'},
          {label:'Win rate',val:winRate+'%',color:winRate>=50?'#00B386':'#F44336',trend:(winRate>=50?'up':'down') as 'up'|'down'},
          {label:'Profit factor',val:pf?pf.toFixed(2):'—',color:pf>=1.5?'#00B386':pf>=1?'#FF9800':'#F44336',trend:'neutral' as 'neutral'},
          {label:'Avg win',val:wins.length?'+$'+Math.round(avgWin).toLocaleString():'—',color:'#00B386',trend:'up' as 'up'},
          {label:'Avg loss',val:losses.length?'$'+Math.round(avgLoss).toLocaleString():'—',color:'#F44336',trend:'down' as 'down'},
          {label:'Total trades',val:trades.length.toString(),color:'#7C4DFF',trend:'neutral' as 'neutral'},
        ].map(s=><MetricCard key={s.label} label={s.label} value={s.val} color={s.color} trend={s.trend}/>)}
      </div>

      {view==='calendar'&&<HeatmapCalendar trades={trades}/>}
      {view==='yearly'&&<YearlyHeatmap trades={trades}/>}

      {view==='log'&&(
        <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:16,alignItems:'start'}}>
          {/* Log form */}
          <Card>
            <SectionTitle>Log trade</SectionTitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="Date"><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inputStyle}/></Field>
              <Field label="Instrument">
                <select value={inst} onChange={e=>setInst(e.target.value)} style={sel}>
                  {['EUR/USD','GBP/USD','USD/JPY','XAU/USD','NAS100','SPX500','BTC/USD','ETH/USD','Other'].map(v=><option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Direction">
                <select value={dir} onChange={e=>setDir(e.target.value)} style={sel}>
                  <option value="LONG">LONG ↑</option><option value="SHORT">SHORT ↓</option>
                </select>
              </Field>
              <Field label="Session">
                <select value={sess} onChange={e=>setSess(e.target.value)} style={sel}>
                  {['LONDON','NEW_YORK','ASIAN','OVERLAP'].map(v=><option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Entry"><input value={entry} onChange={e=>setEntry(e.target.value)} placeholder="1.08540" style={inputStyle}/></Field>
              <Field label="Exit"><input value={exit} onChange={e=>setExit(e.target.value)} placeholder="1.08720" style={inputStyle}/></Field>
              <Field label="Lot size"><input value={lots} onChange={e=>setLots(e.target.value)} placeholder="1.00" style={inputStyle}/></Field>
              <Field label="P&L ($)">
                <input value={pnl} onChange={e=>setPnl(e.target.value)} placeholder="180"
                  style={{...inputStyle,borderColor:pnl&&parseFloat(pnl)>=0?'#B3EAD9':pnl?'#FFCDD2':'#E8EAF0'}}/>
              </Field>
              <Field label="Result">
                <select value={result} onChange={e=>setResult(e.target.value)} style={sel}>
                  <option value="WIN">Win ✓</option><option value="LOSS">Loss ✗</option><option value="BREAKEVEN">Break even</option>
                </select>
              </Field>
              <Field label="Setup">
                <select value={setup} onChange={e=>setSetup(e.target.value)} style={sel}>
                  {['Trend Follow','Breakout','Reversal','Range','News','Other'].map(v=><option key={v}>{v}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Notes / lessons">
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What did you see? What did you learn?" style={{...inputStyle,height:70,resize:'vertical'}}/>
            </Field>
            <button onClick={saveTrade} style={{width:'100%',marginTop:4,padding:'11px',fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#00B386,#00C896)',border:'none',borderRadius:10,color:'#fff',cursor:'pointer',fontFamily:"'Nunito Sans',sans-serif",boxShadow:'0 4px 12px rgba(0,179,134,0.3)'}}>
              {saving?'Saving…':'Log trade'}
            </button>
          </Card>

          {/* Trade list */}
          <Card>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{display:'flex',gap:4}}>
                {['all','win','loss'].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontWeight:600,background:filter===f?'#E8FBF5':'transparent',border:filter===f?'1.5px solid #B3EAD9':'1.5px solid #E8EAF0',color:filter===f?'#007A5C':'#5A6078',transition:'all .15s'}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={exportCSV} style={{padding:'6px 14px',fontSize:12,fontWeight:600,background:'#F7F8FA',border:'1.5px solid #E8EAF0',borderRadius:8,color:'#5A6078',cursor:'pointer'}}>Export CSV</button>
            </div>

            {loading?(
              <div style={{textAlign:'center',padding:'32px 0',color:'#9EA6C0',fontSize:13}}>Loading trades…</div>
            ):filtered.length===0?(
              <div style={{textAlign:'center',padding:'48px 0',color:'#9EA6C0'}}>
                <div style={{fontSize:40,marginBottom:12}}>📋</div>
                <div style={{fontSize:13,fontWeight:500}}>No trades yet. Use the form to log your first trade.</div>
              </div>
            ):(
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr>{['Date','Pair','Dir','P&L','Result','Setup','Notes',''].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:11,letterSpacing:'.05em',textTransform:'uppercase',color:'#9EA6C0',borderBottom:'2px solid #F0F2F5',fontWeight:700}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(t=>(
                      <tr key={t.id} style={{borderBottom:'1px solid #F5F7FA',transition:'background .1s'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='#F7F8FA')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td style={{padding:'11px 12px',color:'#5A6078',fontWeight:500}}>{t.date?.split('T')[0]}</td>
                        <td style={{padding:'11px 12px',fontWeight:700,color:'#1A1D2E'}}>{t.instrument}</td>
                        <td style={{padding:'11px 12px'}}>
                          <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,fontWeight:700,background:t.direction==='LONG'?'#E8FBF5':'#FFEBEE',color:t.direction==='LONG'?'#007A5C':'#C62828'}}>{t.direction}</span>
                        </td>
                        <td style={{padding:'11px 12px',fontFamily:'SF Mono,monospace',fontWeight:800,color:Number(t.pnl)>=0?'#00B386':'#F44336',fontSize:14}}>
                          {Number(t.pnl)>=0?'+':''} ${Math.abs(Math.round(Number(t.pnl))).toLocaleString()}
                        </td>
                        <td style={{padding:'11px 12px'}}>
                          <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,fontWeight:700,background:t.result==='WIN'?'#E8FBF5':t.result==='LOSS'?'#FFEBEE':'#FFF3E0',color:t.result==='WIN'?'#007A5C':t.result==='LOSS'?'#C62828':'#E65100'}}>{t.result}</span>
                        </td>
                        <td style={{padding:'11px 12px',color:'#5A6078',fontWeight:500}}>{t.setup}</td>
                        <td style={{padding:'11px 12px',color:'#9EA6C0',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.notes||'—'}</td>
                        <td style={{padding:'11px 12px'}}>
                          <button onClick={()=>deleteTrade(t.id)} style={{background:'#FFEBEE',border:'none',color:'#F44336',borderRadius:7,cursor:'pointer',padding:'4px 9px',fontSize:12,fontWeight:700}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
