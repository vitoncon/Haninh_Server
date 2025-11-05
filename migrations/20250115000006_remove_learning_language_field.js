/**
 * Migration: Remove learning_language field from students table
 * Date: 2025-01-15
 * Description: Remove learning_language field as language information is managed in classes and class_students tables
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove learning_language field
    const hasLearningLanguage = await knex.schema.hasColumn('students', 'learning_language');
    if (hasLearningLanguage) {
        await knex.schema.alterTable('students', function(table) {
            table.dropColumn('learning_language');
        });
        console.log('Dropped column: learning_language');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add learning_language field if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.enum('learning_language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung'])
             .nullable()
             .comment('Ngôn ngữ đang học');
    });
};
