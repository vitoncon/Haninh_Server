const knex = require('knex');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER_NAME || 'root',
    password: process.env.DB_USER_PASS || '',
    database: process.env.DB_NAME || 'haninh_academy_manager',
    port: Number(process.env.DB_PORT) || 3306,
  }
});

async function test() {
    const userId = 2; // gvtrang@gmail.com
    try {
        console.log('--- Initial State ---');
        const initialTeacher = await db('teachers').where({ id: 7 }).first();
        console.log('Teacher 7 user_id:', initialTeacher.user_id);

        // Simulate the logic in MainController.get
        console.log('--- Simulating Scoping Logic ---');
        const teachersHasIsDeleted = false; // Corrected based on DESCRIBE
        
        const teacherQuery = db('teachers').select('id').where({ user_id: userId });
        if (teachersHasIsDeleted) teacherQuery.andWhere({ is_deleted: 0 });
        let teacher = await teacherQuery.first();
        let teacherId = teacher?.id ? Number(teacher.id) : null;

        if (!teacherId) {
            console.log('Teacher not found by user_id, trying email...');
            const user = await db('users').select('email').where({ id: userId }).first();
            if (user?.email) {
                console.log('User email:', user.email);
                const teacherByEmailQuery = db('teachers').select('id').where({ email: user.email });
                if (teachersHasIsDeleted) teacherByEmailQuery.andWhere({ is_deleted: 0 });
                const teacherByEmail = await teacherByEmailQuery.first();
                
                if (teacherByEmail) {
                    teacherId = Number(teacherByEmail.id);
                    console.log('Found teacher by email, linking...');
                    await db('teachers').where({ id: teacherId }).update({ user_id: userId });
                }
            }
        }

        console.log('--- Result State ---');
        const finalTeacher = await db('teachers').where({ id: 7 }).first();
        console.log('Teacher 7 user_id:', finalTeacher.user_id);
        console.log('teacherId used for scoping:', teacherId);

    } catch (e) {
        console.error(e);
    } finally {
        await db.destroy();
    }
}

test();
