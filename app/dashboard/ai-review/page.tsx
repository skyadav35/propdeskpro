'use client'
import { useState } from 'react'
import { Card, PageHeader, Alert, Field, SectionTitle } from '@/components/ui'

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 12px', fontSize:13,
  background:'#F7F8FA', border:'1.5px solid #E8EAF0',
  borderRadius:8, color:'#1A1D2E', outline:'none',
  fontFamily:"'Nunito Sans',sans-serif", fontWeight:500,
  transition:'border-color .15s, box-shadow .15s'
}

interface ReviewSection { title: string; content: string; type: 'good'|'warn'|'danger'|'info' }

export default function AIReviewPage() {
  const [pair, setPair] = useState('EUR/USD')
  const [direction, setDirection] = useState('LONG')
  const [entry, setEntry] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [session, setSession] = useState('London')
  const [setup, setSetup] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState<string>('')
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!setup || !entry || !sl || !tp) {
      setError('Please fill in entry, stop loss, take profit and setup description.')
      return
    }
    setError(''); setLoading(true); setReview('')

    const rr = Math.abs((parseFloat(tp) - parseFloat(entry)) / (parseFloat(entry) - parseFloat(sl)))

    const prompt = `You are an expert prop firm trading coach reviewing a trade setup. Be concise, direct and practical. Format your response with clear sections.

TRADE SETUP:
- Pair: ${pair}
- Direction: ${direction}
- Entry: ${entry}
- Stop Loss: ${sl}
- Take Profit: ${tp}
- Session: ${session}
- R:R Ratio: 1:${rr.toFixed(2)}
- Setup type: ${setup}
- Trader reasoning: ${reasoning || 'Not provided'}

Please review this setup across these 5 areas:

**1. Risk/Reward Assessment**
Evaluate the R:R ratio and whether it's suitable for prop firm rules.

**2. Setup Quality**
Assess the setup type and entry rationale. What's strong or weak about it?

**3. Session Timing**
Is ${session} session appropriate for ${pair}? When is liquidity highest?

**4. Prop Firm Risk Rules**
What should the trader watch out for to protect their challenge account?

**5. Verdict**
TAKE THE TRADE / SKIP / WAIT FOR BETTER ENTRY — with a clear one-sentence reason.

Keep each section to 2-3 sentences max. Be direct and actionable.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      setReview(text)
    } catch (e) {
      setError('AI review failed. Please try again.')
    }
    setLoading(false)
  }

  const parseReview = (text: string): ReviewSection[] => {
    if (!text) return []
    const sections: ReviewSection[] = []
    const parts = text.split(/\*\*\d+\.\s/)
    parts.forEach(part => {
      if (!part.trim()) return
      const lines = part.trim().split('\n')
      const title = lines[0].replace('**','').trim()
      const content = lines.slice(1).join('\n').trim()
      if (!title || !content) return
      let type: ReviewSection['type'] = 'info'
      if (title.toLowerCase().includes('verdict')) {
        if (content.toLowerCase().includes('take the trade')) type = 'good'
        else if (content.toLowerCase().includes('skip')) type = 'danger'
        else type = 'warn'
      } else if (title.toLowerCase().includes('risk')) type = 'warn'
      else if (title.toLowerCase().includes('quality')) type = 'info'
      sections.push({ title, content, type })
    })
    return sections
  }

  const sections = parseReview(review)
  const typeColors = {
    good:   { bg:'#E8FBF5', border:'#B3EAD9', color:'#007A5C', icon:'✓' },
    warn:   { bg:'#FFF3E0', border:'#FFE0B2', color:'#E65100', icon:'⚠' },
    danger: { bg:'#FFEBEE', border:'#FFCDD2', color:'#C62828', icon:'✕' },
    info:   { bg:'#E3F2FD', border:'#BBDEFB', color:'#1565C0', icon:'ℹ' },
  }

  const sel: React.CSSProperties = { ...inputStyle }

  return (
    <div>
      <PageHeader title="AI trade review" subtitle="Get instant AI feedback on your trade setup before entering. Powered by Claude AI."/>

      <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:16, alignItems:'start' }}>
        {/* Input form */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Card>
            <SectionTitle>Trade setup</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Pair">
                <select value={pair} onChange={e=>setPair(e.target.value)} style={sel}>
                  {['EUR/USD','GBP/USD','USD/JPY','XAU/USD','NAS100','SPX500','BTC/USD','ETH/USD'].map(v=><option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Direction">
                <select value={direction} onChange={e=>setDirection(e.target.value)} style={sel}>
                  <option value="LONG">LONG ↑</option>
                  <option value="SHORT">SHORT ↓</option>
                </select>
              </Field>
              <Field label="Entry price">
                <input value={entry} onChange={e=>setEntry(e.target.value)} placeholder="1.08540" style={inputStyle}/>
              </Field>
              <Field label="Stop loss">
                <input value={sl} onChange={e=>setSl(e.target.value)} placeholder="1.08340" style={inputStyle}/>
              </Field>
              <Field label="Take profit">
                <input value={tp} onChange={e=>setTp(e.target.value)} placeholder="1.09000" style={inputStyle}/>
              </Field>
              <Field label="Session">
                <select value={session} onChange={e=>setSession(e.target.value)} style={sel}>
                  {['London','New York','Asian','London-NY Overlap'].map(v=><option key={v}>{v}</option>)}
                </select>
              </Field>
            </div>

            {entry && sl && tp && (
              <div style={{ background:'#F7F8FA', borderRadius:10, padding:'10px 14px', marginBottom:10, border:'1px solid #F0F2F5' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#9EA6C0', fontWeight:500 }}>R:R Ratio</span>
                  <span style={{ fontWeight:800, fontFamily:'SF Mono,monospace',
                    color: Math.abs((parseFloat(tp)-parseFloat(entry))/(parseFloat(entry)-parseFloat(sl))) >= 2 ? '#00B386' : '#FF9800' }}>
                    1:{Math.abs((parseFloat(tp)-parseFloat(entry))/(parseFloat(entry)-parseFloat(sl))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Field label="Setup type">
              <select value={setup} onChange={e=>setSetup(e.target.value)} style={sel}>
                <option value="">Select setup...</option>
                {['Trend Follow','Breakout','Reversal','Support/Resistance','ICT/SMC','Fibonacci','EMA Crossover','News Trade','Other'].map(v=><option key={v}>{v}</option>)}
              </select>
            </Field>

            <Field label="Your reasoning (optional)">
              <textarea value={reasoning} onChange={e=>setReasoning(e.target.value)}
                placeholder="Why are you taking this trade? What do you see on the chart?"
                style={{ ...inputStyle, height:80, resize:'vertical' }}/>
            </Field>

            {error && <Alert type="danger">{error}</Alert>}

            <button onClick={analyze} disabled={loading} style={{
              width:'100%', padding:'11px', fontSize:13, fontWeight:700,
              background: loading ? '#E8EAF0' : 'linear-gradient(135deg,#00B386,#00C896)',
              border:'none', borderRadius:10, color: loading ? '#9EA6C0' : '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'Nunito Sans',sans-serif",
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0,179,134,0.3)',
              transition:'all .2s'
            }}>
              {loading ? '🤖 Analyzing your setup...' : '🤖 Get AI review'}
            </button>
          </Card>

          {/* Tips */}
          <Card>
            <SectionTitle>Tips for best results</SectionTitle>
            {[
              { icon:'📍', tip:'Use exact price levels — not approximate' },
              { icon:'📝', tip:'Describe what you see: trend, key levels, pattern' },
              { icon:'🕐', tip:'Mention if news is coming up soon' },
              { icon:'📊', tip:'Higher timeframe bias helps AI give better context' },
            ].map(t => (
              <div key={t.tip} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'7px 0', borderBottom:'1px solid #F5F7FA' }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:12, color:'#5A6078', fontWeight:500, lineHeight:1.5 }}>{t.tip}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Review output */}
        <div>
          {!review && !loading && (
            <div style={{ background:'#fff', border:'2px dashed #E8EAF0', borderRadius:16, padding:'48px 24px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#1A1D2E', marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>
                AI trade review ready
              </div>
              <div style={{ fontSize:13, color:'#9EA6C0', fontWeight:500, maxWidth:320, margin:'0 auto', lineHeight:1.6 }}>
                Fill in your trade details and click "Get AI review" to receive instant feedback on your setup.
              </div>
            </div>
          )}

          {loading && (
            <Card>
              <div style={{ textAlign:'center', padding:'48px 24px' }}>
                <div style={{ fontSize:40, marginBottom:16, animation:'spin 1s linear infinite' }}>⟳</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#1A1D2E', marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>
                  Analyzing your setup...
                </div>
                <div style={{ fontSize:13, color:'#9EA6C0' }}>
                  Checking R:R, session timing, prop firm rules...
                </div>
              </div>
            </Card>
          )}

          {review && !loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>
                  AI Review — {pair} {direction}
                </div>
                <button onClick={()=>setReview('')} style={{ fontSize:11, padding:'5px 12px', borderRadius:8, background:'#F7F8FA', border:'1.5px solid #E8EAF0', color:'#5A6078', cursor:'pointer', fontWeight:600 }}>
                  Clear
                </button>
              </div>

              {sections.length > 0 ? sections.map((s, i) => {
                const c = typeColors[s.type]
                return (
                  <div key={i} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:16, fontWeight:700, color:c.color }}>{c.icon}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:'#1A1D2E', fontFamily:"'Nunito',sans-serif" }}>{s.title}</span>
                    </div>
                    <p style={{ fontSize:13, color:'#5A6078', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>{s.content}</p>
                  </div>
                )
              }) : (
                <Card>
                  <pre style={{ fontSize:13, color:'#5A6078', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:"'Nunito Sans',sans-serif", margin:0 }}>{review}</pre>
                </Card>
              )}

              <div style={{ fontSize:11, color:'#C4CAD9', textAlign:'center', fontWeight:500, padding:'8px 0' }}>
                AI analysis is educational only — always use your own judgment
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
