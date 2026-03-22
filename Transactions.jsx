import { useState } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { fmt, toDateStr } from '../utils'
import { Card, Loading, ErrorBox, Badge, Table, Tr, Td, Button, Field, Input, Select, FormRow, SectionTitle, Accent } from './UI'

export default function Transactions({ showNotif }) {
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({ date: toDateStr(now), desc: '', amount: '', type: 'expense', category: '' })
  const [saving, setSaving] = useState(false)

  const buildFilters = () => {
    if (!filterMonth) return filterType ? { type: filterType } : {}
    const [y, m] = filterMonth.split('-')
    return { year: parseInt(y), month: parseInt(m) - 1, ...(filterType ? { type: filterType } : {}) }
  }

  const { data, loading, error, reload } = useApi(() => api.getTransactions(buildFilters()), [filterMonth, filterType])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async () => {
    if (!form.date || !form.desc.trim() || !form.amount) { showNotif('Fill all required fields.'); return }
    setSaving(true)
    try {
      await api.addTransaction({ ...form, amount: parseFloat(form.amount), desc: form.desc.trim() })
      showNotif(`"${form.desc}" logged.`)
      setForm(f => ({ ...f, desc: '', amount: '', category: '' }))
      reload()
    } catch (e) { showNotif(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try { await api.deleteTransaction(id); showNotif('Deleted.'); reload() }
    catch (e) { showNotif(e.message) }
  }

  return (
    <div>
      <SectionTitle>Source <Accent>Transactions</Accent></SectionTitle>

      <Card title="Log Transaction">
        <FormRow>
          <Field label="Date"><Input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
          <Field label="Description"><Input value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="e.g. Grocery run" /></Field>
          <Field label="Amount (ZAR)"><Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </Field>
          <Field label="Category"><Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Food" /></Field>
        </FormRow>
        <Button onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : '+ Log Transaction'}</Button>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6555' }}>All Transactions</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="month" value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: '4px 8px', border: '1.5px solid #c8bfa8', borderRadius: 2 }}
            />
            <select
              value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: '4px 8px', border: '1.5px solid #c8bfa8', borderRadius: 2 }}
            >
              <option value="">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        {loading ? <Loading /> : error ? <ErrorBox message={error} /> : (
          <Table headers={['Date', 'Description', 'Category', 'Type', { label: 'Amount', right: true }, '']}>
            {!data?.length
              ? <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#6b6555', fontSize: 13 }}>No transactions found.</td></tr>
              : data.map(t => {
                  const d = new Date(t.date + 'T00:00:00')
                  const dl = d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <Tr key={t.id}>
                      <Td style={{ whiteSpace: 'nowrap' }}>{dl}</Td>
                      <Td>{t.desc}</Td>
                      <Td style={{ color: '#6b6555', fontSize: 11 }}>{t.category || '—'}</Td>
                      <Td><Badge label={t.type} variant={t.type} /></Td>
                      <Td right style={{ color: t.type === 'income' ? '#2a5c3a' : '#8b2020', fontWeight: 500 }}>{fmt(t.amount)}</Td>
                      <Td>
                        <Button variant="danger" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => handleDelete(t.id)}>×</Button>
                      </Td>
                    </Tr>
                  )
                })
            }
          </Table>
        )}
      </Card>
    </div>
  )
}
