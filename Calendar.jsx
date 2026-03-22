import { useState, useCallback } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { fmt, MONTHS } from '../utils'
import { Loading, ErrorBox, Button, Field, Input, Select, Modal } from './UI'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function SummaryBar({ data }) {
  const items = [
    { label: 'Expenses', value: fmt(data.totalExpenses), color: '#e08080' },
    { label: 'Income', value: fmt(data.totalIncome), color: '#80c894' },
    { label: 'Net', value: fmt(data.netIncome), color: '#c094e0' },
    { label: 'Closing Balance', value: fmt(data.closingBalance), color: '#d4b55a' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0f0e0a', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '1rem 1.2rem', borderRight: i < 3 ? '1px solid #2a2922' : 'none' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#b8b0a0', marginBottom: 4 }}>{item.label}</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}

function DayCell({ dayInfo, isToday, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <td
      style={{
        border: '1.5px solid #c8bfa8', verticalAlign: 'top',
        height: 120, width: '14.28%', padding: 0,
        background: hover ? '#faf7f0' : 'white', transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        onClick={onClick}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '4px 7px', cursor: 'pointer',
          background: isToday ? '#b89a3a' : '#ede8da',
          borderBottom: '1px solid #c8bfa8',
        }}
      >
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700 }}>
          {dayInfo.day}
        </span>
        {hover && <span style={{ fontSize: 12, color: '#6b6555' }}>+</span>}
      </div>
      <div style={{ padding: '4px 7px', fontSize: 11, lineHeight: 1.6 }}>
        {dayInfo.totalExpenses > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b2020' }}>
            <span>Exp</span><span>{fmt(dayInfo.totalExpenses)}</span>
          </div>
        )}
        {dayInfo.totalIncome > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2a5c3a' }}>
            <span>Inc</span><span>{fmt(dayInfo.totalIncome)}</span>
          </div>
        )}
        {(dayInfo.totalExpenses > 0 || dayInfo.totalIncome > 0) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a3a5c', fontWeight: 600, borderTop: '1px dashed #c8bfa8', marginTop: 2, paddingTop: 2 }}>
            <span>Bal</span><span>{fmt(dayInfo.balance)}</span>
          </div>
        )}
      </div>
    </td>
  )
}

function DayModal({ open, day, calData, onClose, onAdded }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open || !calData || !day) return null
  const info = calData.days.find(d => d.day === day) || {}
  const dateStr = `${calData.year}-${String(calData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const handleAdd = async () => {
    if (!desc.trim() || !amount || isNaN(parseFloat(amount))) return
    setSaving(true)
    try {
      await api.addTransaction({ date: dateStr, desc: desc.trim(), amount: parseFloat(amount), type, category })
      setDesc(''); setAmount(''); setCategory('')
      onAdded()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await api.deleteTransaction(id)
    onAdded()
  }

  return (
    <Modal open={open} title={`${MONTHS[calData.month]} ${day}, ${calData.year}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#fdf0f0', padding: '0.7rem', borderRadius: 2 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#6b6555', marginBottom: 3 }}>Expenses</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#8b2020' }}>{fmt(info.totalExpenses || 0)}</div>
        </div>
        <div style={{ background: '#edf7f0', padding: '0.7rem', borderRadius: 2 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#6b6555', marginBottom: 3 }}>Income</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#2a5c3a' }}>{fmt(info.totalIncome || 0)}</div>
        </div>
        <div style={{ background: '#fff4e8', padding: '0.7rem', borderRadius: 2, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#6b6555', marginBottom: 3 }}>Daily Balance</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#b85a10' }}>{fmt(info.balance || 0)}</div>
        </div>
      </div>

      {info.expenses?.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555', marginBottom: 6 }}>Expenses</div>
          {info.expenses.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #e8e2d6', fontSize: 13 }}>
              <span style={{ flex: 1 }}>{e.name}{e.recurring && <span style={{ fontSize: 10, color: '#6b6555' }}> (recurring)</span>}</span>
              <span style={{ color: '#8b2020', fontWeight: 600 }}>{fmt(e.amount)}</span>
              {e.id && <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', color: '#8b2020', cursor: 'pointer', fontSize: 16 }}>×</button>}
            </div>
          ))}
        </>
      )}

      {info.income?.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555', marginBottom: 6, marginTop: 12 }}>Income</div>
          {info.income.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #e8e2d6', fontSize: 13 }}>
              <span style={{ flex: 1 }}>{e.name}{e.recurring && <span style={{ fontSize: 10, color: '#6b6555' }}> (recurring)</span>}</span>
              <span style={{ color: '#2a5c3a', fontWeight: 600 }}>{fmt(e.amount)}</span>
              {e.id && <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', color: '#8b2020', cursor: 'pointer', fontSize: 16 }}>×</button>}
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #c8bfa8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555', marginBottom: 8 }}>Quick Add Transaction</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <Field label="Description"><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Coffee" /></Field>
          <Field label="Amount (ZAR)"><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" /></Field>
          <Field label="Type">
            <Select value={type} onChange={e => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </Field>
          <Field label="Category"><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Food" /></Field>
        </div>
        <Button onClick={handleAdd} disabled={saving}>{saving ? 'Adding…' : 'Add Transaction'}</Button>
      </div>
    </Modal>
  )
}

export default function Calendar({ showNotif }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [startBalInput, setStartBalInput] = useState('')
  const [balTimer, setBalTimer] = useState(null)

  const { data: calData, loading, error, reload } = useApi(() => api.getCalendar(year, month), [year, month])

  const navigate = (dir) => {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  const handleStartBal = (val) => {
    setStartBalInput(val)
    clearTimeout(balTimer)
    setBalTimer(setTimeout(async () => {
      try {
        await api.setStartingBalance(year, month, parseFloat(val) || 0)
        reload()
        showNotif(`Starting balance updated`)
      } catch (e) { showNotif(e.message) }
    }, 600))
  }

  const todayY = now.getFullYear(), todayM = now.getMonth(), todayD = now.getDate()
  const dayMap = calData ? Object.fromEntries(calData.days.map(d => [d.day, d])) : {}

  // Build calendar grid
  const grid = []
  if (calData) {
    const total = Math.ceil((calData.daysInMonth + calData.startWeekday) / 7) * 7
    for (let i = 0; i < total; i++) {
      const dayN = i - calData.startWeekday + 1
      grid.push(dayN >= 1 && dayN <= calData.daysInMonth ? dayN : null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => navigate(i === 0 ? -1 : 1)} style={{
              background: 'white', border: '1.5px solid #c8bfa8', width: 34, height: 34,
              borderRadius: 2, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {arrow}
            </button>
          ))}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900 }}>
          {calData ? calData.monthName : `${MONTHS[month]} ${year}`}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6555' }}>Starting Balance</label>
          <Input
            type="number" step="100" placeholder={calData ? Math.round(calData.startingBalance) : '0'}
            value={startBalInput} onChange={e => handleStartBal(e.target.value)}
            style={{ width: 140 }}
          />
        </div>
      </div>

      {calData && <SummaryBar data={calData} />}

      {loading ? <Loading text="Loading calendar…" /> : error ? <ErrorBox message={error} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                {DAYS.map(d => (
                  <th key={d} style={{ background: '#0f0e0a', color: '#d4b55a', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem', textAlign: 'center', border: '1px solid #2a2922' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: grid.length / 7 }, (_, r) => (
                <tr key={r}>
                  {grid.slice(r * 7, r * 7 + 7).map((dayN, c) => (
                    dayN === null
                      ? <td key={c} style={{ border: '1.5px solid #c8bfa8', background: '#ede8da', height: 120 }} />
                      : <DayCell
                          key={c}
                          dayInfo={dayMap[dayN] || { day: dayN, totalExpenses: 0, totalIncome: 0, balance: 0 }}
                          isToday={todayY === year && todayM === month && todayD === dayN}
                          onClick={() => setSelectedDay(dayN)}
                        />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DayModal
        open={selectedDay !== null}
        day={selectedDay}
        calData={calData}
        onClose={() => setSelectedDay(null)}
        onAdded={() => { reload(); }}
      />
    </div>
  )
}
