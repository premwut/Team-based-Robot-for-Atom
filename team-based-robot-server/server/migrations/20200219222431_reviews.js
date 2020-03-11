const tableName = "reviews"

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(tableName, (table) => {
          table.increments("rw_id")
          table.string("rw_status")
          table.string("rw_comment")
          table.integer("kwd_id").references("keywords.kwd_id")
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
