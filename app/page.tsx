import Link from 'next/link'

const features = [
  { icon:'📈', title:'Monte Carlo Simulator', desc:'Run 1,000 simulations of your strategy against real FTMO/Topstep rules. Know your pass probability before spending $500.' },
  { icon:'🎯', title:'Challenge Tracker', desc:'Real-time tracking of profit target, daily drawdown, and total drawdown. Know exactly where you stand every day.' },
  { icon:'🛡', title:'Risk Manager', desc:'Calculate exact position sizes in seconds. Built-in expectancy calculator and daily exposure safety check.' },
  { icon:'📋', title:'Trade Journal', desc:'Log every trade with P&L calendar heatmap and 365-day performance view. Spot your patterns instantly.' },
  { icon:'💹', title:'Trading Desk', desc:'Professional buy/sell interface with live prices. Auto-logs to your journal. Track prop firm payouts.' },
  { icon:'🤖', title:'AI Trade Review', desc:'Paste any setup and get instant AI feedback on R:R, session timing, prop firm rules, and a clear verdict.' },
  { icon:'📅', title:'Economic Calendar', desc:'Never trade into NFP or FOMC again. High-impact events with forecast vs actual data.' },
  { icon:'🕐', title:'Session Clock', desc:'Live London/NY/Asian session tracker with countdown timers and overlap detection.' },
  { icon:'📊', title:'Live Charts', desc:'TradingView charts for 14 instruments — forex, gold, indices, crypto — with RSI and MACD built in.' },
]

const stats = [
  { val:'11', label:'Trading tools' },
  { val:'$0', label:'Cost to start' },
  { val:'1,000', label:'Monte Carlo runs' },
  { val:'14', label:'Live instruments' },
]

const firms = ['FTMO','Topstep','The5%ers','MyFundedFX','Apex','E8 Funding','Funding Pips','True Forex Funds']

export default function LandingPage() {
  return (
    <div style={{ fontFamily:"'Nunito Sans',sans-serif", background:'#fff', color:'#1A1D2E', minHeight:'100vh' }}>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid #E8EAF0', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 4px 12px rgba(0,179,134,0.3)' }}>⚡</div>
          <span style={{ fontWeight:800, fontSize:16, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>FundPro Plus</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <a href="/sign-in" style={{ fontSize:13, fontWeight:600, color:'#5A6078', textDecoration:'none' }}>Sign in</a>
          <a href="/sign-up" style={{ padding:'9px 20px', background:'linear-gradient(135deg,#00B386,#00C896)', border:'none', borderRadius:10, fontSize:13, fontWeight:700, color:'#fff', textDecoration:'none', boxShadow:'0 4px 12px rgba(0,179,134,0.3)' }}>
            Get started free →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'72px 24px 80px', textAlign:'center', background:'linear-gradient(180deg,#F0FAF7 0%,#fff 100%)', position:'relative', overflow:'hidden' }}>
        {/* Background dots */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(#00B38615 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>

        <div style={{ maxWidth:760, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'#E8FBF5', borderRadius:20, border:'1px solid #B3EAD9', fontSize:12, fontWeight:700, color:'#007A5C', marginBottom:24 }}>
            🚀 Free for all prop firm traders · No credit card required
          </div>

          <h1 style={{ fontSize:'clamp(32px,6vw,58px)', fontWeight:900, color:'#1A1D2E', lineHeight:1.15, letterSpacing:'-.03em', marginBottom:20, fontFamily:"'Nunito',sans-serif" }}>
            Pass your prop firm challenge<br/>
            <span style={{ color:'#00B386' }}>the first time.</span>
          </h1>

          <p style={{ fontSize:'clamp(15px,2.5vw,18px)', color:'#5A6078', lineHeight:1.7, marginBottom:36, maxWidth:560, margin:'0 auto 36px', fontWeight:500 }}>
            The all-in-one trading toolkit for prop firm traders. Simulate your strategy, track your challenge, manage risk, and review trades with AI — all free.
          </p>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/sign-up" style={{ padding:'14px 32px', background:'linear-gradient(135deg,#00B386,#00C896)', border:'none', borderRadius:12, fontSize:15, fontWeight:800, color:'#fff', textDecoration:'none', boxShadow:'0 6px 20px rgba(0,179,134,0.4)', fontFamily:"'Nunito',sans-serif" }}>
              Start for free →
            </a>
            <a href="/sign-in" style={{ padding:'14px 28px', background:'#fff', border:'2px solid #E8EAF0', borderRadius:12, fontSize:15, fontWeight:700, color:'#1A1D2E', textDecoration:'none', fontFamily:"'Nunito',sans-serif" }}>
              Sign in
            </a>
          </div>

          <div style={{ marginTop:24, fontSize:12, color:'#9EA6C0', fontWeight:500 }}>
            ✓ No credit card &nbsp; ✓ Free forever &nbsp; ✓ Works with all prop firms
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background:'#1A1D2E', padding:'28px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, textAlign:'center' }}>
          {stats.map(s=>(
            <div key={s.label}>
              <div style={{ fontSize:32, fontWeight:900, color:'#00B386', fontFamily:"'Nunito',sans-serif", lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Firms */}
      <section style={{ padding:'28px 24px', background:'#F7F8FA', textAlign:'center', borderBottom:'1px solid #E8EAF0' }}>
        <div style={{ fontSize:12, color:'#9EA6C0', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Works with all major prop firms</div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {firms.map(f=>(
            <span key={f} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:20, background:'#fff', border:'1px solid #E8EAF0', color:'#5A6078', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>{f}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:900, color:'#1A1D2E', marginBottom:12, fontFamily:"'Nunito',sans-serif", letterSpacing:'-.02em' }}>
            Everything you need to get funded
          </h2>
          <p style={{ fontSize:16, color:'#9EA6C0', fontWeight:500, maxWidth:500, margin:'0 auto' }}>
            9 professional tools designed specifically for prop firm traders. All free.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {features.map((f,i)=>(
            <div key={i} style={{ padding:'24px', background:'#fff', border:'1.5px solid #E8EAF0', borderRadius:16, transition:'all .2s', cursor:'default', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#00B386';(e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(0,179,134,0.1)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#E8EAF0';(e.currentTarget as HTMLElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}}>
              <div style={{ fontSize:32, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#1A1D2E', marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'#5A6078', lineHeight:1.7, margin:0, fontWeight:500 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding:'80px 24px', background:'#F7F8FA' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:900, color:'#1A1D2E', marginBottom:12, fontFamily:"'Nunito',sans-serif", letterSpacing:'-.02em' }}>
            From strategy to funded in 3 steps
          </h2>
          <p style={{ fontSize:15, color:'#9EA6C0', marginBottom:56, fontWeight:500 }}>Most traders fail FTMO because they never tested their strategy first.</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { step:'1', icon:'🧪', title:'Simulate first', desc:'Run 1,000 Monte Carlo scenarios of your exact strategy against real FTMO rules. See your pass probability before spending a dollar.' },
              { step:'2', icon:'📊', title:'Trade with discipline', desc:'Use the Risk Manager for every trade. Log everything in the journal. The P&L calendar will reveal patterns you never noticed.' },
              { step:'3', icon:'💰', title:'Get funded & scale', desc:'Track your funded accounts in Multi-Account Stacker. See your projected monthly income as you scale to multiple accounts.' },
            ].map(s=>(
              <div key={s.step} style={{ background:'#fff', borderRadius:16, padding:'28px 24px', border:'1px solid #E8EAF0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#00B386,#00C896)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', margin:'0 auto 16px', boxShadow:'0 4px 12px rgba(0,179,134,0.3)' }}>{s.step}</div>
                <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#1A1D2E', marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'#5A6078', lineHeight:1.7, margin:0, fontWeight:500 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'80px 24px', maxWidth:900, margin:'0 auto' }}>
        <h2 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:'#1A1D2E', textAlign:'center', marginBottom:12, fontFamily:"'Nunito',sans-serif" }}>What traders are saying</h2>
        <p style={{ fontSize:14, color:'#9EA6C0', textAlign:'center', marginBottom:48, fontWeight:500 }}>Real feedback from prop firm traders using FundPro Plus</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { name:'Alex R.', handle:'@alextradesFX', avatar:'🧑', text:'The Monte Carlo simulator is insane. Found out my strategy had only 34% pass rate on FTMO before I wasted $500. Fixed my risk and now I\'m at 71%.', firm:'FTMO Funded' },
            { name:'Priya S.', handle:'@priyaforex', avatar:'👩', text:'Finally a journal that actually shows you something useful. The P&L calendar made me realise I lose money every Monday. Now I skip Mondays.', firm:'Topstep Funded' },
            { name:'Marcus T.', handle:'@marcustrader', avatar:'🧔', text:'The session clock alone is worth it. I was trading EUR/USD during Asian session and wondering why my setups weren\'t working. Problem solved.', firm:'The5%ers Funded' },
          ].map(t=>(
            <div key={t.name} style={{ background:'#fff', border:'1.5px solid #E8EAF0', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#E8FBF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>{t.name}</div>
                  <div style={{ fontSize:11, color:'#9EA6C0' }}>{t.handle} · <span style={{ color:'#00B386', fontWeight:600 }}>{t.firm}</span></div>
                </div>
              </div>
              <p style={{ fontSize:13, color:'#5A6078', lineHeight:1.7, margin:0, fontWeight:500 }}>"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', background:'linear-gradient(135deg,#00B386,#00C896)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:900, color:'#fff', marginBottom:12, fontFamily:"'Nunito',sans-serif", letterSpacing:'-.02em' }}>
            Start trading smarter today
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.85)', marginBottom:36, fontWeight:500, lineHeight:1.6 }}>
            Join traders who are passing prop firm challenges with data-driven strategies. Free forever.
          </p>
          <a href="/sign-up" style={{ display:'inline-block', padding:'16px 40px', background:'#fff', borderRadius:12, fontSize:16, fontWeight:800, color:'#00B386', textDecoration:'none', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', fontFamily:"'Nunito',sans-serif" }}>
            Create free account →
          </a>
          <div style={{ marginTop:20, fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
            ✓ No credit card &nbsp; ✓ All 9 tools free &nbsp; ✓ Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'32px 24px', background:'#1A1D2E', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:16 }}>
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#00B386,#00C896)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
          <span style={{ fontWeight:800, fontSize:14, color:'#fff', fontFamily:"'Nunito',sans-serif" }}>FundPro Plus</span>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:12 }}>
          Built for prop firm traders. Not affiliated with FTMO, Topstep, or any prop firm.
        </p>
        <div style={{ display:'flex', gap:20, justifyContent:'center', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          <a href="/sign-in" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Sign in</a>
          <a href="/sign-up" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Sign up</a>
          <a href="/dashboard" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Dashboard</a>
        </div>
        <div style={{ marginTop:16, fontSize:11, color:'rgba(255,255,255,0.25)' }}>© 2026 FundPro Plus. All rights reserved.</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          [style*="repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
          [style*="repeat(4,1fr)"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
