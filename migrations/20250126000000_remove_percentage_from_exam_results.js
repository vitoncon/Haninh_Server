/**
 * Remove percentage column from exam_results table
 * Percentage is a derived value that should be calculated on-the-fly from score and max_score
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('exam_results', function(table) {
        // Check if percentage column exists before dropping
        return knex.raw('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'exam_results\' AND COLUMN_NAME = \'percentage\'')
            .then((result) => {
                if (result[0].length > 0) {
                    // Drop index first if it exists
                    return knex.raw('DROP INDEX IF EXISTS exam_results_percentage_index ON exam_results')
                        .then(() => {
                            // Drop the column
                            return table.dropColumn('percentage');
                        });
                }
                return Promise.resolve();
            });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('exam_results', function(table) {
        // Add back the column
        table.decimal('percentage', 5, 2).notNullable().defaultTo(0).comment('Phần trăm điểm');
        
        // Add back the index
        table.index(['percentage'], 'exam_results_percentage_index');
    });
};

