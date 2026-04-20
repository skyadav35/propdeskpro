'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard',           label: 'Overview',    icon: '▣' },
  { href: '/dashboard/challenge', label: 'Challenge',   icon: '◎' },
  { href: '/dashboard/risk',      label: 'Risk Mgr',    icon: '◈' },
  { href: '/dashboard/journal',   label: 'Journal',     icon: '◧' },
  { href: '/dashboard/stacker',   label: 'Multi-Acct',  icon: '◫' },
  { href: '/dashboard/simulator', label: 'Simulator',   icon: '◬' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080a10', fontFamily:"'Syne',sans-serif" }}>
      <aside style={{
        width: 220, background: '#0d1018',
        borderRight: '1px solid #1e2538',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e2538' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: '#5b6af0',
              borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, flexShrink: 0
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#e8edf8', letterSpacing: '.01em' }}>FundPro Plus</div>
              <div style={{ fontSize: 10, color: '#4a5580', letterSpacing: '.06em', textTransform: 'uppercase' }}>Prop Firm Tools</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {nav.map(item => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2538' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserButton afterSignOutUrl="/" />
            <div>
              <div style={{ fontSize: 12, color: '#8892b0' }}>Account</div>
              <div style={{ fontSize: 10, color: '#4a5580' }}>Manage profile</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 9, marginBottom: 2,
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#818cf8' : '#8892b0',
      textDecoration: 'none',
      background: active ? 'rgba(91,106,240,.12)' : 'transparent',
      transition: 'all .15s',
      borderLeft: active ? '2px solid #5b6af0' : '2px solid transparent',
    }}>
      <span style={{ fontSize: 15, opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </Link>
  )
}
