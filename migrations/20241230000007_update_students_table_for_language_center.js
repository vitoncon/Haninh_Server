/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('students', function(table) {
        // Thêm các field mới cho trung tâm ngoại ngữ
        table.string('parent_name', 255).nullable().comment('Tên phụ huynh');
        table.string('parent_phone', 20).nullable().comment('Số điện thoại phụ huynh');
        table.enum('learning_language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung']).nullable().comment('Ngôn ngữ học');
        table.enum('current_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).nullable().comment('Trình độ hiện tại');
        table.enum('target_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).nullable().comment('Trình độ mục tiêu');
        table.date('enrollment_date').nullable().comment('Ngày nhập học');
        
        // Thêm index cho các field mới
        table.index(['learning_language']);
        table.index(['current_level']);
        table.index(['enrollment_date']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('students', function(table) {
        // Xóa các field đã thêm
        table.dropColumn('parent_name');
        table.dropColumn('parent_phone');
        table.dropColumn('learning_language');
        table.dropColumn('current_level');
        table.dropColumn('target_level');
        table.dropColumn('enrollment_date');
    });
};
