'use client'
import { useState } from 'react'

const base = {
  bg: '#0d1018', bg2: '#111520', bg3: '#161c28',
  border: '#1e2538', border2: '#263048',
  text: '#e8edf8', text2: '#8892b0', text3: '#4a5580',
  accent: '#5b6af0', accent2: '#818cf8',
  green: '#4ade80', red: '#f87171', amber: '#fbbf24',
  mono: "'DM Mono',monospace", display: "'Syne',sans-serif"
}

export function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: base.bg, border: `1px solid ${base.border}`, borderRadius: 14, padding: '18px 20px', ...style }}>{children}</div>
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: base.text3, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${base.border}` }}>{children}</div>
}

export function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: base.bg2, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: base.text3, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || base.text, fontFamily: base.mono }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: base.text2, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export function ResultRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${base.border}`, fontSize: 13 }}>
      <span style={{ color: base.text2 }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: base.mono, color: color || base.text }}>{value}</span>
    </div>
  )
}

export function ProgressBar({ pct, color = '#5b6af0', label, sublabel }: { pct: number; color?: string; label?: string; sublabel?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {(label || sublabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: base.text2, marginBottom: 6 }}>
          <span>{label}</span><span>{sublabel}</span>
        </div>
      )}
      <div style={{ height: 6, background: base.bg3, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 3, transition: 'width .4s ease' }} />
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: base.text2, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  background: base.bg2, border: `1px solid ${base.border}`,
  borderRadius: 9, color: base.text, outline: 'none', fontFamily: base.mono,
  transition: 'border-color .15s, box-shadow .15s'
}

export function Alert({ type = 'info', children }: { type?: 'info' | 'success' | 'warn' | 'danger'; children: React.ReactNode }) {
  const c = {
    info:    { bg: 'rgba(56,189,248,.08)',  color: '#38bdf8', border: 'rgba(56,189,248,.2)'  },
    success: { bg: 'rgba(74,222,128,.08)',  color: '#4ade80', border: 'rgba(74,222,128,.2)'  },
    warn:    { bg: 'rgba(251,191,36,.08)',  color: '#fbbf24', border: 'rgba(251,191,36,.2)'  },
    danger:  { bg: 'rgba(248,113,113,.08)', color: '#f87171', border: 'rgba(248,113,113,.2)' },
  }[type]
  return <div style={{ padding: '10px 14px', borderRadius: 9, fontSize: 12, lineHeight: 1.6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, margin: '10px 0' }}>{children}</div>
}

export function Badge({ children, type = 'info' }: { children: React.ReactNode; type?: 'info'|'success'|'warn'|'danger'|'purple' }) {
  const c = {
    info:    { bg: 'rgba(56,189,248,.1)',   color: '#38bdf8'  },
    success: { bg: 'rgba(74,222,128,.1)',   color: '#4ade80'  },
    warn:    { bg: 'rgba(251,191,36,.1)',   color: '#fbbf24'  },
    danger:  { bg: 'rgba(248,113,113,.1)',  color: '#f87171'  },
    purple:  { bg: 'rgba(129,140,248,.1)',  color: '#818cf8'  },
  }[type]
  return <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>{children}</span>
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: base.text, marginBottom: 4, letterSpacing: '-.02em' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: base.text2 }}>{subtitle}</p>}
    </div>
  )
}

export function SliderRow({ label, min, max, step = 1, value, onChange, display }: { label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; display: string }) {
  return (
    <Field label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#5b6af0', height: 4, background: '#161c28', border: 'none', padding: 0 }} />
        <span style={{ minWidth: 48, textAlign: 'right', fontFamily: base.mono, fontSize: 13, fontWeight: 600, color: base.text }}>{display}</span>
      </div>
    </Field>
  )
}

export function NumInput({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <Field label={label}>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={inputStyle} />
    </Field>
  )
}

export function ResultBox({ children }: { children: React.ReactNode }) {
  return <div style={{ background: base.bg2, borderRadius: 10, padding: '14px 16px' }}>{children}</div>
}

export function Btn({ children, onClick, variant = 'primary', full = false, style = {} }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'; full?: boolean; style?: React.CSSProperties }) {
  const styles = {
    primary: { background: '#5b6af0', border: 'none', color: '#fff' },
    ghost:   { background: 'transparent', border: `1px solid ${base.border2}`, color: base.text2 },
    danger:  { background: 'transparent', border: '1px solid rgba(248,113,113,.3)', color: '#f87171' },
  }
  return (
    <button onClick={onClick} style={{
      padding: '9px 18px', fontSize: 12, fontWeight: 600, fontFamily: "'Syne',sans-serif",
      borderRadius: 9, cursor: 'pointer', transition: 'all .15s',
      width: full ? '100%' : 'auto', letterSpacing: '.03em',
      ...styles[variant], ...style
    }}>{children}</button>
  )
}
