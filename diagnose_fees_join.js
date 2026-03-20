const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function diagnose() {
  try {
    console.log('--- DIAGNOSING FEES JOIN DATA ---');
    
    // Check tables counts
    const feesCount = await db('fees').count('id as count');
    const studentsCount = await db('students').count('id as count');
    const classesCount = await db('classes').count('id as count');
    console.log(`Counts: Fees=${feesCount[0].count}, Students=${studentsCount[0].count}, Classes=${classesCount[0].count}`);

    // Try the joined query
    const joinedData = await db('fees')
      .join('courses', 'fees.course_id', 'courses.id')
      .join('students', 'fees.student_id', 'students.id')
      .join('classes', 'fees.class_id', 'classes.id')
      .select(
        'fees.id',
        'fees.student_id',
        'fees.class_id',
        'courses.course_name',
        'students.full_name as student_full_name',
        'classes.class_name as class_name_from_db'
      )
      .limit(5);

    console.log('--- JOINED DATA (INNER JOIN) ---');
    console.log(JSON.stringify(joinedData, null, 2));

    // Try LEFT JOIN for comparison
    const leftJoinedData = await db('fees')
      .join('courses', 'fees.course_id', 'courses.id')
      .leftJoin('students', 'fees.student_id', 'students.id')
      .leftJoin('classes', 'fees.class_id', 'classes.id')
      .select(
        'fees.id',
        'fees.student_id',
        'fees.class_id',
        'students.full_name',
        'classes.class_name'
      )
      .limit(5);

    console.log('--- JOINED DATA (LEFT JOIN) ---');
    console.log(JSON.stringify(leftJoinedData, null, 2));

  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  } finally {
    await db.destroy();
  }
}

diagnose();
