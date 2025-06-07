const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const server = express()
const PORT = 3000

server.use(cors())
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))

module.exports = server
