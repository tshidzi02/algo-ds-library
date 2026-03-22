import { useApi } from '../hooks/useApi'
import { api } from '../api/client'
import { fmt, fmtShort } from '../utils'
import { Loading, ErrorBox, Table, Tr, Td, SectionTitle, Accent } from './UI'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f0e0a', color: '#f5f0e8', padding: '0.75rem 1rem', borderRadius: 2, fontSize: 12, boxShadow: '4px 4px 0 #c8bfa8' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {fmtShort(p.value)}</div>
      ))}
    </div>
  )
}

export default function Summary() {
  const { data, loading, error } = useApi(() => api.getSummary(14), [])

  // Reverse for chart (oldest first)
  const chartData = data ? [...data].reverse().map(r => ({
    name: r.month,
    Income: Math.round(r.actualIncome),
    Expenses: Math.round(r.expenses),
    Balance: Math.round(r.closingBalance),
  })) : []

  return (
    <div>
      <SectionTitle>Budget <Accent>Summary</Accent></SectionTitle>

      {loading ? <Loading /> : error ? <ErrorBox message={error} /> : (
        <>
          {/* Chart */}
          <div style={{ background: 'white', border: '1.5px solid #c8bfa8', borderRadius: 2, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '3px 3px 0 #c8bfa8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555', marginBottom: '1rem' }}>
              Income vs Expenses (14 months)
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "'DM Mono', monospace", fill: '#6b6555' }} />
                <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 10, fontFamily: "'DM Mono', monospace", fill: '#6b6555' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                <Bar dataKey="Income" fill="#2a5c3a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Expenses" fill="#8b2020" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Balance" fill="#b89a3a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={{ background: 'white', border: '1.5px solid #c8bfa8', borderRadius: 2, boxShadow: '3px 3px 0 #c8bfa8', overflow: 'hidden' }}>
            <Table headers={[
              'Month',
              { label: 'Planned Income', right: true },
              { label: 'Actual Income', right: true },
              { label: 'Expenses', right: true },
              { label: 'Net', right: true },
              { label: 'Closing Balance', right: true },
            ]}>
              {data.map((r, i) => (
                <Tr key={i}>
                  <Td style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{r.monthFull}</Td>
                  <Td right style={{ color: '#2a5c3a', fontWeight: 500 }}>{fmt(r.plannedIncome)}</Td>
                  <Td right style={{ color: '#a07a00', fontWeight: 500 }}>{fmt(r.actualIncome)}</Td>
                  <Td right style={{ color: '#8b2020', fontWeight: 500 }}>{fmt(r.expenses)}</Td>
                  <Td right style={{ color: r.netIncome >= 0 ? '#2a5c3a' : '#8b2020', fontWeight: 500 }}>{fmt(r.netIncome)}</Td>
                  <Td right style={{ color: '#b85a10', fontWeight: 600 }}>{fmt(r.closingBalance)}</Td>
                </Tr>
              ))}
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
