/**
 * Migration: Remove current_level field from students table
 * Date: 2025-01-15
 * Description: Remove current_level field as level progress is managed in class_students and study_results tables
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove current_level field
    const hasCurrentLevel = await knex.schema.hasColumn('students', 'current_level');
    if (hasCurrentLevel) {
        await knex.schema.alterTable('students', function(table) {
            table.dropColumn('current_level');
        });
        console.log('Dropped column: current_level');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add current_level field if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.enum('current_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
             .nullable()
             .comment('Trình độ hiện tại');
    });
};
