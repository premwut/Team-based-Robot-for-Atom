const tableName = "testcase"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("tc_id")
      table.string("tc_name").unique()
      table.string("tc_tag")
      table.integer("usr_id").references("users.usr_id")
      table.string("tc_version")
      table.string("tc_is_passed")
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
