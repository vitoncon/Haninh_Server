/**
 * Migration: Remove emergency_contact field from students table
 * Date: 2025-01-15
 * Description: Remove emergency_contact field as we can use existing contact information
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Remove emergency_contact field
    const hasEmergencyContact = await knex.schema.hasColumn('students', 'emergency_contact');
    if (hasEmergencyContact) {
        await knex.schema.alterTable('students', function(table) {
            table.dropColumn('emergency_contact');
        });
        console.log('Dropped column: emergency_contact');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Re-add emergency_contact field if needed to rollback
    await knex.schema.alterTable('students', function(table) {
        table.string('emergency_contact', 255)
             .nullable()
             .comment('Thông tin liên hệ khẩn cấp');
    });
};
