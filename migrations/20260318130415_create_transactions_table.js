/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('fee_id').unsigned().notNullable();
    table.string('content', 255).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('status', 50).notNullable().defaultTo('SUCCESS');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('fee_id').references('id').inTable('fees').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions');
};
