import { useState } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { fmt, FREQ_OPTIONS, MONTHS } from '../utils'
import { Card, Loading, ErrorBox, Badge, Table, Tr, Td, Button, Field, Input, Select, FormRow, SectionTitle, Accent } from './UI'

export default function Expenses({ showNotif }) {
  const { data, loading, error, reload } = useApi(() => api.getExpenses(), [])
  const [form, setForm] = useState({ desc: '', amount: '', frequency: 'Monthly', day: '', months: ['all'] })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleMonthsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value)
    set('months', selected)
  }

  const handleAdd = async () => {
    if (!form.desc.trim() || !form.amount) { showNotif('Description and amount required.'); return }
    setSaving(true)
    try {
      const months = form.months.includes('all') ? 'all' : form.months
      await api.addExpense({
        desc: form.desc.trim(),
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        day: form.day ? parseInt(form.day) : null,
        months,
      })
      showNotif(`"${form.desc}" added.`)
      setForm({ desc: '', amount: '', frequency: 'Monthly', day: '', months: ['all'] })
      reload()
    } catch (e) { showNotif(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, desc) => {
    if (!confirm(`Delete "${desc}"?`)) return
    try { await api.deleteExpense(id); showNotif('Deleted.'); reload() }
    catch (e) { showNotif(e.message) }
  }

  const monthLabel = (m) => {
    if (!m || m === 'all') return 'All Months'
    if (Array.isArray(m)) return m.map(v => MONTHS[parseInt(v) - 1]?.slice(0, 3)).join(', ')
    return 'All Months'
  }

  return (
    <div>
      <SectionTitle>Recurring <Accent>Expenses</Accent></SectionTitle>

      <Card title="Add Recurring Expense">
        <FormRow>
          <Field label="Description"><Input value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="e.g. Rent" /></Field>
          <Field label="Amount (ZAR)"><Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" /></Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </Select>
          </Field>
          <Field label="Day of Month"><Input type="number" value={form.day} onChange={e => set('day', e.target.value)} placeholder="e.g. 1" min="1" max="31" /></Field>
          <Field label="Active Months">
            <select
              multiple
              value={form.months}
              onChange={handleMonthsChange}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: '0.45rem 0.7rem', border: '1.5px solid #c8bfa8', borderRadius: 2, height: 85, width: '100%' }}
            >
              <option value="all">All Months</option>
              {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
          </Field>
        </FormRow>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleAdd} disabled={saving}>{saving ? 'Adding…' : '+ Add Expense'}</Button>
        </div>
      </Card>

      <Card title="Expense List">
        {loading ? <Loading /> : error ? <ErrorBox message={error} /> : (
          <Table headers={['Description', { label: 'Amount', right: true }, 'Frequency', 'Day', 'Months', '']}>
            {!data?.length
              ? <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#6b6555', fontSize: 13 }}>No expenses yet.</td></tr>
              : data.map(e => (
                <Tr key={e.id}>
                  <Td><strong>{e.desc}</strong></Td>
                  <Td right style={{ color: '#8b2020', fontWeight: 500 }}>{fmt(e.amount)}</Td>
                  <Td><Badge label={e.frequency} /></Td>
                  <Td>{e.day ? `Day ${e.day}` : '—'}</Td>
                  <Td style={{ fontSize: 11, color: '#6b6555' }}>{monthLabel(e.months)}</Td>
                  <Td>
                    <Button variant="danger" style={{ padding: '3px 9px', fontSize: 10 }} onClick={() => handleDelete(e.id, e.desc)}>Delete</Button>
                  </Td>
                </Tr>
              ))
            }
          </Table>
        )}
      </Card>
    </div>
  )
}
