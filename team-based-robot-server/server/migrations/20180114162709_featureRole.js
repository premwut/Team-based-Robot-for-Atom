const tableName = "feature_role"

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable(tableName, (table) => {
      table.increments("fea_role_id")
      table.boolean("fea_role_active").defaultTo(true)
      table.integer("role_id").references("role.role_id")
      table.integer("fea_id").references("feature.fea_id")
      table.integer("pms_id").references("permission.pms_id")
      table.timestamps()
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable(tableName),
  ])
}
