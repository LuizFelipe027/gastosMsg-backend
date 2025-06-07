const express = require('express')

module.exports = (server) => {
  const webhook = require('../src/webhook/webhookRoutes')
  server.use('/oapi', webhook)

  const openApi = express.Router()
  server.use('/oapi', openApi)

  const gastos = require('../src/gastos/gastosService')
  openApi.get('/gastos', gastos.getAll)
  openApi.post('/gastos', gastos.create)
  openApi.put('/gastos/:id', gastos.update)
  openApi.delete('/gastos/:id', gastos.deleteRecord)

  const limite = require('../src/limite/limiteService')
  openApi.get('/limite', limite.get)
  openApi.post('/limite', limite.set)
}