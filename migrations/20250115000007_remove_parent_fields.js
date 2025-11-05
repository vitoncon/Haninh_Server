/**
 * Migration: Remove parent_name and parent_phone fields from students table
 * Date: 2025-01-15
 * Description: Remove parent fields as parent information can be managed separately
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove parent fields
    const fieldsToRemove = ['parent_name', 'parent_phone'];

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
        table.string('parent_name', 100).nullable().comment('Tên phụ huynh');
        table.string('parent_phone', 20).nullable().comment('SĐT phụ huynh');
    });
};
