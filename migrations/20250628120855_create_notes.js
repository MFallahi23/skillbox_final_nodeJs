/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notes", (table) => {
    table.string("id", 21).primary();
    table.string("title").notNullable();
    table.text("text");
    table.string("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.boolean("isArchived").defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("notes");
};
