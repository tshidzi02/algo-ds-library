import { useState, useCallback, useRef } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Calendar from './components/Calendar'
import Income from './components/Income'
import Expenses from './components/Expenses'
import Transactions from './components/Transactions'
import Summary from './components/Summary'
import { Notification } from './components/UI'

const TABS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'calendar',     label: 'Calendar' },
  { id: 'income',       label: 'Income' },
  { id: 'expenses',     label: 'Expenses' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'summary',      label: 'Summary' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [notif, setNotif] = useState(null)
  const timerRef = useRef(null)

  const showNotif = useCallback((msg) => {
    setNotif({ msg })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setNotif(null), 2800)
  }, [])

  const views = {
    dashboard:    <Dashboard showNotif={showNotif} />,
    calendar:     <Calendar showNotif={showNotif} />,
    income:       <Income showNotif={showNotif} />,
    expenses:     <Expenses showNotif={showNotif} />,
    transactions: <Transactions showNotif={showNotif} />,
    summary:      <Summary />,
  }

  return (
    <>
      <Header />

      <nav style={{ background: '#ede8da', borderBottom: '2px solid #c8bfa8', display: 'flex', overflowX: 'auto', padding: '0 1rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              background: 'none', border: 'none',
              borderBottom: `3px solid ${active === tab.id ? '#b89a3a' : 'transparent'}`,
              padding: '0.75rem 1.1rem',
              fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
              cursor: 'pointer', color: active === tab.id ? '#0f0e0a' : '#6b6555',
              whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
        {views[active]}
      </main>

      <Notification notif={notif} />
    </>
  )
}
