const tableName = "test_mapping"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("test_map_id")
      table.integer("test_map_tc_id")
      table.string("test_map_tc_name")
      table.boolean("test_map_tc_passed")
      table.string("test_map_tc_starttime")
      table.string("test_map_tc_endtime")
      table.string("test_map_tc_elapsed")
      table.string("test_kwd_name")
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
