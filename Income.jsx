import { useState } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { fmt, FREQ_OPTIONS } from '../utils'
import { Card, Loading, ErrorBox, Badge, Table, Tr, Td, Button, Field, Input, Select, FormRow, SectionTitle, Accent } from './UI'

export default function Income({ showNotif }) {
  const { data, loading, error, reload } = useApi(() => api.getIncome(), [])
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'Monthly', day: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async () => {
    if (!form.name.trim() || !form.amount) { showNotif('Name and amount required.'); return }
    setSaving(true)
    try {
      await api.addIncome({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        day: form.day ? parseInt(form.day) : null,
      })
      showNotif(`"${form.name}" added.`)
      setForm({ name: '', amount: '', frequency: 'Monthly', day: '' })
      reload()
    } catch (e) { showNotif(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await api.deleteIncome(id); showNotif('Deleted.'); reload() }
    catch (e) { showNotif(e.message) }
  }

  return (
    <div>
      <SectionTitle>Recurring <Accent>Income</Accent></SectionTitle>

      <Card title="Add Income Source">
        <FormRow>
          <Field label="Source Name"><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Salary" /></Field>
          <Field label="Amount (ZAR)"><Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" /></Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </Select>
          </Field>
          <Field label="Day of Month"><Input type="number" value={form.day} onChange={e => set('day', e.target.value)} placeholder="e.g. 25" min="1" max="31" /></Field>
        </FormRow>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleAdd} disabled={saving}>{saving ? 'Adding…' : '+ Add Income'}</Button>
        </div>
      </Card>

      <Card title="Income Sources">
        {loading ? <Loading /> : error ? <ErrorBox message={error} /> : (
          <Table headers={['Source', { label: 'Amount', right: true }, 'Frequency', 'Day', '']}>
            {!data?.length
              ? <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#6b6555', fontSize: 13 }}>No income sources yet.</td></tr>
              : data.map(i => (
                <Tr key={i.id}>
                  <Td><strong>{i.name}</strong></Td>
                  <Td right style={{ color: '#2a5c3a', fontWeight: 500 }}>{fmt(i.amount)}</Td>
                  <Td><Badge label={i.frequency} /></Td>
                  <Td>{i.day ? `Day ${i.day}` : '—'}</Td>
                  <Td>
                    <Button variant="danger" style={{ padding: '3px 9px', fontSize: 10 }} onClick={() => handleDelete(i.id, i.name)}>Delete</Button>
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
