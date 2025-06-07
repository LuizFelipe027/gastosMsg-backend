const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./gastos.db')

// Tabelas
db.run(`CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT,
  valor REAL,
  data TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,
  valor TEXT
)`)

module.exports = db
