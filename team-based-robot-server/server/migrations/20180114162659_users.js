const tableName = "users"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("usr_id")
      table.string("usr_fname")
      table.string("usr_lname")
      table.string("username").unique()
      table.string("password")
      table.string("email")
      table.string("verify_token")
      table.integer("team_id").references("team.team_id")
      table.integer("role_id").references("role.role_id")
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
