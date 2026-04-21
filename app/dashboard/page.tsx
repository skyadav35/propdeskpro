'use client'
import { useEffect, useRef, useState } from 'react'

interface Trade { pnl:number; date:string; instrument:string; result:string }

function EquityCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState({ totalPnl:0, winRate:0, bestTrade:0, totalTrades:0 })
  const [prog, setProg] = useState(0)
  const animRef = useRef<number>()

  useEffect(() => {
    fetch('/api/trades').then(r=>r.json()).then(d => {
      const t = d.trades||[]
      setTrades(t)
      const wins = t.filter((x:Trade)=>x.result==='WIN')
      const totalPnl = t.reduce((s:number,x:Trade)=>s+Number(x.pnl),0)
      setStats({ totalPnl, winRate:t.length?Math.round(wins.length/t.length*100):0, bestTrade:t.length?Math.max(...t.map((x:Trade)=>Number(x.pnl))):0, totalTrades:t.length })
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    if(!trades.length){setProg(1);return}
    let start:number|null=null
    const anim=(ts:number)=>{
      if(!start)start=ts
      const p=Math.min((ts-start)/1600,1)
      setProg(1-Math.pow(1-p,3))
      if(p<1)animRef.current=requestAnimationFrame(anim)
    }
    animRef.current=requestAnimationFrame(anim)
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[trades])

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return
    const ctx=canvas.getContext('2d'); if(!ctx)return
    const dpr=window.devicePixelRatio||1
    const W=canvas.offsetWidth,H=canvas.offsetHeight
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr)
    ctx.clearRect(0,0,W,H)
    const sorted=[...trades].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime())
    const pts:number[]=[0]; let r=0
    sorted.forEach(t=>{r+=Number(t.pnl);pts.push(r)})
    if(pts.length<2){
      ctx.strokeStyle='rgba(0,179,134,0.15)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(40,H/2); ctx.lineTo(W-20,H/2); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle='#9EA6C0'; ctx.font='12px Nunito Sans,sans-serif'; ctx.textAlign='center'
      ctx.fillText('Log your first trade to see equity curve',W/2,H/2+14); return
    }
    const vis=pts.slice(0,Math.max(2,Math.floor(pts.length*prog)))
    const minV=Math.min(...vis),maxV=Math.max(...vis),range=maxV-minV||1
    const pad={top:24,bottom:20,left:56,right:12}
    const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom
    const toX=(i:number)=>pad.left+(i/(pts.length-1))*cW
    const toY=(v:number)=>pad.top+cH-((v-minV)/range)*cH

    // Grid
    ctx.strokeStyle='rgba(240,242,245,1)'; ctx.lineWidth=1
    for(let i=0;i<=4;i++){const y=pad.top+(i/4)*cH; ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke()}
    // Y labels
    ctx.fillStyle='#9EA6C0'; ctx.font='10px SF Mono,monospace'; ctx.textAlign='right'
    for(let i=0;i<=4;i++){const v=minV+(range*(4-i))/4; ctx.fillText((v>=0?'+':'')+' $'+Math.round(v).toLocaleString(),pad.left-8,pad.top+(i/4)*cH+3)}
    // Zero line
    const zY=toY(0)
    if(zY>=pad.top&&zY<=H-pad.bottom){ctx.strokeStyle='rgba(0,179,134,0.2)'; ctx.setLineDash([4,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad.left,zY); ctx.lineTo(W-pad.right,zY); ctx.stroke(); ctx.setLineDash([])}
    const isPos=vis[vis.length-1]>=0
    const lineColor=isPos?'#00B386':'#F44336'
    // Gradient
    const grad=ctx.createLinearGradient(0,pad.top,0,H-pad.bottom)
    if(isPos){grad.addColorStop(0,'rgba(0,179,134,0.15)');grad.addColorStop(1,'rgba(0,179,134,0)')}
    else{grad.addColorStop(0,'rgba(244,67,54,0)');grad.addColorStop(1,'rgba(244,67,54,0.12)')}
    ctx.beginPath(); ctx.moveTo(toX(0),toY(vis[0]))
    vis.forEach((v,i)=>{if(i>0)ctx.lineTo(toX(i),toY(v))})
    ctx.lineTo(toX(vis.length-1),H-pad.bottom); ctx.lineTo(toX(0),H-pad.bottom)
    ctx.closePath(); ctx.fillStyle=grad; ctx.fill()
    // Line
    ctx.strokeStyle=lineColor; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.lineCap='round'
    ctx.beginPath(); ctx.moveTo(toX(0),toY(vis[0]))
    vis.forEach((v,i)=>{if(i>0)ctx.lineTo(toX(i),toY(v))}); ctx.stroke()
    // Dots
    vis.forEach((v,i)=>{
      if(i===0)return; const t=sorted[i-1]
      const c=t?.result==='WIN'?'#00B386':t?.result==='LOSS'?'#F44336':'#FF9800'
      ctx.beginPath(); ctx.arc(toX(i),toY(v),3.5,0,Math.PI*2)
      ctx.fillStyle=c; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke()
    })
    // End dot
    if(vis.length>1){
      const lx=toX(vis.length-1),ly=toY(vis[vis.length-1])
      ctx.beginPath(); ctx.arc(lx,ly,10,0,Math.PI*2); ctx.fillStyle=`${lineColor}18`; ctx.fill()
      ctx.beginPath(); ctx.arc(lx,ly,5,0,Math.PI*2); ctx.fillStyle=lineColor; ctx.fill()
      ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke()
    }
  },[trades,prog])

  const fmt=(n:number)=>(n>=0?'+':'')+' $'+Math.abs(Math.round(n)).toLocaleString()
  const pnlColor=stats.totalPnl>=0?'#00B386':'#F44336'
  const pnlBg=stats.totalPnl>=0?'#E8FBF5':'#FFEBEE'

  return (
    <div style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
        <div>
          <div style={{ fontSize:12, color:'#9EA6C0', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:6 }}>Total P&L — equity curve</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:32, fontWeight:800, color:pnlColor, fontFamily:"'Nunito',sans-serif", lineHeight:1 }}>{fmt(stats.totalPnl)}</div>
            <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:pnlBg, color:pnlColor, fontWeight:700 }}>
              {stats.winRate}% win rate
            </span>
          </div>
          <div style={{ fontSize:12, color:'#9EA6C0', marginTop:5, fontWeight:500 }}>{stats.totalTrades} trades logged</div>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {[{label:'Best trade',val:'+$'+Math.round(stats.bestTrade).toLocaleString(),color:'#00B386'},{label:'Trades',val:stats.totalTrades.toString(),color:'#7C4DFF'}].map(s=>(
            <div key={s.label} style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#9EA6C0', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:'relative', width:'100%', height:200 }}>
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      </div>
      <div style={{ display:'flex', gap:16, marginTop:10, fontSize:11, color:'#9EA6C0', fontWeight:500 }}>
        {[['#00B386','Win'],['#F44336','Loss'],['#FF9800','Break even']].map(([c,l])=>(
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block' }}></span>{l}
          </span>
        ))}
        <span style={{ marginLeft:'auto' }}>Each dot = one trade</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const quickLinks = [
    { label:'Challenge Tracker', href:'/dashboard/challenge', color:'#7C4DFF', bg:'#EDE7F6', desc:'Track evaluation progress' },
    { label:'Risk Manager',      href:'/dashboard/risk',      color:'#FF9800', bg:'#FFF3E0', desc:'Position size calculator' },
    { label:'Trade Journal',     href:'/dashboard/journal',   color:'#00B386', bg:'#E8FBF5', desc:'Log and review trades' },
    { label:'Simulator',         href:'/dashboard/simulator', color:'#2196F3', bg:'#E3F2FD', desc:'Test before challenge' },
    { label:'Multi-Account',     href:'/dashboard/stacker',   color:'#F44336', bg:'#FFEBEE', desc:'Track funded accounts' },
  ]

  return (
    <div style={{ animation:'fadeIn .3s ease' }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#1A1D2E', marginBottom:4, letterSpacing:'-.02em', fontFamily:"'Nunito',sans-serif" }}>Overview</h1>
        <p style={{ fontSize:13, color:'#9EA6C0', fontWeight:500 }}>Your prop firm trading command center</p>
      </div>

      {/* Equity curve */}
      <div style={{ marginBottom:16 }}><EquityCurve /></div>

      {/* Quick links + CTA */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:11, letterSpacing:'.07em', textTransform:'uppercase', color:'#9EA6C0', marginBottom:14, fontWeight:600 }}>Quick access</div>
          {quickLinks.map(item => (
            <a key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, textDecoration:'none', marginBottom:2, transition:'background .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#F7F8FA')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ width:36, height:36, borderRadius:10, background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {item.label==='Challenge Tracker'?'◎':item.label==='Risk Manager'?'◈':item.label==='Trade Journal'?'◧':item.label==='Simulator'?'◬':'◫'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.label}</div>
                <div style={{ fontSize:11, color:'#9EA6C0', fontWeight:500 }}>{item.desc}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'#C4CAD9', fontSize:16 }}>›</span>
            </a>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:16, padding:'22px 24px', flex:1, boxShadow:'0 6px 20px rgba(0,179,134,0.3)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>Ready to get funded?</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginBottom:18, lineHeight:1.6 }}>Run the Monte Carlo simulator before spending $500 on a real challenge.</div>
            <a href='/dashboard/simulator' style={{ display:'inline-block', padding:'9px 20px', background:'rgba(255,255,255,0.2)', borderRadius:10, fontSize:13, fontWeight:700, color:'#fff', textDecoration:'none', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)' }}>
              Run simulator →
            </a>
          </div>
          <div style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A1D2E', marginBottom:4, fontFamily:"'Nunito',sans-serif" }}>Log your trades daily</div>
                <div style={{ fontSize:12, color:'#9EA6C0', fontWeight:500 }}>Equity curve updates with every trade.</div>
              </div>
              <a href='/dashboard/journal' style={{ padding:'8px 16px', background:'#E8FBF5', borderRadius:10, fontSize:12, fontWeight:700, color:'#007A5C', textDecoration:'none', whiteSpace:'nowrap', border:'1px solid #B3EAD9' }}>
                Open journal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
