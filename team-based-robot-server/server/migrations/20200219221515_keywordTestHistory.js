const tableName = "keyword_test_history"

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(tableName, (table) => {
          table.increments("kwd_th_id")
          table.string("other_kwd")
          table.integer("th_id").references("test_history.th_id")
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
