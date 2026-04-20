import { auth } from '@clerk/nextjs/server'

const S = {
  card: { background:'#0d1018', border:'1px solid #1e2538', borderRadius:14, padding:'18px 20px' } as React.CSSProperties,
  mcard: { background:'#111520', borderRadius:10, padding:'14px 16px' } as React.CSSProperties,
  label: { fontSize:10, letterSpacing:'.08em', textTransform:'uppercase' as const, color:'#4a5580', marginBottom:6 },
  val: { fontSize:24, fontWeight:700, color:'#e8edf8', fontFamily:"'DM Mono',monospace" },
  sub: { fontSize:11, color:'#8892b0', marginTop:3 },
  secTitle: { fontSize:10, letterSpacing:'.08em', textTransform:'uppercase' as const, color:'#4a5580', marginBottom:12, paddingBottom:8, borderBottom:'1px solid #1e2538' },
}

export default function DashboardPage() {
  return (
    <div style={{ animation:'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#e8edf8', marginBottom:4, letterSpacing:'-.02em' }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize:13, color:'#8892b0' }}>
          Your prop firm trading command center — all tools in one place.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Challenge status', val:'Ready', sub:'No active challenge', color:'#818cf8' },
          { label:'Funded accounts', val:'0', sub:'Add your first account', color:'#e8edf8' },
          { label:'Total P&L', val:'$0', sub:'Start trading', color:'#4ade80' },
          { label:'Win rate', val:'—', sub:'Log trades to track', color:'#e8edf8' },
        ].map(s => (
          <div key={s.label} style={S.mcard}>
            <div style={S.label}>{s.label}</div>
            <div style={{ ...S.val, color:s.color }}>{s.val}</div>
            <div style={S.sub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div style={S.card}>
          <div style={S.secTitle}>Quick access</div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {[
              { label:'Challenge Tracker', href:'/dashboard/challenge', color:'#818cf8', desc:'Track evaluation progress' },
              { label:'Risk Manager', href:'/dashboard/risk', color:'#fbbf24', desc:'Calculate position sizes' },
              { label:'Trade Journal', href:'/dashboard/journal', color:'#4ade80', desc:'Log and review trades' },
              { label:'Simulator', href:'/dashboard/simulator', color:'#f472b6', desc:'Test before buying challenge' },
              { label:'Multi-Account', href:'/dashboard/stacker', color:'#38bdf8', desc:'Track all funded accounts' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:9, textDecoration:'none',
                transition:'background .15s', background:'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background='#111520')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}
              >
                <span style={{ width:8, height:8, borderRadius:'50%', background:item.color, display:'inline-block', flexShrink:0 }}></span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'#8892b0' }}>{item.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.secTitle}>Getting started</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { step:'1', text:'Run the Challenge Simulator to test your strategy', done:false },
              { step:'2', text:'Set up your challenge parameters in Challenge Tracker', done:false },
              { step:'3', text:'Log your first trade in the Journal', done:false },
              { step:'4', text:'Add your funded accounts to Multi-Account Stacker', done:false },
              { step:'5', text:'Track your income and scale', done:false },
            ].map(item => (
              <div key={item.step} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%', background:'#111520',
                  border:'1px solid #1e2538', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:11, fontWeight:700,
                  color:'#5b6af0', flexShrink:0
                }}>{item.step}</div>
                <span style={{ fontSize:12, color:'#8892b0', lineHeight:1.6, paddingTop:2 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div style={{
        background:'linear-gradient(135deg, rgba(91,106,240,.15), rgba(91,106,240,.05))',
        border:'1px solid rgba(91,106,240,.3)', borderRadius:14, padding:'20px 24px',
        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12
      }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'#e8edf8', marginBottom:4 }}>
            Ready to get funded?
          </div>
          <div style={{ fontSize:12, color:'#8892b0' }}>
            Run the simulator first — know your pass probability before spending $500 on a challenge.
          </div>
        </div>
        <a href="/dashboard/simulator" style={{
          padding:'10px 20px', background:'#5b6af0', borderRadius:9,
          fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none',
          whiteSpace:'nowrap', transition:'opacity .15s'
        }}>Run simulator →</a>
      </div>
    </div>
  )
}
