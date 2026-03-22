// db.js — simple JSON file-based data store (drop-in; swap for SQLite/Postgres in production)
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  nextId: 20,
  startingBalances: {},
  recurringIncome: [
    { id: 1, name: 'Salary',    amount: 25000, frequency: 'Monthly',  day: 25 },
    { id: 2, name: 'Freelance', amount: 5000,  frequency: 'Monthly',  day: 28 }
  ],
  recurringExpenses: [
    { id: 1, desc: 'Rent',          amount: 8500, frequency: 'Monthly', day: 1,  months: 'all' },
    { id: 2, desc: 'Groceries',     amount: 3000, frequency: 'Monthly', day: 15, months: 'all' },
    { id: 3, desc: 'Netflix',       amount: 199,  frequency: 'Monthly', day: 5,  months: 'all' },
    { id: 4, desc: 'Electricity',   amount: 1200, frequency: 'Monthly', day: 20, months: 'all' },
    { id: 5, desc: 'Car Insurance', amount: 950,  frequency: 'Monthly', day: 1,  months: 'all' }
  ],
  transactions: []
};

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('DB read error:', e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
