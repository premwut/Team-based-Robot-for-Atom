const tableName = "testcase"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("tc_id")
      table.string("tc_name").unique()
      table.boolean("tc_is_passed")
      table.time("tc_start_run")
      table.time("tc_end_run")
      table.date("tc_run_date")
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
