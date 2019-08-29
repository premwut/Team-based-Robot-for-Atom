const tableName = "feature"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("fea_id")
      table.string("fea_name").unique()
      table.string("fea_title")
      table.string("fea_desc")
      table.boolean("fea_is_sys").defaultTo(false)
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
