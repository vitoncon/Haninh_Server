/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_roles', function(table) {
        table.increments('id').primary(); // Tạo cột id tự động tăng
        table.integer('user_id').unsigned().notNullable() // Tạo cột user_id
            .references('id').inTable('users').onDelete('CASCADE'); // Khóa ngoại tới bảng users
        table.integer('role_id').unsigned().notNullable() // Tạo cột role_id
            .references('id').inTable('roles').onDelete('CASCADE'); // Khóa ngoại tới bảng roles
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
    return knex.schema.dropTableIfExists('user_roles'); // Hủy migration
};
