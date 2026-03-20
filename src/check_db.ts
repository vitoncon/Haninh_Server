import db from './src/db/config.db';

async function check() {
    try {
        console.log('--- Users ---');
        const users = await db('users').select('id', 'name', 'email').where('is_deleted', 0);
        console.table(users);

        console.log('--- User Roles ---');
        const userRoles = await db('user_roles').select('user_id', 'role_id');
        console.table(userRoles);

        console.log('--- Teachers ---');
        const teachers = await db('teachers').select('id', 'user_id', 'name');
        console.table(teachers);

        console.log('--- Class Teachers ---');
        const classTeachers = await db('class_teachers').select('id', 'class_id', 'teacher_id');
        console.table(classTeachers);

        console.log('--- Classes ---');
        const classes = await db('classes').select('id', 'name');
        console.table(classes);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
