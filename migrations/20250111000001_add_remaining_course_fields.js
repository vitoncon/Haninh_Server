/**
 * Migration: Add remaining course fields to match model
 * Date: 2025-01-11
 * Description: Add prerequisites, learning_objectives, category, tags, updated_at fields
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Check if columns exist before adding them
    const hasPrerequisites = await knex.schema.hasColumn('courses', 'prerequisites');
    const hasLearningObjectives = await knex.schema.hasColumn('courses', 'learning_objectives');
    const hasCategory = await knex.schema.hasColumn('courses', 'category');
    const hasTags = await knex.schema.hasColumn('courses', 'tags');
    const hasUpdatedAt = await knex.schema.hasColumn('courses', 'updated_at');

    // Add missing fields one by one
    if (!hasPrerequisites) {
        await knex.schema.alterTable('courses', function(table) {
            table.text('prerequisites')
                 .nullable()
                 .comment('Điều kiện tiên quyết');
        });
    }
    
    if (!hasLearningObjectives) {
        await knex.schema.alterTable('courses', function(table) {
            table.text('learning_objectives')
                 .nullable()
                 .comment('Mục tiêu học tập');
        });
    }
    
    if (!hasCategory) {
        await knex.schema.alterTable('courses', function(table) {
            table.string('category', 100)
                 .nullable()
                 .comment('Danh mục khóa học');
        });
    }
    
    if (!hasTags) {
        await knex.schema.alterTable('courses', function(table) {
            table.json('tags')
                 .nullable()
                 .comment('Thẻ phân loại khóa học');
        });
    }
    
    if (!hasUpdatedAt) {
        await knex.schema.alterTable('courses', function(table) {
            table.timestamp('updated_at')
                 .defaultTo(knex.fn.now())
                 .comment('Thời gian cập nhật');
        });
    }
    
    // Add indexes for new fields
    try {
        if (!hasCategory) {
            await knex.schema.alterTable('courses', function(table) {
                table.index(['category']);
            });
        }
    } catch (error) {
        console.log('Index creation skipped (may already exist):', error.message);
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('courses', function(table) {
        // Remove new fields
        table.dropColumn('prerequisites');
        table.dropColumn('learning_objectives');
        table.dropColumn('category');
        table.dropColumn('tags');
        table.dropColumn('updated_at');
        
        // Remove indexes
        table.dropIndex(['category']);
    });
};
