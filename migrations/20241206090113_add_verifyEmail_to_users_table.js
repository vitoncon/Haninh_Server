/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
        table.integer('verifyEmail').notNullable().defaultTo(0).comment('0: chưa xác thực | 1: đã xác thực'); // Thêm cột `gmail`, có thể null
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
