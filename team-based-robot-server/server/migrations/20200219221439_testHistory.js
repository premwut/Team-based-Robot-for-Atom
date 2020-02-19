const tableName = "test_history"

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(tableName, (table) => {
          table.increments("th_id")
          table.integer("no_of_tc")
          table.integer("passed")
          table.integer("failed")
          table.integer("usr_id").references("users.usr_id")
          table.timestamps()
        }),
      ])
}

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(tableName),
      ])
}
