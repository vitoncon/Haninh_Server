/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('teachers', function(table) {
        // Thêm các trường mới cho thông tin việc làm và chuyên môn nâng cao
        table.string('avatar_url', 500).nullable().comment('Đường dẫn hình đại diện');
        table.decimal('salary', 15, 2).nullable().comment('Lương cơ bản');
        table.date('hire_date').nullable().comment('Ngày tuyển dụng');
        table.enum('contract_type', ['Hợp đồng', 'Biên chế', 'Thời vụ']).nullable().comment('Loại hợp đồng');
        table.integer('teaching_hours_per_week').nullable().comment('Số giờ dạy mỗi tuần');
        table.text('languages').nullable().comment('Ngôn ngữ có thể dạy');
        table.text('certifications').nullable().comment('Chứng chỉ chuyên môn');
        
        // Thêm index cho các trường mới
        table.index(['contract_type']);
        table.index(['hire_date']);
        table.index(['salary']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('teachers', function(table) {
        // Xóa các index trước
        table.dropIndex(['contract_type']);
        table.dropIndex(['hire_date']);
        table.dropIndex(['salary']);
        
        // Xóa các cột đã thêm
        table.dropColumn('avatar_url');
        table.dropColumn('salary');
        table.dropColumn('hire_date');
        table.dropColumn('contract_type');
        table.dropColumn('teaching_hours_per_week');
        table.dropColumn('languages');
        table.dropColumn('certifications');
    });
};
