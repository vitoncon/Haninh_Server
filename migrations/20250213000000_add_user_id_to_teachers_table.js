/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('teachers', function(table) {
        // Thêm user_id để liên kết với bảng users
        table.integer('user_id').unsigned().nullable().comment('ID người dùng liên kết');
        
        // Tạo foreign key nếu teacher có user liên kết
        table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
        
        // Tạo unique index để mỗi teacher chỉ liên kết với 1 user
        table.unique(['user_id']);
        
        // Tạo index để tìm kiếm nhanh theo user_id
        table.index(['user_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('teachers', function(table) {
        // Xóa foreign key
        table.dropForeign(['user_id']);
        
        // Xóa unique index
        table.dropUnique(['user_id']);
        
        // Xóa index
        table.dropIndex(['user_id']);
        
        // Xóa cột user_id
        table.dropColumn('user_id');
    });
};
