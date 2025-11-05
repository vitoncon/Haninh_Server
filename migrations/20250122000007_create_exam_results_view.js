/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Create view for 4-skill exam results (MySQL compatible)
    await knex.raw(`
        CREATE VIEW exam_results_by_skills AS
        SELECT 
            e.id as exam_id,
            e.exam_name,
            e.exam_type,
            e.exam_date,
            e.language,
            e.class_id,
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
        LEFT JOIN exam_results listening ON es_listening.id = listening.exam_skill_id
        LEFT JOIN exam_skills es_speaking ON e.id = es_speaking.exam_id AND es_speaking.skill_type = 'Nói'
        LEFT JOIN exam_results speaking ON es_speaking.id = speaking.exam_skill_id
        LEFT JOIN exam_skills es_reading ON e.id = es_reading.exam_id AND es_reading.skill_type = 'Đọc'
        LEFT JOIN exam_results reading ON es_reading.id = reading.exam_skill_id
        LEFT JOIN exam_skills es_writing ON e.id = es_writing.exam_id AND es_writing.skill_type = 'Viết'
        LEFT JOIN exam_results writing ON es_writing.id = writing.exam_skill_id;
    `);
    
    console.log('MySQL view for 4-skill exam results created successfully');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Drop view
    await knex.raw('DROP VIEW IF EXISTS exam_results_by_skills;');
    
    console.log('MySQL view dropped');
};




