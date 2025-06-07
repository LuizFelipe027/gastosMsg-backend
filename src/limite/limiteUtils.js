const db = require('../../database/db')

function getLimite(callback) {
  db.get(`SELECT valor FROM config WHERE chave = 'limite'`, (err, row) => {
    if (err) return callback(0)
    callback(row ? parseFloat(row.valor) : 0)
  })
}

module.exports = { getLimite }