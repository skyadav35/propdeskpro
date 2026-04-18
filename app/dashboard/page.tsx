export default function DashboardPage() {
  return (
    <div style={{padding:24}}>
      <h1 style={{fontSize:22,fontWeight:700,color:"#dde2f0",marginBottom:6}}>Overview</h1>
      <p style={{fontSize:13,color:"#7a82a0",marginBottom:24}}>Welcome to PropDesk Pro. Your dashboard is ready.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:600}}>
        {[
          {label:"Challenge Tracker",href:"/dashboard/challenge",color:"#4d9fff",desc:"Track your evaluation progress"},
          {label:"Risk Manager",href:"/dashboard/risk",color:"#f5a623",desc:"Calculate position sizes"},
          {label:"Trade Journal",href:"/dashboard/journal",color:"#3ddc84",desc:"Log and review your trades"},
          {label:"Simulator",href:"/dashboard/simulator",color:"#818cf8",desc:"Test strategy before buying challenge"},
          {label:"Multi-Account",href:"/dashboard/stacker",color:"#3ddc84",desc:"Track all funded accounts"},
        ].map(item=>(
          <a key={item.href} href={item.href} style={{
            display:"block",background:"#13151a",border:"1px solid #2a2e38",
            borderRadius:12,padding:20,textDecoration:"none",transition:"border-color .15s"
          }}>
            <div style={{fontSize:14,fontWeight:600,color:item.color,marginBottom:6}}>{item.label}</div>
            <div style={{fontSize:12,color:"#7a82a0"}}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
