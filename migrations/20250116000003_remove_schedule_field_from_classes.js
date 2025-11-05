/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('classes', function(table) {
        table.dropColumn('schedule');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('classes', function(table) {
        table.string('schedule', 255).nullable().comment('Lịch học (VD: Thứ 2,4,6)');
    });
};
