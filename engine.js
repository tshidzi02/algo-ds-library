// engine.js — pure budget calculation logic, ported from Google Apps Script
// Mirrors: DAILY_INCOME_2026, DAILY_EXPENSES_2026, DAILY_BALANCE, FIRST_DAY_BALANCE, etc.

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Frequency amount for a given month ──────────────────────────────────────
function freqAmount(item, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  switch (item.frequency) {
    case 'Monthly':   return item.amount;
    case 'Weekly':    return item.amount * (daysInMonth / 7);
    case 'Bi-weekly': return item.amount * (daysInMonth / 14);
    case 'Annual':    return item.amount / 12;
    default:          return 0;
  }
}

// ── Is expense active this month? ────────────────────────────────────────────
function expenseActiveInMonth(exp, month) {
  if (!exp.months || exp.months === 'all') return true;
  if (Array.isArray(exp.months)) return exp.months.includes(String(month + 1));
  return true;
}

// ── DAILY_EXPENSES_2026 equivalent ──────────────────────────────────────────
function getDailyExpenses(state, year, month, day) {
  const items = [];

  for (const exp of state.recurringExpenses) {
    if (!expenseActiveInMonth(exp, month)) continue;

    if (exp.frequency === 'Monthly' && exp.day === day) {
      items.push({ name: exp.desc, amount: exp.amount, recurring: true, recurringId: exp.id });
    } else if (exp.frequency === 'Weekly' && exp.day) {
      // find weekly occurrences that land on this day
      const target = new Date(year, month, day);
      const anchor = new Date(year, month, exp.day);
      const diff = Math.round((target - anchor) / 86400000);
      if (diff >= 0 && diff % 7 === 0) {
        items.push({ name: exp.desc, amount: exp.amount, recurring: true, recurringId: exp.id });
      }
    } else if (exp.frequency === 'Bi-weekly' && exp.day) {
      const target = new Date(year, month, day);
      const anchor = new Date(year, month, exp.day);
      const diff = Math.round((target - anchor) / 86400000);
      if (diff >= 0 && diff % 14 === 0) {
        items.push({ name: exp.desc, amount: exp.amount, recurring: true, recurringId: exp.id });
      }
    }
  }

  // source transactions
  const dateStr = toDateStr(year, month, day);
  for (const t of state.transactions) {
    if (t.date === dateStr && t.type === 'expense') {
      items.push({ name: t.desc, amount: t.amount, id: t.id, category: t.category });
    }
  }

  return items;
}

// ── DAILY_INCOME_2026 equivalent ─────────────────────────────────────────────
function getDailyIncome(state, year, month, day) {
  const items = [];

  for (const inc of state.recurringIncome) {
    if (inc.frequency === 'Monthly' && inc.day === day) {
      items.push({ name: inc.name, amount: inc.amount, recurring: true, recurringId: inc.id });
    } else if (inc.frequency === 'Weekly' && inc.day) {
      const target = new Date(year, month, day);
      const anchor = new Date(year, month, inc.day);
      const diff = Math.round((target - anchor) / 86400000);
      if (diff >= 0 && diff % 7 === 0) {
        items.push({ name: inc.name, amount: inc.amount, recurring: true, recurringId: inc.id });
      }
    }
  }

  const dateStr = toDateStr(year, month, day);
  for (const t of state.transactions) {
    if (t.date === dateStr && t.type === 'income') {
      items.push({ name: t.desc, amount: t.amount, id: t.id, category: t.category });
    }
  }

  return items;
}

// ── FIRST_DAY_BALANCE / DAILY_BALANCE ────────────────────────────────────────
function computeDailyBalances(state, year, month) {
  const startBal = getStartingBalance(state, year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const balances = {};
  let running = startBal;

  for (let d = 1; d <= daysInMonth; d++) {
    const exp = getDailyExpenses(state, year, month, d).reduce((s, i) => s + i.amount, 0);
    const inc = getDailyIncome(state, year, month, d).reduce((s, i) => s + i.amount, 0);
    running = running - exp + inc;
    balances[d] = running;
  }

  return balances;
}

// ── Closing balance = INDEX(FILTER(FLATTEN(...))) pattern ────────────────────
function getClosingBalance(state, year, month) {
  const balances = computeDailyBalances(state, year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Find the last day that has any activity (non-zero delta), fallback to last day
  return balances[daysInMonth] ?? 0;
}

// ── Starting balance chains from previous month ──────────────────────────────
function getStartingBalance(state, year, month) {
  const key = `${year}-${month}`;
  if (state.startingBalances[key] !== undefined) return state.startingBalances[key];
  // chain: previous month's closing balance
  if (month === 0) return getClosingBalance(state, year - 1, 11);
  return getClosingBalance(state, year, month - 1);
}

// ── Monthly totals (MonthlySummaries function) ───────────────────────────────
function getMonthSummary(state, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalExpenses = 0, totalIncome = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    totalExpenses += getDailyExpenses(state, year, month, d).reduce((s, i) => s + i.amount, 0);
    totalIncome   += getDailyIncome(state,   year, month, d).reduce((s, i) => s + i.amount, 0);
  }

  // plannedIncome = recurring only (no ad-hoc transactions)
  const plannedIncome = state.recurringIncome.reduce((s, i) => s + freqAmount(i, year, month), 0);
  const netIncome = Math.max(0, totalIncome - totalExpenses);
  const closingBalance = getClosingBalance(state, year, month);
  const startingBalance = getStartingBalance(state, year, month);

  return {
    month: `${MONTHS_SHORT[month]} ${year}`,
    monthFull: `${['January','February','March','April','May','June','July','August','September','October','November','December'][month]} ${year}`,
    plannedIncome,
    actualIncome: totalIncome,
    expenses: totalExpenses,
    netIncome,
    closingBalance,
    startingBalance
  };
}

// ── Calendar data (full month grid) ──────────────────────────────────────────
function getCalendarMonth(state, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const balances = computeDailyBalances(state, year, month);
  const days = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const expenses = getDailyExpenses(state, year, month, d);
    const income   = getDailyIncome(state, year, month, d);
    days.push({
      day: d,
      date: toDateStr(year, month, d),
      weekday: new Date(year, month, d).getDay(),
      expenses,
      income,
      totalExpenses: expenses.reduce((s, i) => s + i.amount, 0),
      totalIncome:   income.reduce((s, i) => s + i.amount, 0),
      balance: balances[d]
    });
  }

  const summary = getMonthSummary(state, year, month);

  return {
    year, month,
    monthName: summary.monthFull,
    startWeekday,
    daysInMonth,
    startingBalance: getStartingBalance(state, year, month),
    closingBalance: summary.closingBalance,
    totalExpenses: summary.expenses,
    totalIncome: summary.actualIncome,
    plannedIncome: summary.plannedIncome,
    netIncome: summary.netIncome,
    days
  };
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

module.exports = {
  getCalendarMonth,
  getMonthSummary,
  getDailyExpenses,
  getDailyIncome,
  getClosingBalance,
  getStartingBalance,
  computeDailyBalances,
  freqAmount,
  expenseActiveInMonth
};
