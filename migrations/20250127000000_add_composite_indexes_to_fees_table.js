/**
 * Migration: Add composite indexes to fees table for better query performance
 * Optimizes queries for monthly fee management
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('fees', function(table) {
        // Composite index for querying fees by class and due_date (for monthly grouping)
        table.index(['class_id', 'due_date'], 'idx_fees_class_due_date');
        
        // Composite index for querying fees by class and payment_status
        table.index(['class_id', 'payment_status'], 'idx_fees_class_status');
        
        // Composite index for querying fees by student and due_date
        table.index(['student_id', 'due_date'], 'idx_fees_student_due_date');
        
        // Composite index for querying fees by class, payment_status, and due_date
        table.index(['class_id', 'payment_status', 'due_date'], 'idx_fees_class_status_due');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('fees', function(table) {
        table.dropIndex(['class_id', 'due_date'], 'idx_fees_class_due_date');
        table.dropIndex(['class_id', 'payment_status'], 'idx_fees_class_status');
        table.dropIndex(['student_id', 'due_date'], 'idx_fees_student_due_date');
        table.dropIndex(['class_id', 'payment_status', 'due_date'], 'idx_fees_class_status_due');
    });
};

