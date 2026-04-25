'use client'
import { useState } from 'react'
import { Card, PageHeader, Alert, SectionTitle } from '@/components/ui'

const FIRMS = [
  {
    name: 'FTMO', logo: '🟢', color: '#00B386', bg: '#E8FBF5',
    commission: '$200', model: 'Per challenge purchase',
    url: 'https://ftmo.com/affiliate',
    challenge: '$155–$1,080', accounts: '$10K–$200K',
    split: '80–90%', rating: 5, tags: ['Most popular','Highest payout'],
    desc: 'The world\'s most popular prop firm. High brand recognition means easier conversions.',
    cookie: '30 days', tier: 'gold'
  },
  {
    name: 'Topstep', logo: '🔵', color: '#2196F3', bg: '#E3F2FD',
    commission: '$100', model: 'Per funded account',
    url: 'https://topstep.com/affiliates',
    challenge: '$149–$349/mo', accounts: '$50K–$150K',
    split: '90%', rating: 4, tags: ['Futures focused','Fast payouts'],
    desc: 'Leading futures prop firm. Great for traders who want to trade ES, NQ, CL contracts.',
    cookie: '45 days', tier: 'silver'
  },
  {
    name: 'The5%ers', logo: '🟡', color: '#FF9800', bg: '#FFF3E0',
    commission: '$150', model: 'Per funded account',
    url: 'https://the5ers.com/affiliates',
    challenge: '$269–$1,499', accounts: '$10K–$4M',
    split: '50–100%', rating: 4, tags: ['Scaling plan','Long term'],
    desc: 'Unique scaling model lets traders grow to $4M. Appeals to serious long-term traders.',
    cookie: '60 days', tier: 'silver'
  },
  {
    name: 'MyFundedFX', logo: '🟠', color: '#F44336', bg: '#FFEBEE',
    commission: '$75', model: 'Per challenge',
    url: 'https://myfundedfx.com/affiliates',
    challenge: '$49–$499', accounts: '$10K–$200K',
    split: '75–85%', rating: 3, tags: ['Budget friendly','Easy entry'],
    desc: 'Lower challenge fees make it easy to convert budget-conscious traders.',
    cookie: '30 days', tier: 'bronze'
  },
  {
    name: 'Apex Trader', logo: '⚫', color: '#1A1D2E', bg: '#F0F2F5',
    commission: '$50', model: 'Per combine purchase',
    url: 'https://apextraderfunding.com/affiliate',
    challenge: '$97–$247/mo', accounts: '$25K–$300K',
    split: '90%', rating: 4, tags: ['Futures','High split'],
    desc: 'Fastest growing futures prop firm. 90% profit split is a great selling point.',
    cookie: '30 days', tier: 'bronze'
  },
  {
    name: 'E8 Funding', logo: '🟣', color: '#7C4DFF', bg: '#EDE7F6',
    commission: '$120', model: 'Per account purchase',
    url: 'https://e8funding.com/affiliates',
    challenge: '$108–$648', accounts: '$25K–$250K',
    split: '80%', rating: 4, tags: ['Crypto friendly','Growing fast'],
    desc: 'Crypto-friendly payouts and growing rapidly. Strong appeal in Asian markets.',
    cookie: '30 days', tier: 'silver'
  },
]

const tierColors = {
  gold:   { bg:'#FFF8E1', color:'#F57F17', label:'⭐ Gold Partner' },
  silver: { bg:'#F5F5F5', color:'#616161', label:'Silver Partner' },
  bronze: { bg:'#FBE9E7', color:'#BF360C', label:'Bronze Partner' },
}

export default function AffiliatesPage() {
  const [copied, setCopied] = useState<string|null>(null)
  const [filter, setFilter] = useState('all')

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(()=>setCopied(null), 2000)
  }

  const totalPotential = FIRMS.reduce((s,f)=>s+parseInt(f.commission.replace('$','')),0)
  const filtered = filter==='all' ? FIRMS : FIRMS.filter(f=>f.tier===filter)

  return (
    <div>
      <PageHeader title="Affiliate partners" subtitle="Earn $50–$200 every time a user buys a prop firm challenge through your link."/>

      <Alert type="success">
        💰 You could earn <strong>${totalPotential.toLocaleString()}+ per month</strong> if just 10 users sign up through your links. Apply to all programs — it's free and takes 5 minutes each.
      </Alert>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, margin:'16px 0' }}>
        {[
          { label:'Partner firms', val:FIRMS.length.toString(), color:'#00B386', icon:'🤝' },
          { label:'Max per referral', val:'$200', color:'#7C4DFF', icon:'💰' },
          { label:'Monthly potential (10 users)', val:'$1,500+', color:'#FF9800', icon:'📈' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.val}</div>
            <div style={{ fontSize:11, color:'#9EA6C0', fontWeight:500, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','All firms'],['gold','⭐ Gold'],['silver','Silver'],['bronze','Bronze']].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ padding:'6px 14px', fontSize:12, borderRadius:20, cursor:'pointer', fontWeight:700, background:filter===k?'#1A1D2E':'#fff', border:filter===k?'none':'1.5px solid #E8EAF0', color:filter===k?'#fff':'#5A6078', transition:'all .15s' }}>{l}</button>
        ))}
      </div>

      {/* Firm cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(f=>{
          const tc = tierColors[f.tier as keyof typeof tierColors]
          return (
            <Card key={f.name} style={{ border:`1.5px solid ${f.tier==='gold'?'#FFD54F':'#E8EAF0'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{f.logo}</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontSize:18, fontWeight:800, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>{f.name}</span>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700, background:tc.bg, color:tc.color }}>{tc.label}</span>
                      {f.tags.map(t=><span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:f.bg, color:f.color, fontWeight:600 }}>{t}</span>)}
                    </div>
                    <div style={{ fontSize:13, color:'#5A6078', fontWeight:500, maxWidth:420, lineHeight:1.5 }}>{f.desc}</div>
                  </div>
                </div>

                {/* Commission */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:28, fontWeight:800, color:f.color, fontFamily:"'Nunito',sans-serif", lineHeight:1 }}>{f.commission}</div>
                  <div style={{ fontSize:11, color:'#9EA6C0', fontWeight:500, marginTop:2 }}>{f.model}</div>
                  <div style={{ fontSize:10, color:'#C4CAD9', marginTop:1 }}>Cookie: {f.cookie}</div>
                </div>
              </div>

              {/* Details row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, margin:'14px 0', padding:'12px 14px', background:'#F7F8FA', borderRadius:10, border:'1px solid #F0F2F5' }}>
                {[
                  { label:'Challenge fee', val:f.challenge },
                  { label:'Account sizes', val:f.accounts },
                  { label:'Profit split', val:f.split },
                ].map(s=>(
                  <div key={s.label}>
                    <div style={{ fontSize:10, color:'#9EA6C0', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:3 }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1A1D2E' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ padding:'9px 18px', background:f.color, border:'none', borderRadius:10, fontSize:13, fontWeight:700, color:'#fff', textDecoration:'none', cursor:'pointer', fontFamily:"'Nunito Sans',sans-serif" }}>
                  Apply now →
                </a>
                <button onClick={()=>copy(f.url, f.name)} style={{ padding:'9px 18px', background:'#F7F8FA', border:'1.5px solid #E8EAF0', borderRadius:10, fontSize:13, fontWeight:700, color:'#5A6078', cursor:'pointer' }}>
                  {copied===f.name ? '✓ Copied!' : 'Copy affiliate URL'}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* How it works */}
      <Card style={{ marginTop:16, background:'linear-gradient(135deg,#F7FBF9,#fff)', border:'1.5px solid #B3EAD9' }}>
        <SectionTitle>How to maximise affiliate income</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          {[
            { step:'1', title:'Apply to all 6 programs', desc:'Each takes 5 minutes to apply. Most approve within 24 hours. Apply today.' },
            { step:'2', title:'Add links to your Reddit posts', desc:'When you post about FundPro Plus on Reddit, include your FTMO/Topstep affiliate link naturally.' },
            { step:'3', title:'Add a "Compare firms" page', desc:'We can build a comparison table in FundPro Plus where every firm name links to your affiliate URL.' },
            { step:'4', title:'Email your users', desc:'Once you have 100+ users, one email recommending FTMO could earn $2,000+ in a day.' },
          ].map(s=>(
            <div key={s.step} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#00B386', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A1D2E', marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>{s.title}</div>
                <div style={{ fontSize:12, color:'#5A6078', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
