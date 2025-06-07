const db = require('../../database/db')
const { getLimite } = require('../limite/limiteUtils') // versão que aceita callback puro

function processWebhook(req, res) {
  const body = req.body.Body || ''

  console.log(" body: ", body)

  const linhas = body.split('\n').map(l => l.trim())

  console.log(" linhas: ", linhas)

  const data = new Date().toISOString()

  if (linhas[0].toLowerCase() === 'gastos') {
    db.all('SELECT * FROM gastos ORDER BY data DESC LIMIT 5', (err, rows) => {
      if (err || !rows.length) {
        return res.send(`<Response><Message>Não há registros de gastos até o momento.</Message></Response>`)
      }

      const lista = rows.map(g => {
        const valor = parseFloat(g.valor).toFixed(2)
        const dataFormatada = new Date(g.data).toLocaleDateString('pt-BR')
        return `• ID: ${g.id} — ${g.descricao} — R$ ${valor} em ${dataFormatada}`
      }).join('\n')

      const mensagem = `📋 Últimos Gastos:\n\n${lista}`
      res.send(`<Response><Message>${mensagem}</Message></Response>`)
    })
  } else if (linhas[0].toLowerCase() === 'limite' && !isNaN(parseFloat(linhas[1]))) {
    const novoLimite = parseFloat(linhas[1])
    db.run(`INSERT OR REPLACE INTO config (chave, valor) VALUES ('limite', ?)`, [novoLimite], () => {
      res.send(`<Response><Message>Limite atualizado para R$ ${novoLimite.toFixed(2)}</Message></Response>`)
    })
  } else if (linhas.length === 2 && !isNaN(parseFloat(linhas[1]))) {
    const descricao = linhas[0]
    const valor = parseFloat(linhas[1])

    db.run(
      `INSERT INTO gastos (descricao, valor, data) VALUES (?, ?, ?)`,
      [descricao, valor, data],
      () => {
        db.get(
          `SELECT SUM(valor) AS total FROM gastos WHERE strftime('%Y-%m', data) = strftime('%Y-%m', 'now')`,
          (err, row) => {
            const total = row?.total || 0
            getLimite((limite) => {
              const restante = limite - total
              res.send(`<Response><Message>Total gasto este mês: R$ ${total.toFixed(2)}\nLimite: R$ ${limite.toFixed(2)}\nDisponível: R$ ${restante.toFixed(2)}</Message></Response>`)
            })
          }
        )
      }
    )
  } else {
    res.send(`<Response><Message>Formato inválido. Use:\nDescrição\\nValor ou Limite\\nValor</Message></Response>`)
  }
}

module.exports = { processWebhook }
