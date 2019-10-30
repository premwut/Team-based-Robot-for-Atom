const tableName = "keyword_testcase"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("kwd_tc_id")
      table.integer("kwd_id").references("keywords.kwd_id")
      table.integer("tc_id").references("testcase.tc_id")
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
