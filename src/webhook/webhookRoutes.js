const express = require('express')
const router = express.Router()
const webhook = require('./webhookService')

const VERIFY_TOKEN = 'gastosmsg!@'

router.get('/webhook/gastos', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso!')
    res.status(200).send(challenge)
  } else {
    console.log('Verificação falhou.')
    res.sendStatus(403)
  }
})

router.post('/webhook/gastos', webhook.processWebhook)

module.exports = router
