'use client'
import { useEffect, useState } from 'react'
import { Card, PageHeader, Alert } from '@/components/ui'

interface Session {
  name: string; open: number; close: number; tz: string
  pairs: string[]; color: string; bg: string; flag: string
}

const SESSIONS: Session[] = [
  { name:'Sydney',   open:22, close:7,  tz:'AEST', pairs:['AUD/USD','AUD/JPY','NZD/USD'], color:'#7C4DFF', bg:'#EDE7F6', flag:'🇦🇺' },
  { name:'Tokyo',    open:0,  close:9,  tz:'JST',  pairs:['USD/JPY','EUR/JPY','GBP/JPY'], color:'#F44336', bg:'#FFEBEE', flag:'🇯🇵' },
  { name:'London',   open:8,  close:17, tz:'GMT',  pairs:['EUR/USD','GBP/USD','EUR/GBP'], color:'#2196F3', bg:'#E3F2FD', flag:'🇬🇧' },
  { name:'New York', open:13, close:22, tz:'EST',  pairs:['EUR/USD','GBP/USD','USD/CAD'], color:'#00B386', bg:'#E8FBF5', flag:'🇺🇸' },
]

const OVERLAPS = [
  { name:'Tokyo–London overlap',   open:8,  close:9,  desc:'Lower liquidity, EUR/JPY, GBP/JPY active', color:'#7C4DFF' },
  { name:'London–New York overlap',open:13, close:17, desc:'Highest liquidity of the day. Best time for EUR/USD, GBP/USD', color:'#00B386' },
]

function pad(n: number) { return String(n).padStart(2,'0') }

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  return `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`
}

export default function SessionClockPage() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id) }, [])

  const utcHour = now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600

  const isActive = (s: Session) => {
    if (s.open < s.close) return utcHour >= s.open && utcHour < s.close
    return utcHour >= s.open || utcHour < s.close
  }

  const getProgress = (s: Session) => {
    if (!isActive(s)) return 0
    const dur = s.open < s.close ? s.close - s.open : 24 - s.open + s.close
    const elapsed = s.open < s.close ? utcHour - s.open : utcHour >= s.open ? utcHour - s.open : 24 - s.open + utcHour
    return Math.min(100, Math.max(0, (elapsed/dur)*100))
  }

  const getCountdown = (s: Session, active: boolean) => {
    const target = active ? s.close : s.open
    let diff = target - utcHour
    if (diff < 0) diff += 24
    return formatCountdown(diff * 3600 * 1000)
  }

  const getLocalTime = (utcOffset: number) => {
    const d = new Date(now.getTime() + utcOffset * 3600 * 1000)
    return d.toISOString().slice(11,19)
  }

  const tzOffsets: Record<string,number> = { AEST:10, JST:9, GMT:0, EST:-4 }

  const activeSessions = SESSIONS.filter(s => isActive(s))
  const isOverlap = activeSessions.length > 1

  return (
    <div>
      <PageHeader title="Session clock" subtitle="Know exactly when each market is open. Trade in the right session for your pairs."/>

      {/* Current time banner */}
      <div style={{background:'linear-gradient(135deg,#00B386,#00C896)',borderRadius:16,padding:'20px 24px',marginBottom:20,boxShadow:'0 6px 20px rgba(0,179,134,0.3)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:4,letterSpacing:'.04em',textTransform:'uppercase'}}>Current UTC time</div>
          <div style={{fontSize:36,fontWeight:800,color:'#fff',fontFamily:'SF Mono,monospace',letterSpacing:'-.02em'}}>
            {pad(now.getUTCHours())}:{pad(now.getUTCMinutes())}:{pad(now.getUTCSeconds())}
          </div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4}}>
            {now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:600,marginBottom:6,letterSpacing:'.04em',textTransform:'uppercase'}}>
            {activeSessions.length===0?'All sessions closed':isOverlap?'🔥 Overlap — highest liquidity':'Active session'}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
            {activeSessions.length===0?(
              <span style={{fontSize:14,color:'rgba(255,255,255,0.8)'}}>Markets are quiet</span>
            ):activeSessions.map(s=>(
              <span key={s.name} style={{fontSize:13,padding:'4px 12px',borderRadius:20,background:'rgba(255,255,255,0.2)',color:'#fff',fontWeight:700}}>
                {s.flag} {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Session cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,marginBottom:20}}>
        {SESSIONS.map(s=>{
          const active=isActive(s); const prog=getProgress(s); const cd=getCountdown(s,active)
          return (
            <Card key={s.name} style={{border:`2px solid ${active?s.color:'#E8EAF0'}`,transition:'all .3s',boxShadow:active?`0 4px 16px ${s.color}20`:'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{s.flag}</div>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,color:'#1A1D2E',fontFamily:"'Nunito',sans-serif"}}>{s.name}</div>
                    <div style={{fontSize:11,color:'#9EA6C0',fontWeight:500}}>{s.tz} · UTC {s.open<s.close?`${pad(s.open)}:00–${pad(s.close)}:00`:`${pad(s.open)}:00–${pad(s.close)}:00 (+1)`}</div>
                  </div>
                </div>
                <span style={{fontSize:11,padding:'4px 10px',borderRadius:20,fontWeight:700,
                  background:active?s.bg:'#F0F2F5',color:active?s.color:'#9EA6C0',
                  border:`1px solid ${active?s.color+'40':'#E8EAF0'}`}}>
                  {active?'● OPEN':'○ CLOSED'}
                </span>
              </div>

              {/* Local time */}
              <div style={{fontSize:28,fontWeight:800,color:active?s.color:'#C4CAD9',fontFamily:'SF Mono,monospace',marginBottom:12,letterSpacing:'-.01em'}}>
                {getLocalTime(tzOffsets[s.tz])}
              </div>

              {/* Progress bar */}
              {active&&(
                <div style={{marginBottom:12}}>
                  <div style={{height:6,background:'#F0F2F5',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${prog}%`,background:s.color,borderRadius:3,transition:'width 1s linear'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#9EA6C0',marginTop:4,fontWeight:500}}>
                    <span>{Math.round(prog)}% through session</span>
                    <span>Closes in {cd}</span>
                  </div>
                </div>
              )}

              {!active&&(
                <div style={{fontSize:12,color:'#9EA6C0',fontWeight:500,marginBottom:12}}>
                  Opens in <span style={{fontWeight:800,color:s.color,fontFamily:'SF Mono,monospace'}}>{cd}</span>
                </div>
              )}

              {/* Best pairs */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {s.pairs.map(p=>(
                  <span key={p} style={{fontSize:11,padding:'3px 8px',borderRadius:7,background:active?s.bg:'#F7F8FA',color:active?s.color:'#9EA6C0',fontWeight:700,border:`1px solid ${active?s.color+'30':'#E8EAF0'}`}}>{p}</span>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Overlaps */}
      <Card>
        <div style={{fontSize:11,letterSpacing:'.07em',textTransform:'uppercase',color:'#9EA6C0',marginBottom:14,fontWeight:700}}>Session overlaps</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {OVERLAPS.map(o=>{
            const active=utcHour>=o.open&&utcHour<o.close
            return (
              <div key={o.name} style={{padding:'14px 16px',borderRadius:12,background:active?'#E8FBF5':'#F7F8FA',border:`1.5px solid ${active?'#B3EAD9':'#E8EAF0'}`,transition:'all .3s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:'#1A1D2E',fontFamily:"'Nunito',sans-serif"}}>{o.name}</span>
                  {active&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'#00B386',color:'#fff',fontWeight:700}}>ACTIVE NOW</span>}
                </div>
                <div style={{fontSize:12,color:'#5A6078',fontWeight:600,marginBottom:4}}>UTC {pad(o.open)}:00 – {pad(o.close)}:00</div>
                <div style={{fontSize:11,color:'#9EA6C0',fontWeight:500,lineHeight:1.5}}>{o.desc}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
