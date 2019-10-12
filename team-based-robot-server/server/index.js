import { API, PORT, PRODUCTION } from "./utilities/constants"
import { Builder, Nuxt } from "nuxt"

import PrettyError from "pretty-error"
import bodyParser from "body-parser"
import compression from "compression"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import express from "express"
import expressValidator from "express-validator"
import routers from "./routes"
import SocketIO from 'socket.io'
import http from 'http'

dotenv.load()
const app = express()
const host = process.env.HOST
const port = process.env.PORT || 3000

app.set(PORT, port)
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Import and Set Nuxt.js options
let config = require("../nuxt.config.js")
config.dev = !(process.env.NODE_ENV === PRODUCTION)

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Express middleware
app.use(expressValidator())

// Compression to GZip
app.use(compression())

// Import API Routes
app.use(API, routers)

// Give nuxt middleware to express
app.use(nuxt.render)

// Error settings
const pe = new PrettyError()
pe.skipNodeFiles()
pe.skipPackage("express")
app.use((err, req, res, next) => {
  // process.stderr.write(pe.render(err))
  console.log(pe.render(err))
  next()
})

// Listen the server
// app.listen(port, host)
const server = http.Server(app)
const io = SocketIO(server)


server.listen(port, host, () => {
  console.log("Server listening to whatever")
})

io.on("connection", function (socket) {
  console.log("connected")
  io.sockets.emit("test", {message: "test message from server"})
})
console.log("Server listening on " + host + ":" + port) // eslint-disable-line no-console
