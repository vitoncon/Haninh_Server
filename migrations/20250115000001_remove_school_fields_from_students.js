/**
 * Migration: Remove school-related fields from students table
 * Date: 2025-01-15
 * Description: Remove school and grade fields as we focus only on language learning at the center
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove school-related fields
    const columnsToRemove = ['school', 'grade'];

    for (const column of columnsToRemove) {
        const hasColumn = await knex.schema.hasColumn('students', column);
        if (hasColumn) {
            await knex.schema.alterTable('students', function(table) {
                table.dropColumn(column);
            });
            console.log(`Dropped column: ${column}`);
        }
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add dropped columns if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.string('school', 100).nullable().comment('Trường học hiện tại');
        table.string('grade', 50).nullable().comment('Lớp/Khối học');
    });
};
