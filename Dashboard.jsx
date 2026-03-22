import { useEffect } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { fmt, fmtShort, MONTHS, FREQ_COLOR } from '../utils'
import { StatCard, Card, Loading, ErrorBox, Badge, Table, Tr, Td, SectionTitle, Accent } from './UI'

export default function Dashboard() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const { data: summary, loading: sl, error: se } = useApi(() => api.getMonthSummary(year, month), [])
  const { data: expenses } = useApi(() => api.getExpenses(), [])
  const { data: income } = useApi(() => api.getIncome(), [])

  const today = now.getDate()
  const upcoming = expenses
    ? expenses
        .filter(e => !e.day || e.day >= today)
        .filter(e => !e.months || e.months === 'all' || (Array.isArray(e.months) && e.months.includes(String(month + 1))))
        .sort((a, b) => (a.day || 0) - (b.day || 0))
        .slice(0, 8)
    : []

  return (
    <div>
      <SectionTitle>
        Overview <Accent>—</Accent>
        <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b6555' }}>{MONTHS[month]} {year}</span>
      </SectionTitle>

      {sl ? <Loading /> : se ? <ErrorBox message={se} /> : summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Planned Income"  value={fmtShort(summary.plannedIncome)} variant="inc-p" />
          <StatCard label="Actual Income"   value={fmtShort(summary.actualIncome)}  variant="inc-a" />
          <StatCard label="Expenses"        value={fmtShort(summary.expenses)}       variant="exp" />
          <StatCard label="Net Income"      value={fmtShort(summary.netIncome)}      variant="net" />
          <StatCard label="Closing Balance" value={fmtShort(summary.closingBalance)} variant="bal" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card title="Upcoming Expenses This Month">
          {!expenses ? <Loading /> : upcoming.length === 0 ? (
            <p style={{ color: '#6b6555', fontSize: 13 }}>No upcoming expenses.</p>
          ) : (
            <Table headers={['Day', 'Description', { label: 'Amount', right: true }]}>
              {upcoming.map(e => (
                <Tr key={e.id}>
                  <Td>{e.day || '?'}</Td>
                  <Td>{e.desc}</Td>
                  <Td right style={{ color: '#8b2020', fontWeight: 500 }}>{fmt(e.amount)}</Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Income Sources This Month">
          {!income ? <Loading /> : income.length === 0 ? (
            <p style={{ color: '#6b6555', fontSize: 13 }}>No income sources.</p>
          ) : (
            <Table headers={['Source', 'Frequency', { label: 'Est. Amount', right: true }]}>
              {income.map(i => (
                <Tr key={i.id}>
                  <Td>{i.name}</Td>
                  <Td><Badge label={i.frequency} /></Td>
                  <Td right style={{ color: '#2a5c3a', fontWeight: 500 }}>{fmt(i.amount)}</Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
