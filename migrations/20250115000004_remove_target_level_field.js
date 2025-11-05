/**
 * Migration: Remove target_level field from students table
 * Date: 2025-01-15
 * Description: Remove target_level field as students learn levels sequentially
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove target_level field
    const hasTargetLevel = await knex.schema.hasColumn('students', 'target_level');
    if (hasTargetLevel) {
        await knex.schema.alterTable('students', function(table) {
            table.dropColumn('target_level');
        });
        console.log('Dropped column: target_level');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add target_level field if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.enum('target_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
             .nullable()
             .comment('Trình độ mục tiêu');
    });
};
