'use client'
import { useState } from 'react'
import { Card, PageHeader } from '@/components/ui'

const PAIRS = [
  { symbol:'EURUSD', label:'EUR/USD', category:'Forex' },
  { symbol:'GBPUSD', label:'GBP/USD', category:'Forex' },
  { symbol:'USDJPY', label:'USD/JPY', category:'Forex' },
  { symbol:'AUDUSD', label:'AUD/USD', category:'Forex' },
  { symbol:'USDCAD', label:'USD/CAD', category:'Forex' },
  { symbol:'USDCHF', label:'USD/CHF', category:'Forex' },
  { symbol:'XAUUSD', label:'XAU/USD', category:'Commodities' },
  { symbol:'XAGUSD', label:'XAG/USD', category:'Commodities' },
  { symbol:'USOIL',  label:'WTI Oil', category:'Commodities' },
  { symbol:'NAS100', label:'NAS100',  category:'Indices' },
  { symbol:'SPX500', label:'S&P 500', category:'Indices' },
  { symbol:'US30',   label:'Dow Jones',category:'Indices'},
  { symbol:'BTCUSD', label:'BTC/USD', category:'Crypto' },
  { symbol:'ETHUSD', label:'ETH/USD', category:'Crypto' },
]

const INTERVALS = [
  { value:'1',   label:'1m' },
  { value:'5',   label:'5m' },
  { value:'15',  label:'15m' },
  { value:'60',  label:'1h' },
  { value:'240', label:'4h' },
  { value:'D',   label:'1D' },
  { value:'W',   label:'1W' },
]

const THEMES = [
  { value:'light', label:'Light' },
  { value:'dark',  label:'Dark' },
]

export default function ChartsPage() {
  const [pair, setPair] = useState('EURUSD')
  const [interval, setInterval] = useState('60')
  const [theme, setTheme] = useState('light')
  const [category, setCategory] = useState('Forex')

  const categories = Array.from(new Set(PAIRS.map(p=>p.category)))
  const filtered = PAIRS.filter(p=>p.category===category)
  const selected = PAIRS.find(p=>p.symbol===pair)

  const tvSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=FX%3A${pair}&interval=${interval}&theme=${theme}&style=1&locale=en&toolbar_bg=%23F7F8FA&hide_side_toolbar=0&allow_symbol_change=1&studies=RSI%4014%7CMACD%4012%2C26%2C9&show_popup_button=1&popup_width=1000&popup_height=650`

  return (
    <div>
      <PageHeader title="Live charts" subtitle="TradingView charts for all major forex pairs, indices, commodities and crypto."/>

      {/* Controls */}
      <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        {/* Category filter */}
        <div style={{display:'flex',gap:6}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>{setCategory(c);const first=PAIRS.find(p=>p.category===c);if(first)setPair(first.symbol)}} style={{
              padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontWeight:700,
              background:category===c?'#1A1D2E':'#fff',
              border:category===c?'none':'1.5px solid #E8EAF0',
              color:category===c?'#fff':'#5A6078',transition:'all .15s'
            }}>{c}</button>
          ))}
        </div>

        <div style={{height:24,width:1,background:'#E8EAF0'}}/>

        {/* Pairs */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {filtered.map(p=>(
            <button key={p.symbol} onClick={()=>setPair(p.symbol)} style={{
              padding:'6px 12px',fontSize:12,borderRadius:8,cursor:'pointer',fontWeight:700,
              background:pair===p.symbol?'#00B386':'#F7F8FA',
              border:pair===p.symbol?'none':'1.5px solid #E8EAF0',
              color:pair===p.symbol?'#fff':'#5A6078',
              boxShadow:pair===p.symbol?'0 3px 8px rgba(0,179,134,0.3)':'none',
              transition:'all .15s'
            }}>{p.label}</button>
          ))}
        </div>

        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
          {/* Interval */}
          {INTERVALS.map(i=>(
            <button key={i.value} onClick={()=>setInterval(i.value)} style={{
              padding:'5px 10px',fontSize:11,borderRadius:7,cursor:'pointer',fontWeight:700,
              background:interval===i.value?'#1A1D2E':'#F7F8FA',
              border:interval===i.value?'none':'1.5px solid #E8EAF0',
              color:interval===i.value?'#fff':'#5A6078',transition:'all .15s'
            }}>{i.label}</button>
          ))}
          <div style={{height:24,width:1,background:'#E8EAF0',margin:'0 4px'}}/>
          {/* Theme */}
          {THEMES.map(t=>(
            <button key={t.value} onClick={()=>setTheme(t.value)} style={{
              padding:'5px 10px',fontSize:11,borderRadius:7,cursor:'pointer',fontWeight:700,
              background:theme===t.value?'#1A1D2E':'#F7F8FA',
              border:theme===t.value?'none':'1.5px solid #E8EAF0',
              color:theme===t.value?'#fff':'#5A6078',transition:'all .15s'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card style={{padding:0,overflow:'hidden',height:560}}>
        <iframe
          key={`${pair}-${interval}-${theme}`}
          src={tvSrc}
          style={{width:'100%',height:'100%',border:'none'}}
          allowTransparency={true}
          scrolling="no"
          allowFullScreen={true}
          title={`${selected?.label} chart`}
        />
      </Card>

      {/* Info row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginTop:14}}>
        {[
          {label:'Chart provider',val:'TradingView'},
          {label:'Current pair',val:selected?.label||pair},
          {label:'Timeframe',val:INTERVALS.find(i=>i.value===interval)?.label||interval},
          {label:'Indicators',val:'RSI + MACD'},
        ].map(s=>(
          <div key={s.label} style={{background:'#fff',border:'1px solid #E8EAF0',borderRadius:12,padding:'12px 16px',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:10,letterSpacing:'.06em',textTransform:'uppercase',color:'#9EA6C0',fontWeight:600,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:14,fontWeight:700,color:'#1A1D2E',fontFamily:"'Nunito',sans-serif"}}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
