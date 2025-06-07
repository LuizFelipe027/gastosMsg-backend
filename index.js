const server = require('./config/server')
const database = require('./database/db')
const routes = require('./config/routes')

routes(server)
