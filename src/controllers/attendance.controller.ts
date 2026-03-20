import { Request, Response } from 'express';
import db from '../db/config.db';

import { AttendanceService } from '../services/attendance.service';
import { RBAC_Helper } from '../utils/rbac.helper';


export class AttendanceController {
    static async getTeacherClasses(req: Request, res: Response) {
        try {
            const { decode } = req.body;
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            
            if (isAdmin) {
                const classes = await db('classes')
                    .select('id', 'class_name as name')
                    .where({ is_deleted: 0 });
                return res.status(200).json({ data: classes });
            }

            const context = await RBAC_Helper.getTeacherContext(decode.id);
            if (!context) {
                return res.status(403).json({ error: 'Không tìm thấy hồ sơ giáo viên' });
            }

            const classes = await db('classes')
                .select('id', 'class_name as name')
                .whereIn('id', context.classIds)
                .andWhere({ is_deleted: 0 });

            return res.status(200).json({ data: classes });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async markAttendance(req: Request, res: Response) {

        try {
            const { decode, ...data } = req.body;
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            const isTeacher = roles.includes(2) && !isAdmin;
            const isStudent = roles.includes(3) && !isAdmin && !isTeacher;

            // Học viên không được phép ghi nhận điểm danh
            if (isStudent) {
                return res.status(403).json({ error: 'Học viên không có quyền điểm danh' });
            }

            if (isTeacher) {
                const context = await RBAC_Helper.getTeacherContext(decode.id);
                if (!context || !context.classIds.includes(Number(data.class_id))) {
                    return res.status(403).json({ error: 'Bạn không có quyền điểm danh cho lớp này' });
                }
            }

            const result = await AttendanceService.markAttendance({
                ...data,
                created_by: decode.id
            });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getByClass(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            // For POST, date comes from body; for GET, use query param
            const date = (req.body && (req.body as any).date) || (req.query?.date as string | undefined);
            const { decode } = req.body; // checkLogin places decode in req.body
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            const isTeacher = roles.includes(2) && !isAdmin;
            const isStudent = roles.includes(3) && !isAdmin && !isTeacher;

            // Học viên không được phép xem bảng điểm danh của cả lớp (gồm các học viên khác)
            if (isStudent) {
                return res.status(403).json({ error: 'Học viên không có quyền xem danh sách điểm danh của lớp' });
            }

            if (isTeacher) {
                const context = await RBAC_Helper.getTeacherContext(decode.id);
                if (!context || !context.classIds.includes(Number(classId))) {
                    return res.status(403).json({ error: 'Bạn không có quyền xem thông tin lớp này' });
                }
            }

            const records = await AttendanceService.getAttendanceByClass(Number(classId), date as string);
            return res.status(200).json({ data: records });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getByStudent(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const { decode } = req.body;
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            const isTeacher = roles.includes(2) && !isAdmin;
            const isStudent = roles.includes(3) && !isAdmin && !isTeacher;

            if (isTeacher) {
                const context = await RBAC_Helper.getTeacherContext(decode.id);
                if (!context || !(await RBAC_Helper.isStudentOwnedByTeacher(Number(studentId), context))) {
                    return res.status(403).json({ error: 'Bạn không có quyền xem thông tin học viên này' });
                }
            }

            // Học viên chỉ được xem điểm danh của chính mình
            if (isStudent) {
                const studentContext = await RBAC_Helper.getStudentContext(decode.id);
                if (!studentContext) {
                    return res.status(403).json({ error: 'Không tìm thấy hồ sơ học viên cho tài khoản này' });
                }

                if (studentContext.studentId !== Number(studentId)) {
                    return res.status(403).json({ error: 'Bạn chỉ có thể xem lịch sử điểm danh của chính mình' });
                }
            }

            const records = await AttendanceService.getAttendanceByStudent(Number(studentId));
            return res.status(200).json({ data: records });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getAnalytics(req: Request, res: Response) {
        try {
            const { class_id, student_id, month, decode } = req.body;
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            const isTeacher = roles.includes(2) && !isAdmin;
            const isStudent = roles.includes(3) && !isAdmin && !isTeacher;

            if (isTeacher) {
                const context = await RBAC_Helper.getTeacherContext(decode.id);
                if (!context) return res.status(403).json({ error: 'Quyền truy cập bị từ chối' });

                if (class_id && !context.classIds.includes(Number(class_id))) {
                    return res.status(403).json({ error: 'Bạn không có quyền xem báo cáo lớp này' });
                }
                if (student_id && !(await RBAC_Helper.isStudentOwnedByTeacher(Number(student_id), context))) {
                    return res.status(403).json({ error: 'Bạn không có quyền xem báo cáo học viên này' });
                }
            }

            // Học viên chỉ được xem thống kê điểm danh của chính mình (không xem toàn hệ thống)
            let effectiveClassId: number | undefined = class_id ? Number(class_id) : undefined;
            let effectiveStudentId: number | undefined = student_id ? Number(student_id) : undefined;

            if (isStudent) {
                const studentContext = await RBAC_Helper.getStudentContext(decode.id);
                if (!studentContext) {
                    return res.status(403).json({ error: 'Không tìm thấy hồ sơ học viên cho tài khoản này' });
                }

                effectiveStudentId = studentContext.studentId;
                // Không ép buộc class_id ở đây, vì báo cáo có thể tổng hợp theo nhiều lớp
                effectiveClassId = undefined;
            }

            const analytics = await AttendanceService.getAnalytics({ 
                class_id: effectiveClassId, 
                student_id: effectiveStudentId, 
                month: month as string 
            });
            return res.status(200).json(analytics);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
