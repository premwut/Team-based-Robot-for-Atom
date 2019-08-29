var dotenv = require("dotenv")

dotenv.load()

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "./server/migrations",
  },
  seeds: {
    directory: "./server/seeds",
  },
}
