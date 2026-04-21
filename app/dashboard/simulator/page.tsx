'use client'
import { useState, useRef, useEffect } from 'react'
import { Card, SectionTitle, MetricCard, ResultRow, Alert, PageHeader, SliderRow, ResultBox, Btn } from '@/components/ui'

const PRESETS={ftmo:{label:'FTMO',pt:10,mdd:5,tdd:10,days:30},topstep:{label:'Topstep',pt:6,mdd:4,tdd:8,days:30},the5:{label:'The5%ers',pt:6,mdd:4,tdd:8,days:60},custom:{label:'Custom',pt:10,mdd:5,tdd:10,days:30}}
const fmt=(n:number)=>'$'+Math.abs(Math.round(n)).toLocaleString()

interface SimResult{passRate:number;passed:number;fDDD:number;fTDD:number;fTime:number;avgPnl:number;ddBreachRate:number;best:number;worst:number;med:number;p95:number;p5:number;nsims:number;passPaths:number[][];failPaths:number[][]}

export default function SimulatorPage() {
  const [preset,setPreset]=useState('ftmo')
  const [acc,setAcc]=useState(100000); const [pt,setPt]=useState(10); const [mdd,setMdd]=useState(5)
  const [tdd,setTdd]=useState(10); const [days,setDays]=useState(30); const [wr,setWr]=useState(55)
  const [rr,setRr]=useState(2); const [rpt,setRpt]=useState(0.5); const [tpd,setTpd]=useState(2); const [nsims,setNsims]=useState(500)
  const [running,setRunning]=useState(false); const [result,setResult]=useState<SimResult|null>(null)
  const canvasRef=useRef<HTMLCanvasElement>(null)

  const loadPreset=(key:string)=>{const p=PRESETS[key as keyof typeof PRESETS];setPreset(key);setPt(p.pt);setMdd(p.mdd);setTdd(p.tdd);setDays(p.days)}

  const runSim=()=>{
    setRunning(true)
    setTimeout(()=>{
      const target=acc*pt/100,mddAmt=acc*mdd/100,tddAmt=acc*tdd/100
      const effDays=Math.min(days,60),wrFrac=wr/100
      let passed=0,fDDD=0,fTDD=0,fTime=0
      const allPnl:number[]=[],passPaths:number[][]=[],failPaths:number[][]=[]
      for(let s=0;s<nsims;s++){
        let pnl=0,outcome='time';const path=[0]
        outer:for(let d=0;d<effDays;d++){
          let dayPnl=0
          for(let t=0;t<tpd;t++){
            const risk=(acc+pnl)*rpt/100
            const tradePnl=Math.random()<wrFrac?risk*rr:-risk
            pnl+=tradePnl; dayPnl+=tradePnl
            if(pnl>=target){outcome='pass';break outer}
            if(dayPnl<=-mddAmt){outcome='f_ddd';break outer}
            if(pnl<=-tddAmt){outcome='f_tdd';break outer}
          }
          path.push(Math.round(pnl))
        }
        allPnl.push(pnl)
        if(outcome==='pass'){passed++;if(passPaths.length<8)passPaths.push(path)}
        else{if(outcome==='f_ddd')fDDD++;else if(outcome==='f_tdd')fTDD++;else fTime++;if(failPaths.length<8)failPaths.push(path)}
      }
      allPnl.sort((a,b)=>a-b)
      setResult({passRate:Math.round(passed/nsims*100),passed,fDDD,fTDD,fTime,avgPnl:allPnl.reduce((s,v)=>s+v,0)/nsims,ddBreachRate:Math.round((fDDD+fTDD)/nsims*100),best:allPnl[allPnl.length-1],worst:allPnl[0],med:allPnl[Math.floor(nsims/2)],p95:allPnl[Math.floor(nsims*0.95)],p5:allPnl[Math.floor(nsims*0.05)],nsims,passPaths,failPaths})
      setRunning(false)
    },50)
  }

  useEffect(()=>{
    if(!result||!canvasRef.current)return
    const canvas=canvasRef.current; const ctx=canvas.getContext('2d'); if(!ctx)return
    const dpr=window.devicePixelRatio||1; const W=canvas.offsetWidth,H=canvas.offsetHeight
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H)
    const target=acc*pt/100,tddAmt=acc*tdd/100
    const allPaths=[...result.failPaths,...result.passPaths]
    const allVals=allPaths.flat()
    const minV=Math.min(...allVals,-tddAmt)*1.1,maxV=Math.max(...allVals,target)*1.15
    const pad={top:20,bottom:20,left:10,right:10}
    const toX=(i:number,len:number)=>pad.left+(i/(len-1))*(W-pad.left-pad.right)
    const toY=(v:number)=>H-pad.bottom-((v-minV)/(maxV-minV))*(H-pad.top-pad.bottom)
    ctx.strokeStyle='rgba(240,242,245,0.8)'; ctx.lineWidth=0.5
    for(let i=0;i<=4;i++){const y=pad.top+(i/4)*(H-pad.top-pad.bottom); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke()}
    // target & floor
    ctx.strokeStyle='rgba(0,179,134,0.3)'; ctx.lineWidth=1; ctx.setLineDash([5,5])
    ctx.beginPath(); ctx.moveTo(0,toY(target)); ctx.lineTo(W,toY(target)); ctx.stroke()
    ctx.strokeStyle='rgba(244,67,54,0.3)'
    ctx.beginPath(); ctx.moveTo(0,toY(-tddAmt)); ctx.lineTo(W,toY(-tddAmt)); ctx.stroke()
    ctx.setLineDash([])
    result.failPaths.forEach(p=>{ctx.strokeStyle='rgba(244,67,54,0.3)'; ctx.lineWidth=1; ctx.beginPath(); p.forEach((v,i)=>{const x=toX(i,p.length),y=toY(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}); ctx.stroke()})
    result.passPaths.forEach(p=>{ctx.strokeStyle='rgba(0,179,134,0.5)'; ctx.lineWidth=1.5; ctx.beginPath(); p.forEach((v,i)=>{const x=toX(i,p.length),y=toY(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}); ctx.stroke()})
  },[result,acc,pt,tdd])

  const riskAmt=acc*rpt/100,winAmt=riskAmt*rr
  const exp=(wr/100)*winAmt-(1-wr/100)*riskAmt
  const edpnl=exp*tpd
  const dtt=edpnl>0?Math.ceil(acc*pt/100/edpnl):-1
  const be=Math.round(100/(1+rr))

  const verdictColor=result?(result.passRate>=70?'#00B386':result.passRate>=40?'#FF9800':'#F44336'):'#9EA6C0'
  const verdictBg=result?(result.passRate>=70?'#E8FBF5':result.passRate>=40?'#FFF3E0':'#FFEBEE'):'#F7F8FA'

  return (
    <div>
      <PageHeader title="Challenge simulator" subtitle="Run Monte Carlo simulations to find your pass probability before buying a real challenge."/>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16,alignItems:'start'}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card>
            <SectionTitle>Firm preset</SectionTitle>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {Object.entries(PRESETS).map(([k,p])=>(
                <button key={k} onClick={()=>loadPreset(k)} style={{padding:'5px 12px',fontSize:11,borderRadius:20,cursor:'pointer',fontWeight:600,background:preset===k?'#00B386':'#F7F8FA',border:preset===k?'none':'1.5px solid #E8EAF0',color:preset===k?'#fff':'#5A6078',transition:'all .15s'}}>{p.label}</button>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Challenge rules</SectionTitle>
            <SliderRow label="Profit target (%)" min={4} max={20} step={0.5} value={pt} onChange={setPt} display={pt+'%'}/>
            <SliderRow label="Max daily DD (%)" min={1} max={10} step={0.5} value={mdd} onChange={setMdd} display={mdd+'%'}/>
            <SliderRow label="Max total DD (%)" min={2} max={20} step={0.5} value={tdd} onChange={setTdd} display={tdd+'%'}/>
            <SliderRow label="Trading days" min={10} max={60} value={days} onChange={setDays} display={days.toString()}/>
          </Card>
          <Card>
            <SectionTitle>Your strategy</SectionTitle>
            <SliderRow label="Win rate (%)" min={20} max={80} value={wr} onChange={setWr} display={wr+'%'}/>
            <SliderRow label="Risk/reward" min={0.5} max={5} step={0.1} value={rr} onChange={setRr} display={'1:'+rr.toFixed(1)}/>
            <SliderRow label="Risk per trade (%)" min={0.1} max={3} step={0.1} value={rpt} onChange={setRpt} display={rpt.toFixed(1)+'%'}/>
            <SliderRow label="Trades per day" min={1} max={10} value={tpd} onChange={setTpd} display={tpd.toString()}/>
            <SliderRow label="Simulations" min={100} max={2000} step={100} value={nsims} onChange={setNsims} display={nsims.toString()}/>
            <button onClick={runSim} style={{width:'100%',padding:'11px',fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#00B386,#00C896)',border:'none',borderRadius:10,color:'#fff',cursor:'pointer',fontFamily:"'Nunito Sans',sans-serif",boxShadow:'0 4px 12px rgba(0,179,134,0.3)',marginTop:4}}>
              {running?'Running…':'Run simulation'}
            </button>
          </Card>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card>
            <SectionTitle>Pre-simulation estimates</SectionTitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <MetricCard label="Expectancy" value={(exp/riskAmt>=0?'+':'')+(exp/riskAmt).toFixed(3)} color={exp>=0?'#00B386':'#F44336'} sub="per $1 risked"/>
              <MetricCard label="Expected daily P&L" value={(edpnl>=0?'+':'')+fmt(edpnl)} color={edpnl>=0?'#00B386':'#F44336'}/>
            </div>
            <ResultBox>
              <ResultRow label="Breakeven win rate" value={be+'% (yours: '+wr+'%)'} color={wr>be?'#00B386':'#F44336'}/>
              <ResultRow label="Days to hit target" value={dtt>0?dtt+' days':'Never — negative EV'} color={dtt>0&&dtt<=days?'#00B386':'#F44336'}/>
            </ResultBox>
          </Card>

          {!result?(
            <Card>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:220,color:'#9EA6C0',fontSize:13,border:'2px dashed #E8EAF0',borderRadius:12}}>
                Adjust sliders and click "Run simulation"
              </div>
            </Card>
          ):(
            <>
              <div style={{padding:'14px 18px',borderRadius:14,textAlign:'center',fontSize:14,fontWeight:700,background:verdictBg,color:verdictColor,border:`1.5px solid ${verdictColor}30`}}>
                {result.passRate>=70?`Strategy likely passes — ${result.passRate}% pass rate. Ready to buy the challenge.`:result.passRate>=40?`Marginal — ${result.passRate}% pass rate. Tweak your numbers first.`:`Strategy likely fails — ${result.passRate}% pass rate. Significant adjustments needed.`}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                <MetricCard label="Pass rate" value={result.passRate+'%'} color={verdictColor} trend={result.passRate>=70?'up':result.passRate>=40?'neutral':'down'}/>
                <MetricCard label="Avg P&L" value={(result.avgPnl>=0?'+':'')+fmt(result.avgPnl)} color={result.avgPnl>=0?'#00B386':'#F44336'}/>
                <MetricCard label="DD breach" value={result.ddBreachRate+'%'} color={result.ddBreachRate<20?'#00B386':'#F44336'}/>
                <MetricCard label="Simulations" value={result.nsims.toString()} color="#7C4DFF"/>
              </div>

              <Card>
                <div style={{display:'flex',gap:16,fontSize:11,color:'#9EA6C0',marginBottom:8,fontWeight:600}}>
                  <span><span style={{display:'inline-block',width:12,height:3,background:'#00B386',marginRight:4,verticalAlign:'middle',borderRadius:2}}></span>Pass path</span>
                  <span><span style={{display:'inline-block',width:12,height:3,background:'#F44336',marginRight:4,verticalAlign:'middle',borderRadius:2}}></span>Fail path</span>
                  <span style={{marginLeft:'auto',color:'#C4CAD9'}}>Green dashes = target · Red dashes = DD floor</span>
                </div>
                <div style={{position:'relative',width:'100%',height:220,background:'#F7F8FA',borderRadius:10,overflow:'hidden'}}>
                  <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block'}}/>
                </div>
              </Card>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Card>
                  <SectionTitle>Outcome breakdown</SectionTitle>
                  <ResultBox>
                    <ResultRow label="Passed challenge" value={result.passed+' runs'} color="#00B386"/>
                    <ResultRow label="Failed — daily DD" value={result.fDDD+' runs'} color="#F44336"/>
                    <ResultRow label="Failed — total DD" value={result.fTDD+' runs'} color="#F44336"/>
                    <ResultRow label="Failed — time" value={result.fTime+' runs'} color="#FF9800"/>
                    <ResultRow label="Best result" value={'+'+fmt(result.best)} color="#00B386"/>
                    <ResultRow label="Worst result" value={fmt(result.worst)} color="#F44336"/>
                  </ResultBox>
                </Card>
                <Card>
                  <SectionTitle>P&L distribution</SectionTitle>
                  <ResultBox>
                    <ResultRow label="Median P&L" value={(result.med>=0?'+':'')+fmt(result.med)} color={result.med>=0?'#00B386':'#F44336'}/>
                    <ResultRow label="95th percentile" value={'+'+fmt(result.p95)} color="#00B386"/>
                    <ResultRow label="5th percentile" value={(result.p5>=0?'+':'')+fmt(result.p5)} color={result.p5>=0?'#00B386':'#F44336'}/>
                  </ResultBox>
                  {result.fDDD>result.fTDD&&<Alert type="warn">Most failures are daily DD breaches — reduce risk per trade.</Alert>}
                  {result.fTime>result.fDDD+result.fTDD&&<Alert type="info">Most failures are time expiry — increase trade frequency slightly.</Alert>}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
