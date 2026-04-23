'use client'
import { useState } from 'react'
import { Card, PageHeader, Alert } from '@/components/ui'

interface NewsItem {
  id: number; title: string; source: string; date: string
  category: string; summary: string; url: string; important: boolean
  tags: string[]
}

const NEWS: NewsItem[] = [
  { id:1, title:'FTMO Introduces New Scaling Plan for Funded Traders — Up to $4M Capital',
    source:'FTMO Blog', date:'2026-04-21', category:'FTMO',
    summary:'FTMO has launched a new aggressive scaling plan allowing consistent traders to grow from $100K to $4M. Traders who achieve 10% profit in 3 consecutive months automatically qualify for an account upgrade without re-evaluation.',
    url:'https://ftmo.com/en/blog', important:true, tags:['FTMO','Scaling','New Feature'] },
  { id:2, title:'Topstep Reduces Monthly Subscription Fees by 20% — Starting May 2026',
    source:'Topstep Blog', date:'2026-04-20', category:'Topstep',
    summary:'In response to growing competition in the prop firm space, Topstep has reduced their monthly combine fees. The $150K combine drops from $149 to $119/month effective May 1st, 2026.',
    url:'https://topstep.com/blog', important:true, tags:['Topstep','Fees','Update'] },
  { id:3, title:'The5%ers Launches Instant Funded Program — No Challenge Required',
    source:'The5%ers', date:'2026-04-19', category:'The5%ers',
    summary:"The5%ers' new Instant program lets traders skip the evaluation entirely. Pay a one-time fee starting at $299 and receive a live funded account immediately with a 5% drawdown rule.",
    url:'https://the5ers.com', important:false, tags:['The5%ers','Instant','New'] },
  { id:4, title:'FTMO Challenge Pass Rate Drops to 8% — Data Analysis 2026',
    source:'PropFirm Review', date:'2026-04-18', category:'Industry',
    summary:'New data shows FTMO challenge pass rates have dropped to an all-time low of 8%. Analysts cite overleveraging during volatile NFP events as the primary cause. Risk management tools are more critical than ever.',
    url:'#', important:true, tags:['FTMO','Statistics','Risk'] },
  { id:5, title:'MyFundedFX Expands to Indian Market — INR Payouts Now Available',
    source:'MyFundedFX', date:'2026-04-17', category:'MyFundedFX',
    summary:'MyFundedFX announces direct INR bank transfer payouts for Indian traders, eliminating currency conversion fees. The expansion also includes regional customer support in Hindi.',
    url:'https://myfundedfx.com', important:false, tags:['MyFundedFX','India','Payout'] },
  { id:6, title:'Apex Trader Funding Adds Micro Futures Contracts for New Traders',
    source:'Apex Trader', date:'2026-04-16', category:'Apex',
    summary:'Apex now allows trading Micro E-mini contracts in their evaluation accounts, making it easier for new traders to manage risk while proving consistency. No changes to profit targets.',
    url:'https://apextraderfunding.com', important:false, tags:['Apex','Futures','Micro'] },
  { id:7, title:'Prop Firm Industry Regulation Update — FCA Considering New Framework',
    source:'Finance Magnates', date:'2026-04-15', category:'Regulation',
    summary:'The FCA is reviewing the prop firm industry following rapid growth. Proposed regulations would require firms to hold client funds in segregated accounts and provide proof of liquidity.',
    url:'#', important:true, tags:['Regulation','FCA','Industry'] },
  { id:8, title:'Best Risk Management Strategies for Prop Firm Challenges in 2026',
    source:'Trading Analysis', date:'2026-04-14', category:'Education',
    summary:'Analysis of 50,000 challenge attempts reveals the top traders risk 0.25-0.5% per trade, take maximum 2 losses before stopping for the day, and never trade within 30 minutes of major news.',
    url:'#', important:false, tags:['Education','Risk','Strategy'] },
]

const CATEGORIES = ['All','FTMO','Topstep','The5%ers','MyFundedFX','Apex','Industry','Regulation','Education']
const catColors: Record<string,{bg:string;color:string}> = {
  'FTMO':      {bg:'#E3F2FD',color:'#1565C0'},
  'Topstep':   {bg:'#E8F5E9',color:'#2E7D32'},
  'The5%ers':  {bg:'#FFF3E0',color:'#E65100'},
  'MyFundedFX':{bg:'#F3E5F5',color:'#6A1B9A'},
  'Apex':      {bg:'#FFEBEE',color:'#C62828'},
  'Industry':  {bg:'#E8FBF5',color:'#007A5C'},
  'Regulation':{bg:'#FFF8E1',color:'#F57F17'},
  'Education': {bg:'#EDE7F6',color:'#4527A0'},
}

export default function NewsFeedPage() {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<number|null>(null)
  const [showImportant, setShowImportant] = useState(false)

  const filtered = NEWS.filter(n => {
    if (showImportant && !n.important) return false
    return filter === 'All' || n.category === filter
  })

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

  return (
    <div>
      <PageHeader title="Prop firm news" subtitle="Latest updates from FTMO, Topstep, The5%ers and the broader prop trading industry."/>

      <Alert type="info">News is curated and updated weekly. For breaking news follow @FTMO_com, @Topsteptrader on Twitter/X.</Alert>

      {/* Filters */}
      <div style={{display:'flex',gap:8,margin:'16px 0',flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{
              padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontWeight:700,
              background:filter===c?'#1A1D2E':'#fff',
              border:filter===c?'none':'1.5px solid #E8EAF0',
              color:filter===c?'#fff':'#5A6078',transition:'all .15s'
            }}>{c}</button>
          ))}
        </div>
        <div style={{marginLeft:'auto'}}>
          <button onClick={()=>setShowImportant(p=>!p)} style={{
            padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontWeight:700,
            background:showImportant?'#FFEBEE':'#fff',
            border:showImportant?'1.5px solid #FFCDD2':'1.5px solid #E8EAF0',
            color:showImportant?'#C62828':'#5A6078',transition:'all .15s'
          }}>🔴 Important only</button>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.map(item=>{
          const isExpanded=expanded===item.id
          const cc=catColors[item.category]||{bg:'#F0F2F5',color:'#5A6078'}
          return (
            <Card key={item.id} style={{cursor:'pointer',transition:'box-shadow .2s',
              boxShadow:isExpanded?'0 4px 16px rgba(0,0,0,0.1)':'0 1px 3px rgba(0,0,0,0.06)',
              borderLeft:item.important?'4px solid #F44336':'4px solid #E8EAF0'}}>
              <div onClick={()=>setExpanded(isExpanded?null:item.id)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,fontWeight:700,background:cc.bg,color:cc.color}}>{item.category}</span>
                      {item.important&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'#FFEBEE',color:'#C62828',fontWeight:700}}>🔴 Important</span>}
                      <span style={{fontSize:11,color:'#9EA6C0',fontWeight:500}}>{formatDate(item.date)}</span>
                      <span style={{fontSize:11,color:'#9EA6C0',fontWeight:500}}>· {item.source}</span>
                    </div>
                    <h3 style={{fontSize:15,fontWeight:700,color:'#1A1D2E',lineHeight:1.4,fontFamily:"'Nunito',sans-serif",margin:0}}>{item.title}</h3>
                  </div>
                  <span style={{color:'#C4CAD9',fontSize:14,flexShrink:0,transform:isExpanded?'rotate(180deg)':'rotate(0)',transition:'transform .2s'}}>▼</span>
                </div>

                {!isExpanded&&(
                  <p style={{fontSize:13,color:'#5A6078',lineHeight:1.6,margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                    {item.summary}
                  </p>
                )}
              </div>

              {isExpanded&&(
                <div style={{borderTop:'1px solid #F5F7FA',paddingTop:14,marginTop:4}}>
                  <p style={{fontSize:13,color:'#5A6078',lineHeight:1.7,margin:'0 0 14px'}}>{item.summary}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {item.tags.map(tag=>(
                        <span key={tag} style={{fontSize:11,padding:'3px 8px',borderRadius:7,background:'#F7F8FA',color:'#5A6078',fontWeight:600,border:'1px solid #E8EAF0'}}>#{tag}</span>
                      ))}
                    </div>
                    {item.url!=='#'&&(
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:700,color:'#00B386',textDecoration:'none',padding:'6px 14px',borderRadius:8,background:'#E8FBF5',border:'1px solid #B3EAD9'}}>
                        Read more →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
