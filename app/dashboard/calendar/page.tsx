'use client'
import { useEffect, useState } from 'react'
import { Card, PageHeader, SectionTitle, Badge, Alert } from '@/components/ui'

interface Event {
  date: string; time: string; currency: string; impact: 'high'|'medium'|'low'
  title: string; forecast: string; previous: string; actual: string
}

const EVENTS: Event[] = [
  { date:'2026-04-23', time:'08:30', currency:'USD', impact:'high',   title:'Initial Jobless Claims',       forecast:'215K', previous:'223K', actual:'' },
  { date:'2026-04-24', time:'08:30', currency:'USD', impact:'high',   title:'Core PCE Price Index m/m',     forecast:'0.3%', previous:'0.4%', actual:'' },
  { date:'2026-04-24', time:'10:00', currency:'USD', impact:'medium', title:'UoM Consumer Sentiment',       forecast:'53.5', previous:'52.2', actual:'' },
  { date:'2026-04-28', time:'09:00', currency:'EUR', impact:'medium', title:'German ifo Business Climate',  forecast:'86.5', previous:'86.7', actual:'' },
  { date:'2026-04-29', time:'08:30', currency:'USD', impact:'high',   title:'CB Consumer Confidence',       forecast:'91.5', previous:'92.9', actual:'' },
  { date:'2026-04-29', time:'10:00', currency:'USD', impact:'medium', title:'JOLTS Job Openings',           forecast:'7.6M', previous:'7.57M',actual:'' },
  { date:'2026-04-30', time:'08:30', currency:'USD', impact:'high',   title:'Advance GDP q/q',              forecast:'0.4%', previous:'2.4%', actual:'' },
  { date:'2026-04-30', time:'08:30', currency:'USD', impact:'high',   title:'ADP Non-Farm Employment',      forecast:'115K', previous:'155K', actual:'' },
  { date:'2026-04-30', time:'10:00', currency:'USD', impact:'medium', title:'Pending Home Sales m/m',       forecast:'-1.0%',previous:'-4.6%',actual:'' },
  { date:'2026-04-30', time:'14:00', currency:'USD', impact:'high',   title:'FOMC Statement + Rate Decision',forecast:'4.25-4.50%',previous:'4.25-4.50%',actual:''},
  { date:'2026-05-02', time:'08:30', currency:'USD', impact:'high',   title:'Non-Farm Payrolls',            forecast:'135K', previous:'228K', actual:'' },
  { date:'2026-05-02', time:'08:30', currency:'USD', impact:'high',   title:'Unemployment Rate',            forecast:'4.2%', previous:'4.2%', actual:'' },
  { date:'2026-05-02', time:'08:30', currency:'USD', impact:'medium', title:'Average Hourly Earnings m/m',  forecast:'0.3%', previous:'0.3%', actual:'' },
  { date:'2026-05-05', time:'04:30', currency:'GBP', impact:'medium', title:'Services PMI',                 forecast:'51.5', previous:'52.5', actual:'' },
  { date:'2026-05-07', time:'07:00', currency:'GBP', impact:'high',   title:'BoE Rate Decision',            forecast:'4.50%',previous:'4.50%',actual:'' },
  { date:'2026-05-13', time:'08:30', currency:'USD', impact:'high',   title:'CPI m/m',                      forecast:'0.3%', previous:'0.2%', actual:'' },
  { date:'2026-05-13', time:'08:30', currency:'USD', impact:'high',   title:'Core CPI m/m',                 forecast:'0.3%', previous:'0.3%', actual:'' },
]

const impactColor = { high:'#F44336', medium:'#FF9800', low:'#00B386' }
const impactBg    = { high:'#FFEBEE', medium:'#FFF3E0', low:'#E8FBF5' }
const currencyBg  = { USD:'#E3F2FD', EUR:'#E8F5E9', GBP:'#F3E5F5', AUD:'#FFF8E1', JPY:'#FBE9E7' }
const currencyColor = { USD:'#1565C0', EUR:'#2E7D32', GBP:'#6A1B9A', AUD:'#F57F17', JPY:'#BF360C' }

export default function EconomicCalendarPage() {
  const [filter, setFilter] = useState<'all'|'high'|'USD'|'EUR'|'GBP'>('all')
  const [expanded, setExpanded] = useState<string|null>(null)
  const today = new Date().toISOString().split('T')[0]

  const filtered = EVENTS.filter(e => {
    if (filter === 'all') return true
    if (filter === 'high') return e.impact === 'high'
    return e.currency === filter
  })

  const grouped = filtered.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {} as Record<string, Event[]>)

  const formatDate = (d: string) => {
    const dt = new Date(d)
    const isToday = d === today
    const isTomorrow = d === new Date(Date.now()+86400000).toISOString().split('T')[0]
    const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
    return { label, isToday, isTomorrow }
  }

  return (
    <div>
      <PageHeader title="Economic calendar" subtitle="High-impact news events that move the market. Avoid trading 30 min before and after."/>

      <Alert type="warn">Always avoid trading 30 minutes before and after high-impact red events — especially during prop firm challenges.</Alert>

      {/* Filters */}
      <div style={{display:'flex',gap:8,margin:'16px 0',flexWrap:'wrap'}}>
        {(['all','high','USD','EUR','GBP'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'7px 16px', fontSize:12, borderRadius:20, cursor:'pointer', fontWeight:700,
            background: filter===f?'#00B386':'#fff',
            border: filter===f?'none':'1.5px solid #E8EAF0',
            color: filter===f?'#fff':'#5A6078',
            boxShadow: filter===f?'0 4px 12px rgba(0,179,134,0.3)':'none',
            transition:'all .15s'
          }}>{f==='all'?'All events':f==='high'?'🔴 High impact only':f}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {Object.entries(grouped).map(([date, events]) => {
          const {label,isToday,isTomorrow}=formatDate(date)
          return (
            <div key={date}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <span style={{fontSize:14,fontWeight:800,color:'#1A1D2E',fontFamily:"'Nunito',sans-serif"}}>{label}</span>
                {isToday && <span style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:'#E8FBF5',color:'#007A5C',fontWeight:700}}>Today</span>}
                {isTomorrow && <span style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:'#E3F2FD',color:'#1565C0',fontWeight:700}}>Tomorrow</span>}
                <span style={{fontSize:11,color:'#9EA6C0',fontWeight:500}}>{events.length} event{events.length!==1?'s':''}</span>
              </div>

              <Card style={{padding:0,overflow:'hidden'}}>
                {events.map((e,i)=>{
                  const key=`${date}-${i}`
                  const isExpanded=expanded===key
                  return (
                    <div key={key}
                      onClick={()=>setExpanded(isExpanded?null:key)}
                      style={{
                        padding:'14px 18px',
                        borderBottom:i<events.length-1?'1px solid #F5F7FA':'none',
                        cursor:'pointer',transition:'background .1s',
                        background:isExpanded?'#F7FBF9':'transparent'
                      }}
                      onMouseEnter={e2=>(e2.currentTarget.style.background='#F7F8FA')}
                      onMouseLeave={e2=>(e2.currentTarget.style.background=isExpanded?'#F7FBF9':'transparent')}
                    >
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        {/* Time */}
                        <div style={{minWidth:50,fontSize:13,fontWeight:700,color:'#5A6078',fontFamily:'SF Mono,monospace'}}>{e.time}</div>

                        {/* Impact dot */}
                        <div style={{width:10,height:10,borderRadius:'50%',background:impactColor[e.impact],flexShrink:0,boxShadow:`0 0 6px ${impactColor[e.impact]}60`}}/>

                        {/* Currency */}
                        <span style={{fontSize:11,padding:'3px 8px',borderRadius:7,fontWeight:800,
                          background:(currencyBg as any)[e.currency]||'#F0F2F5',
                          color:(currencyColor as any)[e.currency]||'#5A6078'}}>
                          {e.currency}
                        </span>

                        {/* Title */}
                        <span style={{flex:1,fontSize:13,fontWeight:600,color:'#1A1D2E'}}>{e.title}</span>

                        {/* Impact badge */}
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700,
                          background:impactBg[e.impact],color:impactColor[e.impact],
                          textTransform:'uppercase',letterSpacing:'.04em'}}>
                          {e.impact}
                        </span>

                        {/* Chevron */}
                        <span style={{color:'#C4CAD9',fontSize:12,transition:'transform .15s',transform:isExpanded?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
                      </div>

                      {isExpanded&&(
                        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #F0F2F5',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                          {[
                            {label:'Forecast',val:e.forecast||'—',color:'#7C4DFF'},
                            {label:'Previous',val:e.previous||'—',color:'#5A6078'},
                            {label:'Actual',val:e.actual||'Pending',color:e.actual?(parseFloat(e.actual)>parseFloat(e.forecast)?'#00B386':'#F44336'):'#9EA6C0'},
                          ].map(s=>(
                            <div key={s.label} style={{background:'#F7F8FA',borderRadius:10,padding:'10px 14px',border:'1px solid #F0F2F5'}}>
                              <div style={{fontSize:10,color:'#9EA6C0',fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:4}}>{s.label}</div>
                              <div style={{fontSize:18,fontWeight:800,color:s.color,fontFamily:"'Nunito',sans-serif"}}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
