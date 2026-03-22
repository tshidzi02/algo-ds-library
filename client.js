const BASE = '/api'

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  health: () => request('/health'),

  // Calendar
  getCalendar: (year, month) => request(`/calendar/${year}/${month}`),

  // Starting balance
  setStartingBalance: (year, month, amount) =>
    request(`/starting-balance/${year}/${month}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    }),

  // Summary
  getSummary: (months = 14) => request(`/summary?months=${months}`),
  getMonthSummary: (year, month) => request(`/summary/${year}/${month}`),

  // Recurring Income
  getIncome: () => request('/income'),
  addIncome: (data) => request('/income', { method: 'POST', body: JSON.stringify(data) }),
  updateIncome: (id, data) => request(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIncome: (id) => request(`/income/${id}`, { method: 'DELETE' }),

  // Recurring Expenses
  getExpenses: () => request('/expenses'),
  addExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.year != null) params.set('year', filters.year)
    if (filters.month != null) params.set('month', filters.month)
    if (filters.type) params.set('type', filters.type)
    if (filters.date) params.set('date', filters.date)
    const qs = params.toString()
    return request('/transactions' + (qs ? '?' + qs : ''))
  },
  addTransaction: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
}
