// src/services/attendance.service.ts
import db from '../db/config.db';
import { RBAC_Helper } from '../utils/rbac.helper';

export class AttendanceService {
    static async markAttendance(data: any) {
        const { class_id, date, records, created_by } = data;
        const results = [];

        for (const record of records) {
            const { student_id, status, schedule_id } = record;
            
            const existing = await db('attendance')
                .where({ class_id, student_id, attendance_date: date })
                .first();

            if (existing) {
                await db('attendance')
                    .where({ id: existing.id })
                    .update({
                        status,
                        schedule_id: schedule_id || existing.schedule_id,
                        updated_by: created_by,
                        updated_at: db.fn.now()
                    });
                results.push({ student_id, action: 'updated' });
            } else {
                const [newId] = await db('attendance').insert({
                    class_id,
                    student_id,
                    attendance_date: date,
                    status,
                    schedule_id,
                    created_by,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                });
                results.push({ student_id, action: 'inserted', id: newId });
            }
        }
        
        return { message: 'Ghi nhận điểm danh thành công', processed: results.length };
    }

    static async getAttendanceByClass(classId: number, date?: string) {
        // Normalize date to YYYY-MM-DD (MySQL DATE) or default to today
        const targetDate =
            date && typeof date === 'string'
                ? date
                : new Date().toISOString().split('T')[0];

        // Get all students in class
        const classStudentsHasIsDeleted = await RBAC_Helper.tableHasColumn(
            'class_students',
            'is_deleted'
        );

        let studentsQuery = db('class_students as cs')
            .join('students as s', 'cs.student_id', 's.id')
            .where('cs.class_id', classId);

        if (classStudentsHasIsDeleted) {
            studentsQuery = studentsQuery.where('cs.is_deleted', 0);
        }

        const students = await studentsQuery.select(
            's.id as student_id',
            's.full_name',
            's.student_code'
        );

        // Get attendance records for the date (if table has is_deleted column, respect soft-delete)
        const attendanceHasIsDeleted = await RBAC_Helper.tableHasColumn(
            'attendance',
            'is_deleted'
        );

        let attendanceQuery = db('attendance')
            .where('class_id', classId)
            .where('attendance_date', targetDate);

        if (attendanceHasIsDeleted) {
            attendanceQuery = attendanceQuery.where('is_deleted', 0);
        }

        const attendance = await attendanceQuery;

        // Merge: ensure every student appears, even without attendance record
        return students.map((s: any) => {
            const record = attendance.find(
                (a: any) => a.student_id === s.student_id
            );
            return {
                student_id: s.student_id,
                full_name: s.full_name,
                student_code: s.student_code,
                status: record ? record.status : 'present'
            };
        });
    }

    static async getAttendanceByStudent(studentId: number) {
        return await db('attendance as a')
            .join('classes as c', 'a.class_id', 'c.id')
            .select(
                'a.*',
                'c.class_name'
            )
            .where('a.student_id', studentId)
            .where('a.is_deleted', 0)
            .orderBy('a.attendance_date', 'desc');
    }

    static async getAnalytics(filters: { class_id?: number, student_id?: number, month?: string }) {
        // Overall stats
        const allRecords = await db('attendance').where('is_deleted', 0);
        const totalDays = new Set(allRecords.map(r => r.attendance_date)).size;
        
        // Class rates
        const classRates = await db('attendance as a')
            .join('classes as c', 'a.class_id', 'c.id')
            .select('c.class_name', 'a.class_id')
            .count('a.id as total_count')
            .select(db.raw('SUM(CASE WHEN a.status IN ("present", "late", "excused") THEN 1 ELSE 0 END) as present_count'))
            .groupBy('a.class_id', 'c.class_name');

        const classRatesFormatted = classRates.map((c: any) => ({
            class_name: c.class_name,
            attendance_rate: Math.round((c.present_count / c.total_count) * 100)
        }));

        // Student rates
        const studentRates = await db('attendance as a')
            .join('students as s', 'a.student_id', 's.id')
            .join('classes as c', 'a.class_id', 'c.id')
            .select('s.full_name', 'c.class_name', 'a.student_id')
            .count('a.id as total_count')
            .select(db.raw('SUM(CASE WHEN a.status IN ("present", "late", "excused") THEN 1 ELSE 0 END) as present_count'))
            .groupBy('a.student_id', 's.full_name', 'c.class_name')
            .orderBy('total_count', 'desc')
            .limit(50);

        const studentRatesFormatted = studentRates.map((s: any) => ({
            full_name: s.full_name,
            class_name: s.class_name,
            total_count: s.total_count,
            present_count: s.present_count,
            rate: Math.round((s.present_count / s.total_count) * 100)
        }));

        // Top absent student
        const topAbsent = studentRatesFormatted.sort((a, b) => a.rate - b.rate)[0];

        const avgRate = classRatesFormatted.length > 0 
            ? Math.round(classRatesFormatted.reduce((acc, curr) => acc + curr.attendance_rate, 0) / classRatesFormatted.length)
            : 0;

        return {
            total_days: totalDays,
            avg_rate: avgRate,
            top_absent_student: topAbsent ? topAbsent.full_name : 'N/A',
            class_rates: classRatesFormatted,
            student_rates: studentRatesFormatted
        };
    }
}
