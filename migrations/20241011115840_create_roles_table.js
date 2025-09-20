/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('roles', function(table) {
        table.increments('id').primary(); // Tạo cột id tự động tăng
        table.string('name').notNullable(); // Tạo cột name không được null
        table.timestamps(true, true); // Tạo cột created_at và updated_at
        table.integer('created_by').defaultTo(0); // Tạo cột created_by
        table.integer('updated_by').defaultTo(0); // Tạo cột updated_by
        table.integer('is_deleted').defaultTo(0); // Tạo cột is_deleted
        table.integer('deleted_by').defaultTo(0); // Tạo cột deleted_by
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('roles'); // Hủy migration
};
