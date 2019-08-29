import config from "../../knexfile"

const knex = require("knex")(config)
const bookshelf = require("bookshelf")(knex)
const cascadeDelete = require("bookshelf-cascade-delete")

bookshelf.plugin("registry")
bookshelf.plugin("virtuals")
bookshelf.plugin("visibility")
bookshelf.plugin("pagination")
bookshelf.plugin(cascadeDelete)

// knex.migrate.latest();

export const BaseModel = require("bookshelf-modelbase")(bookshelf)
export default bookshelf
