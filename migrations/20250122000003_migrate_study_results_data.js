/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Lấy tất cả dữ liệu từ study_results
    const studyResults = await knex('study_results').select('*');
    
    if (studyResults.length === 0) {
        console.log('No study_results data to migrate');
        return;
    }
    
    console.log(`Migrating ${studyResults.length} study_results records...`);
    
    // Nhóm dữ liệu theo exam (exam_name, exam_type, exam_date, class_id, language)
    const examGroups = new Map();
    
    studyResults.forEach(result => {
        const examKey = `${result.exam_name}_${result.exam_type}_${result.exam_date}_${result.class_id}_${result.language}`;
        
        if (!examGroups.has(examKey)) {
            examGroups.set(examKey, {
                exam_name: result.exam_name,
                exam_type: result.exam_type,
                exam_date: result.exam_date,
                class_id: result.class_id,
                language: result.language,
                skills: new Set(),
                results: []
            });
        }
        
        examGroups.get(examKey).skills.add(result.skill_type);
        examGroups.get(examKey).results.push(result);
    });
    
    console.log(`Found ${examGroups.size} unique exams to migrate`);
    
    // Tạo exams và exam_skills
    for (const [examKey, examData] of examGroups) {
        // Tạo exam
        const [examId] = await knex('exams').insert({
            exam_name: examData.exam_name,
            exam_type: examData.exam_type,
            exam_date: examData.exam_date,
            class_id: examData.class_id,
            language: examData.language,
            total_max_score: 100, // Default value
            status: 'completed',
            created_at: new Date(),
            updated_at: new Date()
        }).returning('id');
        
        console.log(`Created exam ${examId}: ${examData.exam_name}`);
        
        // Tạo exam_skills cho từng skill
        const skillMap = new Map();
        let orderIndex = 1;
        
        for (const skillType of examData.skills) {
            const [examSkillId] = await knex('exam_skills').insert({
                exam_id: examId,
                skill_type: skillType,
                max_score: 100, // Default value, có thể điều chỉnh sau
                weight: 1.00,
                order_index: orderIndex++,
                created_at: new Date(),
                updated_at: new Date()
            }).returning('id');
            
            skillMap.set(skillType, examSkillId);
            console.log(`Created exam_skill ${examSkillId}: ${skillType}`);
        }
        
        // Tạo exam_results
        for (const result of examData.results) {
            const examSkillId = skillMap.get(result.skill_type);
            
            if (examSkillId) {
                await knex('exam_results').insert({
                    exam_skill_id: examSkillId,
                    student_id: result.student_id,
                    score: result.score,
                    percentage: result.percentage,
                    level: result.level,
                    teacher_comment: result.teacher_comment,
                    student_feedback: result.student_feedback,
                    is_passed: result.percentage >= 60,
                    grade_point: calculateGradePoint(result.percentage),
                    created_at: result.created_at || new Date(),
                    updated_at: result.updated_at || new Date(),
                    created_by: result.created_by || 0,
                    updated_by: result.updated_by || 0,
                    is_deleted: result.is_deleted || 0,
                    deleted_by: result.deleted_by || 0
                });
            }
        }
        
        console.log(`Migrated ${examData.results.length} results for exam ${examId}`);
    }
    
    // Cập nhật thống kê cho exams và exam_skills
    await updateExamStatistics(knex);
    
    console.log('Migration completed successfully');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Xóa dữ liệu từ các bảng mới (theo thứ tự ngược lại)
    await knex('exam_results').del();
    await knex('exam_skills').del();
    await knex('exams').del();
    
    console.log('Rollback completed - new tables cleared');
};

// Helper function để tính grade point
function calculateGradePoint(percentage) {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
}

// Helper function để cập nhật thống kê
async function updateExamStatistics(knex) {
    console.log('Updating exam statistics...');
    
    // Cập nhật average_score và total_students cho exams
    const exams = await knex('exams').select('id');
    
    for (const exam of exams) {
        // Lấy thống kê từ exam_results thông qua exam_skills
        const stats = await knex('exam_results')
            .join('exam_skills', 'exam_results.exam_skill_id', 'exam_skills.id')
            .where('exam_skills.exam_id', exam.id)
            .select(
                knex.raw('AVG(exam_results.percentage) as avg_percentage'),
                knex.raw('COUNT(DISTINCT exam_results.student_id) as total_students')
            )
            .first();
        
        if (stats) {
            await knex('exams')
                .where('id', exam.id)
                .update({
                    average_score: stats.avg_percentage,
                    total_students: stats.total_students,
                    updated_at: new Date()
                });
        }
    }
    
    // Cập nhật average_score và total_students cho exam_skills
    const examSkills = await knex('exam_skills').select('id');
    
    for (const examSkill of examSkills) {
        const stats = await knex('exam_results')
            .where('exam_skill_id', examSkill.id)
            .select(
                knex.raw('AVG(percentage) as avg_percentage'),
                knex.raw('COUNT(student_id) as total_students')
            )
            .first();
        
        if (stats) {
            await knex('exam_skills')
                .where('id', examSkill.id)
                .update({
                    average_score: stats.avg_percentage,
                    total_students: stats.total_students,
                    updated_at: new Date()
                });
        }
    }
    
    console.log('Exam statistics updated');
}




