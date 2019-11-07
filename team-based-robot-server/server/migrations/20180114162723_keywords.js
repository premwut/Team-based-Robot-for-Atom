const tableName = "keywords"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("kwd_id")
      table.string("kwd_name").unique()
      table.text("kwd_content")
      table.text("kwd_doc").nullable()
      table.text("kwd_desc").nullable()
      table.boolean("kwd_deprecate").defaultTo(false)
      table.integer("kwd_parent_id").references("keywords.kwd_id")
      table.boolean("kwd_is_approved").defaultTo(false)
      table.string("kwd_review").defaultTo(false)
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
