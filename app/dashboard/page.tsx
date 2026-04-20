'use client'
export default function DashboardPage() {
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#e8edf8',marginBottom:4,letterSpacing:'-.02em'}}>Welcome back</h1>
        <p style={{fontSize:13,color:'#8892b0'}}>Your prop firm trading command center.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[
          {label:'Challenge status',val:'Ready',color:'#818cf8'},
          {label:'Funded accounts',val:'0',color:'#e8edf8'},
          {label:'Total P&L',val:'0',color:'#4ade80'},
          {label:'Win rate',val:'',color:'#e8edf8'},
        ].map(s=>(
          <div key={s.label} style={{background:'#111520',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:10,letterSpacing:'.08em',textTransform:'uppercase',color:'#4a5580',marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:'DM Mono,monospace'}}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:'#0d1018',border:'1px solid #1e2538',borderRadius:14,padding:'18px 20px'}}>
          <div style={{fontSize:10,letterSpacing:'.08em',textTransform:'uppercase',color:'#4a5580',marginBottom:12,paddingBottom:8,borderBottom:'1px solid #1e2538'}}>Quick access</div>
          {[
            {label:'Challenge Tracker',href:'/dashboard/challenge',color:'#818cf8'},
            {label:'Risk Manager',href:'/dashboard/risk',color:'#fbbf24'},
            {label:'Trade Journal',href:'/dashboard/journal',color:'#4ade80'},
            {label:'Simulator',href:'/dashboard/simulator',color:'#f472b6'},
            {label:'Multi-Account',href:'/dashboard/stacker',color:'#38bdf8'},
          ].map(item=>(
            <a key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:9,textDecoration:'none'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:item.color,display:'inline-block'}}></span>
              <span style={{fontSize:13,fontWeight:600,color:item.color}}>{item.label}</span>
            </a>
          ))}
        </div>
        <div style={{background:'linear-gradient(135deg,rgba(91,106,240,.15),rgba(91,106,240,.05))',border:'1px solid rgba(91,106,240,.3)',borderRadius:14,padding:'20px 24px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#e8edf8',marginBottom:8}}>Ready to get funded?</div>
          <div style={{fontSize:12,color:'#8892b0',marginBottom:16}}>Test your strategy before spending money on a challenge.</div>
          <a href='/dashboard/simulator' style={{padding:'10px 20px',background:'#5b6af0',borderRadius:9,fontSize:13,fontWeight:600,color:'#fff',textDecoration:'none',textAlign:'center'}}>Run simulator </a>
        </div>
      </div>
    </div>
  )
}
