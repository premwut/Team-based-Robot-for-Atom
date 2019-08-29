const tableName = "keyword_mapping"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("kwd_map_id")
      table.boolean("kwd_is_owner").defaultTo(false)
      table.integer("proj_id").references("project.proj_id")
      table.integer("team_id").references("team.team_id")
      table.integer("usr_id").references("users.usr_id")
      table.integer("kwd_id").references("keywords.kwd_id")
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
