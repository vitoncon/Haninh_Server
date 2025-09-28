/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex('roles').insert([
        { name: 'Admin', created_by: 0, updated_by: 0, is_deleted: 0, deleted_by: 0 },
        { name: 'User', created_by: 0, updated_by: 0, is_deleted: 0, deleted_by: 0 }
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex('roles').whereIn('name', ['Admin', 'User']).del();
};
