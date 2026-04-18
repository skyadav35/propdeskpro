'use client'
// components/ui/index.tsx
// Shared UI primitives used across all dashboard pages

import { useState } from 'react'

/* ─── Card ─────────────────────────────────────────────────────── */
export function Card({ children, className = '', style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  return (
    <div style={{
      background: '#13151a', border: '1px solid #2a2e38',
      borderRadius: 12, padding: 20, ...style
    }} className={className}>
      {children}
    </div>
  )
}

/* ─── Section title ─────────────────────────────────────────────── */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
      color: '#404660', marginBottom: 12, paddingBottom: 8,
      borderBottom: '1px solid #1e2235'
    }}>
      {children}
    </div>
  )
}

/* ─── Metric card ───────────────────────────────────────────────── */
export function MetricCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div style={{ background: '#1c2030', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', color: '#404660', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#dde2f0', fontFamily: 'monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#565a6e', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/* ─── Result row ────────────────────────────────────────────────── */
export function ResultRow({ label, value, color }: {
  label: string; value: string; color?: string
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: '1px solid #1e2235', fontSize: 13
    }}>
      <span style={{ color: '#7a82a0' }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: color || '#dde2f0' }}>{value}</span>
    </div>
  )
}

/* ─── Progress bar ──────────────────────────────────────────────── */
export function ProgressBar({ pct, color = '#4d9fff', label, sublabel }: {
  pct: number; color?: string; label?: string; sublabel?: string
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      {(label || sublabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#565a6e', marginBottom: 5 }}>
          <span>{label}</span><span>{sublabel}</span>
        </div>
      )}
      <div style={{ height: 6, background: '#1c2030', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

/* ─── Input field ───────────────────────────────────────────────── */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#565a6e', marginBottom: 5, letterSpacing: '.04em' }}>{label}</label>
      {children}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  background: '#1c2030', border: '1px solid #2a2e38',
  borderRadius: 8, color: '#dde2f0', outline: 'none', fontFamily: 'monospace'
}

export const selectStyle: React.CSSProperties = {
  ...({} as any), // inherit inputStyle below
  width: '100%', padding: '8px 10px', fontSize: 13,
  background: '#1c2030', border: '1px solid #2a2e38',
  borderRadius: 8, color: '#dde2f0', outline: 'none'
}

/* ─── Alert ─────────────────────────────────────────────────────── */
export function Alert({ type = 'info', children }: {
  type?: 'info' | 'success' | 'warn' | 'danger'; children: React.ReactNode
}) {
  const colors = {
    info:    { bg: '#081830', color: '#4d9fff', border: '#0c2d5a' },
    success: { bg: '#0a2218', color: '#3ddc84', border: '#0d4020' },
    warn:    { bg: '#231500', color: '#f5a623', border: '#3a2000' },
    danger:  { bg: '#1f0a0a', color: '#ff5c5c', border: '#5a1a1a' },
  }
  const c = colors[type]
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.6,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`, margin: '10px 0' }}>
      {children}
    </div>
  )
}

/* ─── Badge / pill ──────────────────────────────────────────────── */
export function Badge({ children, type = 'info' }: {
  children: React.ReactNode; type?: 'info' | 'success' | 'warn' | 'danger' | 'purple'
}) {
  const colors = {
    info:    { bg: '#081830', color: '#4d9fff' },
    success: { bg: '#0a2218', color: '#3ddc84' },
    warn:    { bg: '#231500', color: '#f5a623' },
    danger:  { bg: '#1f0a0a', color: '#ff5c5c' },
    purple:  { bg: '#16103a', color: '#818cf8' },
  }
  const c = colors[type]
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>
      {children}
    </span>
  )
}

/* ─── Page header ───────────────────────────────────────────────── */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#dde2f0', marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: '#7a82a0' }}>{subtitle}</p>}
    </div>
  )
}

/* ─── Slider row ────────────────────────────────────────────────── */
export function SliderRow({ label, min, max, step = 1, value, onChange, display }: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; display: string
}) {
  return (
    <Field label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#5b6af0' }} />
        <span style={{ minWidth: 44, textAlign: 'right', fontFamily: 'monospace', fontSize: 13,
          fontWeight: 600, color: '#dde2f0' }}>{display}</span>
      </div>
    </Field>
  )
}

/* ─── Number input ──────────────────────────────────────────────── */
export function NumInput({ label, value, onChange, step, min, max }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; max?: number
}) {
  return (
    <Field label={label}>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={inputStyle} />
    </Field>
  )
}

/* ─── Result box wrapper ────────────────────────────────────────── */
export function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#1c2030', borderRadius: 10, padding: '14px 16px' }}>
      {children}
    </div>
  )
}

/* ─── Button ────────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', full = false, style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger'; full?: boolean; style?: React.CSSProperties
}) {
  const styles = {
    primary: { background: '#5b6af0', border: 'none', color: '#fff' },
    ghost:   { background: 'transparent', border: '1px solid #2a2f45', color: '#7a82a0' },
    danger:  { background: 'transparent', border: '1px solid #3d1010', color: '#ff5c5c' },
  }
  return (
    <button onClick={onClick} style={{
      padding: '9px 18px', fontSize: 12, fontWeight: 600,
      borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
      width: full ? '100%' : 'auto', letterSpacing: '.04em',
      ...styles[variant], ...style
    }}>
      {children}
    </button>
  )
}
