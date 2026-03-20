// src/utils/rbac.helper.ts
import db from '../db/config.db';

export class RBAC_Helper {
    static async tableHasColumn(table: string, column: string): Promise<boolean> {
        try {
            const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
            return Array.isArray(columnsInfo?.[0]) && columnsInfo[0].some((col: any) => col.Field === column);
        } catch (e) {
            return false;
        }
    }

    static async getTeacherContext(userId: number) {
        const teachersHasIsDeleted = await this.tableHasColumn('teachers', 'is_deleted');
        let teacherQuery = db('teachers').select('id').where({ user_id: userId });
        if (teachersHasIsDeleted) teacherQuery = teacherQuery.andWhere({ is_deleted: 0 });
        const teacherRecord = await teacherQuery.first();

        if (!teacherRecord) return null;

        const teacherId = Number(teacherRecord.id);
        const classTeachersHasIsDeleted = await this.tableHasColumn('class_teachers', 'is_deleted');
        const classRowsQuery = db('class_teachers').distinct('class_id').where({ teacher_id: teacherId });
        if (classTeachersHasIsDeleted) classRowsQuery.andWhere({ is_deleted: 0 });
        const classRows = await classRowsQuery;
        const classIds = (classRows || []).map((r: any) => Number(r.class_id)).filter((n: any) => !isNaN(n) && n > 0);

        return { teacherId, classIds };
    }

    /**
     * Lấy ngữ cảnh học viên hiện tại dựa trên user_id.
     * Ưu tiên mapping an toàn qua bảng users (email) và bảng students (email).
     */
    static async getStudentContext(userId: number): Promise<{ studentId: number; classIds: number[] } | null> {
        // Lấy email của user hiện tại
        const user = await db('users').select('email').where({ id: userId }).first();
        if (!user || !user.email) {
            return null;
        }

        const studentsHasIsDeleted = await this.tableHasColumn('students', 'is_deleted');

        // Tìm student theo email (1-1 mapping giữa user và student)
        let studentQuery = db('students').select('id').where({ email: user.email });
        if (studentsHasIsDeleted) {
            studentQuery = studentQuery.andWhere({ is_deleted: 0 });
        }

        const studentRecord = await studentQuery.first();
        if (!studentRecord) {
            return null;
        }

        const studentId = Number(studentRecord.id);

        // Lấy tất cả class_id mà học viên này đang/đã tham gia
        const classStudentsHasIsDeleted = await this.tableHasColumn('class_students', 'is_deleted');
        let classRowsQuery = db('class_students')
            .distinct('class_id')
            .where({ student_id: studentId });

        if (classStudentsHasIsDeleted) {
            classRowsQuery = classRowsQuery.andWhere({ is_deleted: 0 });
        }

        const classRows = await classRowsQuery;
        const classIds = (classRows || [])
            .map((r: any) => Number(r.class_id))
            .filter((n: any) => !isNaN(n) && n > 0);

        return { studentId, classIds };
    }

    static async isClassOwnedByTeacher(classId: number, context: { teacherId: number, classIds: number[] }): Promise<boolean> {
        return context.classIds.includes(Number(classId));
    }

    static async isStudentOwnedByTeacher(studentId: number, context: { teacherId: number, classIds: number[] }): Promise<boolean> {
        const studentInClass = await db('class_students')
            .where({ student_id: studentId })
            .whereIn('class_id', context.classIds)
            .first();
        return !!studentInClass;
    }
}
