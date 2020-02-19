const tableName = "test_mapping"

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(tableName, (table) => {
          table.increments("test_map_id")
          table.string("test_kwd_name")
          table.integer("test_id").references("tests.test_id")
          table.integer("kwd_id").references("keywords.kwd_id")
          table.timestamps()
        }),
      ])
}

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(tableName),
      ])
}
