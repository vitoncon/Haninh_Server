/**
 * Migration: Remove unrelated fields from students table
 * Date: 2025-01-15
 * Description: Remove fields not related to language center (school, grade, major, academic_year, study_goals, learning_style, attendance_rate, average_score)
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Check if columns exist before dropping them
    const columnsToRemove = [
        'major',
        'academic_year', 
        'study_goals',
        'learning_style',
        'attendance_rate',
        'average_score'
    ];

    for (const column of columnsToRemove) {
        const hasColumn = await knex.schema.hasColumn('students', column);
        if (hasColumn) {
            await knex.schema.alterTable('students', function(table) {
                table.dropColumn(column);
            });
            console.log(`Dropped column: ${column}`);
        }
    }

    // Rename 'school' to 'current_school' for clarity (optional - keep if needed)
    // We'll keep school field as it might be useful for language center context
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add dropped columns if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.string('major', 255).nullable().comment('Chuyên ngành');
        table.integer('academic_year').nullable().comment('Năm học');
        table.text('study_goals').nullable().comment('Mục tiêu học tập');
        table.enum('learning_style', ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'])
             .nullable().comment('Phong cách học tập');
        table.decimal('attendance_rate', 5, 2).nullable().comment('Tỷ lệ chuyên cần (%)');
        table.decimal('average_score', 5, 2).nullable().comment('Điểm trung bình');
    });
};
