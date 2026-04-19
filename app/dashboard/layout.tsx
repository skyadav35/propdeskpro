// app/dashboard/layout.tsx
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

const navItems = [
  { href: '/dashboard',            label: 'Overview',    icon: '▣' },
  { href: '/dashboard/challenge',  label: 'Challenge',   icon: '◎' },
  { href: '/dashboard/risk',       label: 'Risk Mgr',    icon: '◈' },
  { href: '/dashboard/journal',    label: 'Journal',     icon: '◧' },
  { href: '/dashboard/stacker',    label: 'Multi-Acct',  icon: '◫' },
  { href: '/dashboard/simulator',  label: 'Simulator',   icon: '◬' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0e11', color: '#e8eaf0', fontFamily: 'system-ui' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#13151a', borderRight: '1px solid #2a2e38',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh'
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #2a2e38' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#6366f1', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>FundPro Plus</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, marginBottom: 2, fontSize: 13, color: '#8b8fa8',
              textDecoration: 'none', transition: 'all .15s',
            }}
            className="nav-link"
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2e38' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserButton afterSignOutUrl="/" />
            <span style={{ fontSize: 12, color: '#565a6e' }}>Account</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: 28, maxWidth: '100%' }}>
        {children}
      </main>
    </div>
  )
}
