/**
 * Migration: Remove deleted_by field from students table
 * Date: 2025-01-15
 * Description: Remove deleted_by field as we only need to know if record is deleted or not
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove deleted_by field
    const hasDeletedBy = await knex.schema.hasColumn('students', 'deleted_by');
    if (hasDeletedBy) {
        await knex.schema.alterTable('students', function(table) {
            table.dropColumn('deleted_by');
        });
        console.log('Dropped column: deleted_by');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add deleted_by field if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.integer('deleted_by').defaultTo(0);
    });
};
