// server.js — Budget App REST API
// Mirrors all Google Apps Script functions as HTTP endpoints

const express = require('express');
const cors    = require('cors');
const db      = require('./db');
const engine  = require('./engine');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Middleware: load fresh state for every request ───────────────────────────
app.use((req, res, next) => {
  req.state = db.load();
  next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ════════════════════════════════════════════════════════════════════════════
// CALENDAR  (populateMonthlyExpenses2026 / populateMonthlyIncome2026 / etc.)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/calendar/:year/:month
// Returns the full month grid with daily income, expenses, and balances
app.get('/api/calendar/:year/:month', (req, res) => {
  const year  = parseInt(req.params.year);
  const month = parseInt(req.params.month); // 0-based
  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return res.status(400).json({ error: 'Invalid year or month' });
  }
  const data = engine.getCalendarMonth(req.state, year, month);
  res.json(data);
});

// ════════════════════════════════════════════════════════════════════════════
// STARTING BALANCE  (setStartingBalanceFormulas)
// ════════════════════════════════════════════════════════════════════════════

// PUT /api/starting-balance/:year/:month
app.put('/api/starting-balance/:year/:month', (req, res) => {
  const year   = parseInt(req.params.year);
  const month  = parseInt(req.params.month);
  const { amount } = req.body;
  if (isNaN(year) || isNaN(month) || typeof amount !== 'number') {
    return res.status(400).json({ error: 'year, month (0-based) and amount required' });
  }
  const state = req.state;
  state.startingBalances[`${year}-${month}`] = amount;
  db.save(state);
  res.json({ year, month, startingBalance: amount });
});

// ════════════════════════════════════════════════════════════════════════════
// BUDGET SUMMARY  (BudgetSummaryDashboard / MonthlySummaries)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/summary?months=14
// Returns summary rows for N months ending at current month
app.get('/api/summary', (req, res) => {
  const count = Math.min(parseInt(req.query.months) || 14, 36);
  const now   = new Date();
  let year  = now.getFullYear();
  let month = now.getMonth();
  const rows = [];

  for (let i = 0; i < count; i++) {
    rows.push(engine.getMonthSummary(req.state, year, month));
    month--;
    if (month < 0) { month = 11; year--; }
  }

  res.json(rows);
});

// GET /api/summary/:year/:month — single month summary
app.get('/api/summary/:year/:month', (req, res) => {
  const year  = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'Invalid params' });
  res.json(engine.getMonthSummary(req.state, year, month));
});

// ════════════════════════════════════════════════════════════════════════════
// RECURRING INCOME  (REOCCURING_INCOME_* named ranges)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/income
app.get('/api/income', (req, res) => {
  res.json(req.state.recurringIncome);
});

// POST /api/income
app.post('/api/income', (req, res) => {
  const { name, amount, frequency, day } = req.body;
  if (!name || typeof amount !== 'number' || !frequency) {
    return res.status(400).json({ error: 'name, amount (number), frequency required' });
  }
  const state = req.state;
  const item = { id: state.nextId++, name, amount, frequency, day: day || null };
  state.recurringIncome.push(item);
  db.save(state);
  res.status(201).json(item);
});

// PUT /api/income/:id
app.put('/api/income/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const idx   = state.recurringIncome.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  state.recurringIncome[idx] = { ...state.recurringIncome[idx], ...req.body, id };
  db.save(state);
  res.json(state.recurringIncome[idx]);
});

// DELETE /api/income/:id
app.delete('/api/income/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const before = state.recurringIncome.length;
  state.recurringIncome = state.recurringIncome.filter(i => i.id !== id);
  if (state.recurringIncome.length === before) return res.status(404).json({ error: 'Not found' });
  db.save(state);
  res.json({ deleted: id });
});

// ════════════════════════════════════════════════════════════════════════════
// RECURRING EXPENSES  (REOCCURING_EXPENSES_* named ranges)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/expenses
app.get('/api/expenses', (req, res) => {
  res.json(req.state.recurringExpenses);
});

// POST /api/expenses
app.post('/api/expenses', (req, res) => {
  const { desc, amount, frequency, day, months } = req.body;
  if (!desc || typeof amount !== 'number' || !frequency) {
    return res.status(400).json({ error: 'desc, amount (number), frequency required' });
  }
  const state = req.state;
  const item = {
    id: state.nextId++,
    desc, amount, frequency,
    day: day || null,
    months: months || 'all'
  };
  state.recurringExpenses.push(item);
  db.save(state);
  res.status(201).json(item);
});

// PUT /api/expenses/:id
app.put('/api/expenses/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const idx   = state.recurringExpenses.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  state.recurringExpenses[idx] = { ...state.recurringExpenses[idx], ...req.body, id };
  db.save(state);
  res.json(state.recurringExpenses[idx]);
});

// DELETE /api/expenses/:id
app.delete('/api/expenses/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const before = state.recurringExpenses.length;
  state.recurringExpenses = state.recurringExpenses.filter(e => e.id !== id);
  if (state.recurringExpenses.length === before) return res.status(404).json({ error: 'Not found' });
  db.save(state);
  res.json({ deleted: id });
});

// ════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS  (SOURCE_EXPENSES / SOURCE_INCOME named ranges)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/transactions?year=2026&month=2&type=expense
app.get('/api/transactions', (req, res) => {
  let txs = [...req.state.transactions];

  if (req.query.year && req.query.month !== undefined) {
    const y = parseInt(req.query.year);
    const m = parseInt(req.query.month);
    txs = txs.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }
  if (req.query.type) {
    txs = txs.filter(t => t.type === req.query.type);
  }
  if (req.query.date) {
    txs = txs.filter(t => t.date === req.query.date);
  }

  // sort newest first
  txs.sort((a, b) => b.date.localeCompare(a.date));
  res.json(txs);
});

// POST /api/transactions
app.post('/api/transactions', (req, res) => {
  const { date, desc, amount, type, category } = req.body;
  if (!date || !desc || typeof amount !== 'number' || !type) {
    return res.status(400).json({ error: 'date, desc, amount (number), type required' });
  }
  if (!['income','expense'].includes(type)) {
    return res.status(400).json({ error: 'type must be "income" or "expense"' });
  }
  const state = req.state;
  const item = { id: state.nextId++, date, desc, amount, type, category: category || '' };
  state.transactions.push(item);
  db.save(state);
  res.status(201).json(item);
});

// PUT /api/transactions/:id
app.put('/api/transactions/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const idx   = state.transactions.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  state.transactions[idx] = { ...state.transactions[idx], ...req.body, id };
  db.save(state);
  res.json(state.transactions[idx]);
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const state = req.state;
  const before = state.transactions.length;
  state.transactions = state.transactions.filter(t => t.id !== id);
  if (state.transactions.length === before) return res.status(404).json({ error: 'Not found' });
  db.save(state);
  res.json({ deleted: id });
});

// ════════════════════════════════════════════════════════════════════════════
// runAllMonthlyUpdates — triggers MonthlySummaries for a range of months
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/run-monthly-updates', (req, res) => {
  const { year, month, count = 1 } = req.body;
  if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'year and month required' });
  const results = [];
  let y = parseInt(year), m = parseInt(month);
  for (let i = 0; i < count; i++) {
    results.push(engine.getMonthSummary(req.state, y, m));
    m++;
    if (m > 11) { m = 0; y++; }
  }
  res.json({ updated: results.length, summaries: results });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🟢 Budget API running at http://localhost:${PORT}`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/calendar/:year/:month`);
  console.log(`   GET  /api/summary`);
  console.log(`   GET/POST/PUT/DELETE  /api/income`);
  console.log(`   GET/POST/PUT/DELETE  /api/expenses`);
  console.log(`   GET/POST/PUT/DELETE  /api/transactions\n`);
});

module.exports = app;
