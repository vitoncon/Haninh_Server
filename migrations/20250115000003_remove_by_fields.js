/**
 * Migration: Remove created_by and updated_by fields from students table
 * Date: 2025-01-15
 * Description: Remove created_by and updated_by fields as we don't need to track who created/updated records
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove created_by and updated_by fields
    const fieldsToRemove = ['created_by', 'updated_by'];

    for (const field of fieldsToRemove) {
        const hasField = await knex.schema.hasColumn('students', field);
        if (hasField) {
            await knex.schema.alterTable('students', function(table) {
                table.dropColumn(field);
            });
            console.log(`Dropped column: ${field}`);
        }
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add fields if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
    });
};
