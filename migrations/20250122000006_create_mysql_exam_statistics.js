/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // MySQL/MariaDB compatible stored procedures and triggers
    // Knex2 doesn't support DELIMITER in raw queries properly, so we'll skip this
    try {
        console.log('Skipping stored procedures (knex2 doesn\'t support DELIMITER properly)');
    } catch (error) {
        console.log('Error creating stored procedures:', error.message);
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Nothing to drop
    console.log('Migration down: Nothing to do');
};




