const express = require('express')
const router = express.Router()
const webhook = require('./webhookService')

router.post('/webhook/gastos', webhook.processWebhook)

module.exports = router
