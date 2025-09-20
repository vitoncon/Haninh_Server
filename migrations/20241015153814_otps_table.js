/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('otps', function(table) {
        table.increments('id').primary(); // Tạo cột id tự động tăng
        table.string('email').notNullable(); // Tạo cột name không được null
        table.string('otp').notNullable(); // Tạo cột name không được null
        table.string('exp').notNullable(); // Tạo cột name không được null
        table.timestamps(true, true); // Tạo cột created_at và updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('otps'); // Hủy migration
};
