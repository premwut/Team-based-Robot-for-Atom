const tableName = "test_mapping"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("test_map_id")
      table.integer("tc_id")
      table.string("tc_name")
      table.boolean("tc_passed")
      table.string("tc_starttime")
      table.string("tc_endtime")
      table.string("tc_elapsed")
      table.string("kwd_name")
      table.string("kwd_starttime")
      table.string("kwd_endtime")
      table.string("kwd_elapsed")
      table.boolean("kwd_passed")
      table.integer("test_id").references("tests.test_id")
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
