'use client'
import { useState } from 'react'

export function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', ...style }}>{children}</div>
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, letterSpacing:'.07em', textTransform:'uppercase', color:'#9EA6C0', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #F0F2F5', fontWeight:600 }}>{children}</div>
}

export function MetricCard({ label, value, sub, color, icon, trend }: { label:string; value:string; sub?:string; color?:string; icon?:string; trend?: 'up'|'down'|'neutral' }) {
  const trendColor = trend==='up'?'#00B386':trend==='down'?'#F44336':'#9EA6C0'
  const trendBg = trend==='up'?'#E8FBF5':trend==='down'?'#FFEBEE':'#F0F2F5'
  return (
    <div style={{ background:'#fff', border:'1px solid #E8EAF0', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', transition:'box-shadow .2s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ fontSize:11, letterSpacing:'.05em', textTransform:'uppercase', color:'#9EA6C0', fontWeight:600 }}>{label}</div>
        {trend && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:trendBg, color:trendColor, fontWeight:700 }}>{trend==='up'?'▲':trend==='down'?'▼':'—'}</span>}
      </div>
      <div style={{ fontSize:24, fontWeight:800, color: color||'#1A1D2E', fontFamily:"'Nunito',sans-serif", lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#9EA6C0', marginTop:5 }}>{sub}</div>}
    </div>
  )
}

export function ResultRow({ label, value, color }: { label:string; value:string; color?:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F5F7FA', fontSize:13 }}>
      <span style={{ color:'#5A6078', fontWeight:500 }}>{label}</span>
      <span style={{ fontWeight:700, fontFamily:'SF Mono,monospace', color:color||'#1A1D2E', fontSize:13 }}>{value}</span>
    </div>
  )
}

export function ProgressBar({ pct, color='#00B386', label, sublabel }: { pct:number; color?:string; label?:string; sublabel?:string }) {
  return (
    <div style={{ marginBottom:14 }}>
      {(label||sublabel) && (
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9EA6C0', marginBottom:6, fontWeight:500 }}>
          <span>{label}</span><span>{sublabel}</span>
        </div>
      )}
      <div style={{ height:7, background:'#F0F2F5', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${Math.min(100,Math.max(0,pct))}%`, background:color, borderRadius:4, transition:'width .4s ease' }} />
      </div>
    </div>
  )
}

export function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, color:'#5A6078', marginBottom:6, fontWeight:600, letterSpacing:'.02em' }}>{label}</label>
      {children}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width:'100%', padding:'9px 12px', fontSize:13,
  background:'#F7F8FA', border:'1.5px solid #E8EAF0',
  borderRadius:8, color:'#1A1D2E', outline:'none',
  fontFamily:"'Nunito Sans',sans-serif", fontWeight:500,
  transition:'border-color .15s, box-shadow .15s, background .15s'
}

export function Alert({ type='info', children }: { type?:'info'|'success'|'warn'|'danger'; children:React.ReactNode }) {
  const c = {
    info:    { bg:'#E3F2FD', color:'#1565C0', border:'#BBDEFB', icon:'ℹ' },
    success: { bg:'#E8FBF5', color:'#00695C', border:'#B3EAD9', icon:'✓' },
    warn:    { bg:'#FFF3E0', color:'#E65100', border:'#FFE0B2', icon:'⚠' },
    danger:  { bg:'#FFEBEE', color:'#B71C1C', border:'#FFCDD2', icon:'✕' },
  }[type]
  return (
    <div style={{ padding:'10px 14px', borderRadius:10, fontSize:12, lineHeight:1.6, background:c.bg, color:c.color, border:`1px solid ${c.border}`, margin:'10px 0', display:'flex', gap:8, alignItems:'flex-start' }}>
      <span style={{ fontWeight:700, marginTop:1 }}>{c.icon}</span>
      <span>{children}</span>
    </div>
  )
}

export function Badge({ children, type='info' }: { children:React.ReactNode; type?:'info'|'success'|'warn'|'danger'|'purple' }) {
  const c = {
    info:    { bg:'#E3F2FD', color:'#1565C0' },
    success: { bg:'#E8FBF5', color:'#007A5C' },
    warn:    { bg:'#FFF3E0', color:'#E65100' },
    danger:  { bg:'#FFEBEE', color:'#C62828' },
    purple:  { bg:'#EDE7F6', color:'#4527A0' },
  }[type]
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:c.bg, color:c.color }}>{children}</span>
}

export function PageHeader({ title, subtitle }: { title:string; subtitle?:string }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1A1D2E', marginBottom:4, letterSpacing:'-.02em', fontFamily:"'Nunito',sans-serif" }}>{title}</h1>
      {subtitle && <p style={{ fontSize:13, color:'#9EA6C0', fontWeight:500 }}>{subtitle}</p>}
    </div>
  )
}

export function SliderRow({ label, min, max, step=1, value, onChange, display }: { label:string; min:number; max:number; step?:number; value:number; onChange:(v:number)=>void; display:string }) {
  return (
    <Field label={label}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e=>onChange(parseFloat(e.target.value))}
          style={{ flex:1, height:4, background:'#E8EAF0', border:'none', padding:0, accentColor:'#00B386' }} />
        <span style={{ minWidth:50, textAlign:'right', fontFamily:'SF Mono,monospace', fontSize:13, fontWeight:700, color:'#1A1D2E', background:'#F7F8FA', padding:'4px 8px', borderRadius:6, border:'1px solid #E8EAF0' }}>{display}</span>
      </div>
    </Field>
  )
}

export function NumInput({ label, value, onChange, step, min, max }: { label:string; value:number; onChange:(v:number)=>void; step?:number; min?:number; max?:number }) {
  return (
    <Field label={label}>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={e=>onChange(parseFloat(e.target.value)||0)}
        style={inputStyle} />
    </Field>
  )
}

export function ResultBox({ children }: { children:React.ReactNode }) {
  return <div style={{ background:'#F7F8FA', borderRadius:10, padding:'14px 16px', border:'1px solid #F0F2F5' }}>{children}</div>
}

export function Btn({ children, onClick, variant='primary', full=false, style={} }: { children:React.ReactNode; onClick?:()=>void; variant?:'primary'|'ghost'|'danger'; full?:boolean; style?:React.CSSProperties }) {
  const styles = {
    primary: { background:'linear-gradient(135deg,#00B386,#00C896)', border:'none', color:'#fff', boxShadow:'0 4px 12px rgba(0,179,134,0.3)' },
    ghost:   { background:'#F7F8FA', border:'1.5px solid #E8EAF0', color:'#5A6078' },
    danger:  { background:'#FFEBEE', border:'1.5px solid #FFCDD2', color:'#C62828' },
  }
  return (
    <button onClick={onClick} style={{
      padding:'10px 20px', fontSize:13, fontWeight:700,
      fontFamily:"'Nunito Sans',sans-serif",
      borderRadius:10, cursor:'pointer', transition:'all .15s',
      width:full?'100%':'auto', letterSpacing:'.02em',
      ...styles[variant], ...style
    }}>{children}</button>
  )
}
