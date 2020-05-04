const tableName = "tests"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("test_id")
      table.integer("test_tc_no")
      table.integer("test_passed")
      table.integer("test_failed")
      table.string("test_starttime")
      table.string("test_endtime")
      table.string("test_elapsed")
      table.string("test_file_link")
      table.integer("usr_id").references("users.usr_id")
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
