/**
 * Migration: Add missing fields to courses table
 * Date: 2025-01-11
 * Description: Add language, level, duration_weeks, category, tags, prerequisites, learning_objectives fields
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Check if columns exist before adding them
    const hasLanguage = await knex.schema.hasColumn('courses', 'language');
    const hasLevel = await knex.schema.hasColumn('courses', 'level');
    const hasDurationWeeks = await knex.schema.hasColumn('courses', 'duration_weeks');
    const hasCategory = await knex.schema.hasColumn('courses', 'category');
    const hasTags = await knex.schema.hasColumn('courses', 'tags');
    const hasPrerequisites = await knex.schema.hasColumn('courses', 'prerequisites');
    const hasLearningObjectives = await knex.schema.hasColumn('courses', 'learning_objectives');
    const hasUpdatedAt = await knex.schema.hasColumn('courses', 'updated_at');
    const hasPrice = await knex.schema.hasColumn('courses', 'price');
    const hasDurationHours = await knex.schema.hasColumn('courses', 'duration_hours');
    const hasTuitionFee = await knex.schema.hasColumn('courses', 'tuition_fee');
    const hasTotalHours = await knex.schema.hasColumn('courses', 'total_hours');
    const hasStatus = await knex.schema.hasColumn('courses', 'status');

    // Add missing columns one by one
    if (!hasLanguage) {
        await knex.schema.alterTable('courses', function(table) {
            table.enum('language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung'])
                 .notNullable()
                 .defaultTo('Tiếng Anh')
                 .comment('Ngôn ngữ khóa học');
        });
    }
    
    if (!hasLevel) {
        await knex.schema.alterTable('courses', function(table) {
            table.enum('level', ['Sơ cấp', 'Trung cấp', 'Cao cấp'])
                 .notNullable()
                 .defaultTo('Sơ cấp')
                 .comment('Trình độ khóa học');
        });
    }
    
    if (!hasDurationWeeks) {
        await knex.schema.alterTable('courses', function(table) {
            table.integer('duration_weeks')
                 .nullable()
                 .comment('Số tuần học');
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
    
    if (!hasUpdatedAt) {
        await knex.schema.alterTable('courses', function(table) {
            table.timestamp('updated_at')
                 .defaultTo(knex.fn.now())
                 .comment('Thời gian cập nhật');
        });
    }
    
    // Update status enum to match current database
    if (hasStatus) {
        await knex.schema.alterTable('courses', function(table) {
            table.dropColumn('status');
        });
    }
    await knex.schema.alterTable('courses', function(table) {
        table.enum('status', ['Đang hoạt động', 'Không hoạt động'])
             .defaultTo('Đang hoạt động')
             .comment('Trạng thái khóa học');
    });
    
    // Rename existing fields to match database
    if (hasPrice && !hasTuitionFee) {
        await knex.schema.alterTable('courses', function(table) {
            table.renameColumn('price', 'tuition_fee');
        });
    }
    if (hasDurationHours && !hasTotalHours) {
        await knex.schema.alterTable('courses', function(table) {
            table.renameColumn('duration_hours', 'total_hours');
        });
    }
    
    // Add indexes for new fields
    try {
        if (!hasLanguage) {
            await knex.schema.alterTable('courses', function(table) {
                table.index(['language']);
            });
        }
        if (!hasLevel) {
            await knex.schema.alterTable('courses', function(table) {
                table.index(['level']);
            });
        }
        if (!hasCategory) {
            await knex.schema.alterTable('courses', function(table) {
                table.index(['category']);
            });
        }
        await knex.schema.alterTable('courses', function(table) {
            table.index(['status']);
        });
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
        table.dropColumn('language');
        table.dropColumn('level');
        table.dropColumn('duration_weeks');
        table.dropColumn('category');
        table.dropColumn('tags');
        table.dropColumn('prerequisites');
        table.dropColumn('learning_objectives');
        table.dropColumn('updated_at');
        
        // Revert status enum
        table.dropColumn('status');
        table.enum('status', ['Đang mở', 'Tạm dừng', 'Đã đóng'])
             .defaultTo('Đang mở')
             .comment('Trạng thái khóa học');
        
        // Revert column names
        table.renameColumn('tuition_fee', 'price');
        table.renameColumn('total_hours', 'duration_hours');
        
        // Remove indexes
        table.dropIndex(['language']);
        table.dropIndex(['level']);
        table.dropIndex(['category']);
        table.dropIndex(['status']);
    });
};
