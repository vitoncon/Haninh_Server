/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Tạo stored procedure để cập nhật điểm trung bình cho exam_skills
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_exam_skill_statistics()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Cập nhật thống kê cho exam_skill
            UPDATE exam_skills 
            SET 
                average_score = (
                    SELECT AVG(percentage) 
                    FROM exam_results 
                    WHERE exam_skill_id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id)
                ),
                total_students = (
                    SELECT COUNT(DISTINCT student_id) 
                    FROM exam_results 
                    WHERE exam_skill_id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id)
                ),
                updated_at = NOW()
            WHERE id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id);
            
            -- Cập nhật thống kê cho exam
            UPDATE exams 
            SET 
                average_score = (
                    SELECT AVG(er.percentage) 
                    FROM exam_results er
                    JOIN exam_skills es ON er.exam_skill_id = es.id
                    WHERE es.exam_id = (
                        SELECT exam_id 
                        FROM exam_skills 
                        WHERE id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id)
                    )
                ),
                total_students = (
                    SELECT COUNT(DISTINCT er.student_id) 
                    FROM exam_results er
                    JOIN exam_skills es ON er.exam_skill_id = es.id
                    WHERE es.exam_id = (
                        SELECT exam_id 
                        FROM exam_skills 
                        WHERE id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id)
                    )
                ),
                updated_at = NOW()
            WHERE id = (
                SELECT exam_id 
                FROM exam_skills 
                WHERE id = COALESCE(NEW.exam_skill_id, OLD.exam_skill_id)
            );
            
            RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
    `);
    
    // Tạo trigger cho exam_results
    await knex.raw(`
        CREATE TRIGGER trigger_update_exam_statistics
        AFTER INSERT OR UPDATE OR DELETE ON exam_results
        FOR EACH ROW EXECUTE FUNCTION update_exam_skill_statistics();
    `);
    
    // Tạo function để lấy kết quả học tập theo định dạng mới (4 kỹ năng)
    await knex.raw(`
        CREATE OR REPLACE FUNCTION get_student_exam_results_by_skills(
            p_student_id INTEGER,
            p_exam_id INTEGER DEFAULT NULL,
            p_class_id INTEGER DEFAULT NULL
        )
        RETURNS TABLE (
            exam_id INTEGER,
            exam_name VARCHAR,
            exam_type VARCHAR,
            exam_date DATE,
            language VARCHAR,
            listening_score DECIMAL,
            listening_percentage DECIMAL,
            speaking_score DECIMAL,
            speaking_percentage DECIMAL,
            reading_score DECIMAL,
            reading_percentage DECIMAL,
            writing_score DECIMAL,
            writing_percentage DECIMAL,
            overall_average DECIMAL,
            overall_level VARCHAR
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                e.id as exam_id,
                e.exam_name,
                e.exam_type,
                e.exam_date,
                e.language,
                COALESCE(listening.percentage, 0) as listening_percentage,
                COALESCE(listening.score, 0) as listening_score,
                COALESCE(speaking.percentage, 0) as speaking_percentage,
                COALESCE(speaking.score, 0) as speaking_score,
                COALESCE(reading.percentage, 0) as reading_percentage,
                COALESCE(reading.score, 0) as reading_score,
                COALESCE(writing.percentage, 0) as writing_percentage,
                COALESCE(writing.score, 0) as writing_score,
                COALESCE(
                    (COALESCE(listening.percentage, 0) + 
                     COALESCE(speaking.percentage, 0) + 
                     COALESCE(reading.percentage, 0) + 
                     COALESCE(writing.percentage, 0)) / 4, 0
                ) as overall_average,
                CASE 
                    WHEN COALESCE(
                        (COALESCE(listening.percentage, 0) + 
                         COALESCE(speaking.percentage, 0) + 
                         COALESCE(reading.percentage, 0) + 
                         COALESCE(writing.percentage, 0)) / 4, 0
                    ) >= 90 THEN 'C2'
                    WHEN COALESCE(
                        (COALESCE(listening.percentage, 0) + 
                         COALESCE(speaking.percentage, 0) + 
                         COALESCE(reading.percentage, 0) + 
                         COALESCE(writing.percentage, 0)) / 4, 0
                    ) >= 80 THEN 'C1'
                    WHEN COALESCE(
                        (COALESCE(listening.percentage, 0) + 
                         COALESCE(speaking.percentage, 0) + 
                         COALESCE(reading.percentage, 0) + 
                         COALESCE(writing.percentage, 0)) / 4, 0
                    ) >= 70 THEN 'B2'
                    WHEN COALESCE(
                        (COALESCE(listening.percentage, 0) + 
                         COALESCE(speaking.percentage, 0) + 
                         COALESCE(reading.percentage, 0) + 
                         COALESCE(writing.percentage, 0)) / 4, 0
                    ) >= 60 THEN 'B1'
                    WHEN COALESCE(
                        (COALESCE(listening.percentage, 0) + 
                         COALESCE(speaking.percentage, 0) + 
                         COALESCE(reading.percentage, 0) + 
                         COALESCE(writing.percentage, 0)) / 4, 0
                    ) >= 50 THEN 'A2'
                    ELSE 'A1'
                END as overall_level
            FROM exams e
            LEFT JOIN exam_skills es_listening ON e.id = es_listening.exam_id AND es_listening.skill_type = 'Nghe'
            LEFT JOIN exam_results listening ON es_listening.id = listening.exam_skill_id AND listening.student_id = p_student_id
            LEFT JOIN exam_skills es_speaking ON e.id = es_speaking.exam_id AND es_speaking.skill_type = 'Nói'
            LEFT JOIN exam_results speaking ON es_speaking.id = speaking.exam_skill_id AND speaking.student_id = p_student_id
            LEFT JOIN exam_skills es_reading ON e.id = es_reading.exam_id AND es_reading.skill_type = 'Đọc'
            LEFT JOIN exam_results reading ON es_reading.id = reading.exam_skill_id AND reading.student_id = p_student_id
            LEFT JOIN exam_skills es_writing ON e.id = es_writing.exam_id AND es_writing.skill_type = 'Viết'
            LEFT JOIN exam_results writing ON es_writing.id = writing.exam_skill_id AND writing.student_id = p_student_id
            WHERE (p_exam_id IS NULL OR e.id = p_exam_id)
            AND (p_class_id IS NULL OR e.class_id = p_class_id)
            ORDER BY e.exam_date DESC;
        END;
        $$ LANGUAGE plpgsql;
    `);
    
    console.log('Stored procedures and triggers created successfully');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Xóa trigger và functions
    await knex.raw('DROP TRIGGER IF EXISTS trigger_update_exam_statistics ON exam_results;');
    await knex.raw('DROP FUNCTION IF EXISTS update_exam_skill_statistics();');
    await knex.raw('DROP FUNCTION IF EXISTS get_student_exam_results_by_skills(INTEGER, INTEGER, INTEGER);');
    
    console.log('Stored procedures and triggers dropped');
};




