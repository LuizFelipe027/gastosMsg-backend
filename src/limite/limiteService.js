const db = require('../../database/db')

function get(req, res) {
  db.get(`SELECT valor FROM config WHERE chave = 'limite'`, (err, row) => {
    if (err) {
      console.error('Erro ao buscar limite:', err)
      return res.status(500).json({ erro: 'Erro ao buscar limite' })
    }

    const limite = row ? parseFloat(row.valor) : 0
    res.json({ limite })
  })
}

function set(req, res) {
  const { valor } = req.body
  db.run(`INSERT OR REPLACE INTO config (chave, valor) VALUES ('limite', ?)`, [valor], (err) => {
    if (err) {
      console.error('Erro ao atualizar limite:', err)
      return res.status(500).json({ erro: 'Erro ao atualizar limite' })
    }

    res.sendStatus(200)
  })
}

module.exports = {
  get,
  set
}
