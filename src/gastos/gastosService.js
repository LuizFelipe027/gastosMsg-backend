const db = require('../../database/db')

function getAll(req, res) {
  db.all('SELECT * FROM gastos ORDER BY data DESC', (err, rows) => res.json(rows))
}

function create(req, res) {
  const { descricao, valor } = req.body
  const data = new Date().toISOString()
  db.run(`INSERT INTO gastos (descricao, valor, data) VALUES (?, ?, ?)`,
    [descricao, valor, data],
    function () {
      res.json({ id: this.lastID })
    }
  )
}

function update(req, res) {
  const { descricao, valor } = req.body
  db.run(`UPDATE gastos SET descricao = ?, valor = ? WHERE id = ?`,
    [descricao, valor, req.params.id],
    () => res.sendStatus(200)
  )
}

function deleteRecord(req, res) {
  db.run(`DELETE FROM gastos WHERE id = ?`, [req.params.id], () => res.sendStatus(200))
}

module.exports = {
  getAll,
  create,
  update,
  deleteRecord
}