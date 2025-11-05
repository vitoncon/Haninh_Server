/**
 * Migration: Add student profile fields
 * Date: 2025-01-11
 * Description: Add new fields to students table for enhanced functionality
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Check if columns exist before adding them
    const hasAvatarUrl = await knex.schema.hasColumn('students', 'avatar_url');
    const hasEmergencyContact = await knex.schema.hasColumn('students', 'emergency_contact');
    const hasSchool = await knex.schema.hasColumn('students', 'school');
    const hasGrade = await knex.schema.hasColumn('students', 'grade');
    const hasStudyGoals = await knex.schema.hasColumn('students', 'study_goals');
    const hasLearningStyle = await knex.schema.hasColumn('students', 'learning_style');
    const hasAttendanceRate = await knex.schema.hasColumn('students', 'attendance_rate');
    const hasAverageScore = await knex.schema.hasColumn('students', 'average_score');
    const hasLearningLanguage = await knex.schema.hasColumn('students', 'learning_language');
    const hasCurrentLevel = await knex.schema.hasColumn('students', 'current_level');
    const hasTargetLevel = await knex.schema.hasColumn('students', 'target_level');

    // Add missing columns one by one
    if (!hasAvatarUrl) {
        await knex.schema.alterTable('students', function(table) {
            table.string('avatar_url', 255)
                 .nullable()
                 .comment('URL ảnh đại diện học viên');
        });
    }
    
    if (!hasEmergencyContact) {
        await knex.schema.alterTable('students', function(table) {
            table.string('emergency_contact', 255)
                 .nullable()
                 .comment('Thông tin liên hệ khẩn cấp');
        });
    }
    
    if (!hasSchool) {
        await knex.schema.alterTable('students', function(table) {
            table.string('school', 100)
                 .nullable()
                 .comment('Trường học hiện tại');
        });
    }
    
    if (!hasGrade) {
        await knex.schema.alterTable('students', function(table) {
            table.string('grade', 50)
                 .nullable()
                 .comment('Lớp/Khối học');
        });
    }
    
    if (!hasStudyGoals) {
        await knex.schema.alterTable('students', function(table) {
            table.text('study_goals')
                 .nullable()
                 .comment('Mục tiêu học tập');
        });
    }
    
    if (!hasLearningStyle) {
        await knex.schema.alterTable('students', function(table) {
            table.enum('learning_style', ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'])
                 .nullable()
                 .comment('Phong cách học tập');
        });
    }
    
    if (!hasAttendanceRate) {
        await knex.schema.alterTable('students', function(table) {
            table.decimal('attendance_rate', 5, 2)
                 .nullable()
                 .comment('Tỷ lệ chuyên cần (%)');
        });
    }
    
    if (!hasAverageScore) {
        await knex.schema.alterTable('students', function(table) {
            table.decimal('average_score', 5, 2)
                 .nullable()
                 .comment('Điểm trung bình');
        });
    }
    
    if (!hasLearningLanguage) {
        await knex.schema.alterTable('students', function(table) {
            table.enum('learning_language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung'])
                 .nullable()
                 .comment('Ngôn ngữ đang học');
        });
    }
    
    if (!hasCurrentLevel) {
        await knex.schema.alterTable('students', function(table) {
            table.enum('current_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
                 .nullable()
                 .comment('Trình độ hiện tại');
        });
    }
    
    if (!hasTargetLevel) {
        await knex.schema.alterTable('students', function(table) {
            table.enum('target_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
                 .nullable()
                 .comment('Trình độ mục tiêu');
        });
    }
    
    // Add indexes for new fields
    try {
        if (!hasLearningLanguage) {
            await knex.schema.alterTable('students', function(table) {
                table.index(['learning_language']);
            });
        }
        if (!hasCurrentLevel) {
            await knex.schema.alterTable('students', function(table) {
                table.index(['current_level']);
            });
        }
        if (!hasTargetLevel) {
            await knex.schema.alterTable('students', function(table) {
                table.index(['target_level']);
            });
        }
        if (!hasSchool) {
            await knex.schema.alterTable('students', function(table) {
                table.index(['school']);
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
    return knex.schema.alterTable('students', function(table) {
        // Remove new fields
        table.dropColumn('avatar_url');
        table.dropColumn('emergency_contact');
        table.dropColumn('school');
        table.dropColumn('grade');
        table.dropColumn('study_goals');
        table.dropColumn('learning_style');
        table.dropColumn('attendance_rate');
        table.dropColumn('average_score');
        table.dropColumn('learning_language');
        table.dropColumn('current_level');
        table.dropColumn('target_level');
        
        // Remove indexes
        table.dropIndex(['learning_language']);
        table.dropIndex(['current_level']);
        table.dropIndex(['target_level']);
        table.dropIndex(['school']);
    });
};
