// src/controllers/MainController.ts
import { Router, Request, Response, NextFunction } from 'express';
import { MainService } from '@services/main.service';
// import fs from 'fs';
// import path from 'path';
import { Helper } from '@utils/helper/helper';
import { RouterConfigs } from '../configs/routerConfig.config';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { BadRequestError } from '../core/errors/error.response';
import { PostAndUpdateDeleteResponse } from '../core/responses/response.response';
import db from '../db/config.db';
import { RBAC_Helper } from '../utils/rbac.helper';

async function tableHasColumn(table: string, column: string): Promise<boolean> {
    try {
        const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
        return Array.isArray(columnsInfo?.[0]) && columnsInfo[0].some((col: any) => col.Field === column);
    } catch (e) {
        // If SHOW COLUMNS fails for any reason, assume column doesn't exist to avoid crashing.
        return false;
    }
}

export class MainController {
    private static async getTeacherContext(userId: number) {
        const teachersHasIsDeleted = await tableHasColumn('teachers', 'is_deleted');
        let teacherQuery = db('teachers').select('id').where({ user_id: userId });
        if (teachersHasIsDeleted) teacherQuery = teacherQuery.andWhere({ is_deleted: 0 });
        let teacherRecord = await teacherQuery.first();

        if (!teacherRecord) {
            const user = await db('users').select('email').where({ id: userId }).first();
            if (user?.email) {
                let teacherByEmailQuery = db('teachers').select('id').where({ email: user.email });
                if (teachersHasIsDeleted) teacherByEmailQuery = teacherByEmailQuery.andWhere({ is_deleted: 0 });
                const teacherByEmail = await teacherByEmailQuery.first();
                if (teacherByEmail) {
                    await db('teachers').where({ id: teacherByEmail.id }).update({ user_id: userId });
                    teacherRecord = { id: teacherByEmail.id };
                }
            }
        }

        if (!teacherRecord) return null;

        const teacherId = Number(teacherRecord.id);
        const classTeachersHasIsDeleted = await tableHasColumn('class_teachers', 'is_deleted');
        const classRowsQuery = db('class_teachers').distinct('class_id').where({ teacher_id: teacherId });
        if (classTeachersHasIsDeleted) classRowsQuery.andWhere({ is_deleted: 0 });
        const classRows = await classRowsQuery;
        const classIds = (classRows || []).map((r: any) => Number(r.class_id)).filter((n: any) => !isNaN(n) && n > 0);

        return { teacherId, classIds };
    }

    private static async isRecordOwnedByTeacher(table: string, id: number, context: { teacherId: number, classIds: number[] }): Promise<boolean> {
        const { teacherId, classIds } = context;

        if (table === 'teachers') return id === teacherId;
        if (['class_teachers', 'teaching_assignments'].includes(table)) {
            const row = await db(table).where({ id, teacher_id: teacherId }).first();
            return !!row;
        }
        if (['classes'].includes(table)) return classIds.includes(id);
        if (['schedules', 'class_schedules', 'class_students', 'attendance', 'study_results', 'exams'].includes(table)) {
            const row = await db(table).where({ id }).first();
            return row && classIds.includes(Number(row.class_id));
        }
        if (table === 'exam_skills') {
            const row = await db('exam_skills')
                .join('exams', 'exam_skills.exam_id', 'exams.id')
                .where('exam_skills.id', id)
                .select('exams.class_id')
                .first();
            return row && classIds.includes(Number(row.class_id));
        }
        if (table === 'exam_results') {
            const row = await db('exam_results').where({ id }).select('student_id').first();
            if (!row) return false;
            const studentInClass = await db('class_students').where({ student_id: row.student_id }).whereIn('class_id', classIds).first();
            return !!studentInClass;
        }
        if (table === 'students') {
            const studentInClass = await db('class_students').where({ student_id: id }).whereIn('class_id', classIds).first();
            return !!studentInClass;
        }

        return false;
    }

    private static filterSensitiveFields(table: string, data: any, roles: number[]) {
        const isAdmin = roles.includes(1);
        if (isAdmin) return data;

        const excludeFields = ['salary', 'address', 'user_id'];
        
        const filterItem = (item: any) => {
            if (!item || typeof item !== 'object') return item;
            const newItem = { ...item };
            
            // For teachers table, only hide sensitive info of OTHER teachers
            // If it's their own record (matched by user_id or provided in context), we could show it, 
            // but for simplicity and security, we filter it unless they are admin.
            // Actually, requirements say "Filter sensitive columns (salary, address, user_id) for role_id = 2"
            if (table === 'teachers') {
                excludeFields.forEach(field => delete newItem[field]);
            }
            return newItem;
        };

        if (Array.isArray(data)) {
            return data.map(filterItem);
        }
        return filterItem(data);
    }

    static async create(req: Request, res: Response): Promise<any> {
        try {
            const { router } = req.params;
            if (!router) throw new BadRequestError(`Router ${router} not found`);
            const table = RouterConfigs[router];
            if (!table) throw new BadRequestError(`Table for router ${router} not found`);
            
            const { decode, ...data } = req.body;
            
            // Teacher write scoping safety check
            if (decode && Array.isArray(decode.roles) && decode.roles.includes(2) && !decode.roles.includes(1)) {
                const context = await MainController.getTeacherContext(decode.id);
                if (!context) return res.status(403).json({ error: "Teacher record not found" });

                if (['attendance', 'study_results', 'schedules', 'exams'].includes(table.table)) {
                    const targetClassId = Number(data.class_id);
                    if (!targetClassId) return res.status(403).json({ error: "Missing class_id for teacher scoping check" });
                    
                    if (!context.classIds.includes(targetClassId)) {
                        return res.status(403).json({ error: "Teacher cannot write data for a class they do not teach." });
                    }
                } else if (table.table === 'exam_skills') {
                     const examId = Number(data.exam_id);
                     const exam = await db('exams').where({ id: examId }).select('class_id').first();
                     if (!exam || !context.classIds.includes(Number(exam.class_id))) {
                         return res.status(403).json({ error: "Teacher cannot create skills for an exam they don't own." });
                     }
                } else if (table.table === 'exam_results') {
                     const studentId = Number(data.student_id);
                     const studentInClass = await db('class_students').where({ student_id: studentId }).whereIn('class_id', context.classIds).first();
                     if (!studentInClass) {
                         return res.status(403).json({ error: "Teacher cannot create results for a student not in their classes." });
                     }
                } else {
                    return res.status(403).json({ error: "Teacher cannot create records in this table" }); 
                }
            }

            let response = table.table === 'users' ? await UserService.create(data) : await MainService.createRecord(table.table, data);
            res.status(201).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async put(req: Request, res: Response, next: NextFunction): Promise<any>{
        try {
            const { router, id } = req.params;
            const table = RouterConfigs[router];
            if (!table || !id) throw new BadRequestError('Invalid request');

            const { decode, ...data } = req.body;
            const recordId = parseInt(id);

            if (decode && Array.isArray(decode.roles) && decode.roles.includes(2) && !decode.roles.includes(1)) {
                const context = await MainController.getTeacherContext(decode.id);
                if (!context || !(await MainController.isRecordOwnedByTeacher(table.table, recordId, context))) {
                    return res.status(403).json({ error: "Forbidden: Teacher does not own this record" });
                }
            }

            const response = await MainService.updateRecord(table.table, recordId, data);
            res.status(200).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            next(error);
        }
    }

    static async setIsDelete(req: Request, res: Response, next: NextFunction) : Promise<any> {
        try {
            const { router, id } = req.params;
            const table = RouterConfigs[router];
            if (!table || !id) throw new BadRequestError('Invalid request');
            
            const { decode } = req.body;
            const recordId = parseInt(id);

            if (decode && Array.isArray(decode.roles) && decode.roles.includes(2) && !decode.roles.includes(1)) {
                // Giáo viên không được phép xóa dữ liệu hệ thống quan trọng
                if (['study_results', 'exams', 'exam_results', 'classes', 'courses', 'students', 'schedules', 'class_schedules', 'class_students'].includes(table.table)) {
                    return res.status(403).json({ error: "Teachers are not allowed to delete this resource" });
                }
                const context = await MainController.getTeacherContext(decode.id);
                if (!context || !(await MainController.isRecordOwnedByTeacher(table.table, recordId, context))) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }

            const response = await MainService.softDeleteRecord(table.table, recordId);
            res.status(200).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            next(error);
        }
    }

    static async delete(req: Request, res: Response) : Promise<any> {
        try {
            const { router, id } = req.params;
            const table = RouterConfigs[router];
            if (!table || !id) return res.status(400).json({ error: 'Invalid request' });

            const { decode } = req.body;
            const recordId = parseInt(id);

            if (decode && Array.isArray(decode.roles) && decode.roles.includes(2) && !decode.roles.includes(1)) {
                // Giáo viên không được phép xóa dữ liệu hệ thống quan trọng
                if (['study_results', 'exams', 'exam_results', 'classes', 'courses', 'students', 'schedules', 'class_schedules', 'class_students'].includes(table.table)) {
                    return res.status(403).json({ error: "Teachers are not allowed to delete this resource" });
                }
                const context = await MainController.getTeacherContext(decode.id);
                if (!context || !(await MainController.isRecordOwnedByTeacher(table.table, recordId, context))) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }

            const response = await MainService.deleteRecord(table.table, recordId);
            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async get(req: Request, res: Response) : Promise<any> {
        try {
            const { router } = req.params;
            const table = RouterConfigs[router];
            if (!table) return res.status(404).json({ error: 'Not found' });

            let conditions = req.query.condition ? JSON.parse(req.query.condition as string) : [];

            // Safely read decoded user information injected by middleware.
            // Prefer req.decode (if middleware attached it there), otherwise fall back to req.body.decode.
            const decoded: any = (req as any).decode || (req.body && (req.body as any).decode);

            // ===== Teacher scoping (role 2, không phải admin) =====
            if (decoded && Array.isArray(decoded.roles) && decoded.roles.includes(2) && !decoded.roles.includes(1)) {
                const context = await MainController.getTeacherContext(decoded.id);
                if (!context) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });

                if (table.table === 'teachers') {
                    conditions.push({ key: 'id', value: context.teacherId.toString(), compare: '=', orWhere: 'and' });
                } else if (['class_teachers', 'teaching_assignments'].includes(table.table)) {
                    conditions.push({ key: 'teacher_id', value: context.teacherId.toString(), compare: '=', orWhere: 'and' });
                } else if (['classes', 'schedules', 'class_schedules', 'class_students', 'attendance', 'study_results', 'exams'].includes(table.table)) {
                    if (context.classIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    const key = table.table === 'classes' ? 'id' : 'class_id';
                    conditions.push({ key, value: context.classIds.join(','), compare: 'in', orWhere: 'and' });
                } else if (table.table === 'exam_skills') {
                    if (context.classIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    const examRows = await db('exams').whereIn('class_id', context.classIds).select('id');
                    const examIds = examRows.map((r: any) => r.id);
                    if (examIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    conditions.push({ key: 'exam_id', value: examIds.join(','), compare: 'in', orWhere: 'and' });
                } else if (table.table === 'exam_results') {
                    if (context.classIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    const studentRows = await db('class_students').whereIn('class_id', context.classIds).select('student_id');
                    const studentIds = studentRows.map((r: any) => r.student_id);
                    if (studentIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    conditions.push({ key: 'student_id', value: studentIds.join(','), compare: 'in', orWhere: 'and' });
                } else if (table.table === 'students') {
                    try {
                        if (context.classIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                        
                        const classStudentsHasIsDeleted = await tableHasColumn('class_students', 'is_deleted');
                        let studentRowsQuery = db('class_students').distinct('student_id').whereIn('class_id', context.classIds);
                        if (classStudentsHasIsDeleted) studentRowsQuery = studentRowsQuery.andWhere({ is_deleted: 0 });
                        
                        const studentRows = await studentRowsQuery;
                        const studentIds = studentRows.map((r: any) => r.student_id);
                        
                        if (studentIds.length === 0) return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                        conditions.push({ key: 'id', value: studentIds.join(','), compare: 'in', orWhere: 'and' });
                    } catch (error) {
                        console.error('Error in student scoping logic:', error);
                        return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    }
                }
            }

            // ===== Student scoping (role 3, không phải admin/teacher) =====
            if (decoded && Array.isArray(decoded.roles) && decoded.roles.includes(3) && !decoded.roles.includes(1) && !decoded.roles.includes(2)) {
                try {
                    const studentContext = await RBAC_Helper.getStudentContext(decoded.id);
                    if (!studentContext) {
                        // Không tìm thấy mapping student cho user hiện tại -> trả về rỗng an toàn
                        return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    }

                    const { studentId, classIds } = studentContext;

                    if (!studentId || Number.isNaN(studentId)) {
                        // Không có studentId hợp lệ -> trả về rỗng an toàn
                        return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                    }

                    if (table.table === 'students') {
                        // Học viên chỉ xem được hồ sơ của chính mình
                        conditions.push({ key: 'id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                    } else if (table.table === 'class_students') {
                        // Chỉ xem được các bản ghi enroll của chính mình
                        conditions.push({ key: 'student_id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                    } else if (table.table === 'classes') {
                        // Chỉ xem các lớp mình đã/đang học
                        if (!classIds.length) {
                            return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                        }
                        conditions.push({ key: 'id', value: classIds.join(','), compare: 'in', orWhere: 'and' });
                    } else if (table.table === 'study_results') {
                        // Học viên chỉ xem được kết quả học tập của chính mình
                        // Sử dụng tên cột trực tiếp vì truy vấn đang select từ bảng gốc, không dùng alias/join
                        conditions.push({ key: 'student_id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                    } else if (table.table === 'exam_results') {
                        // Học viên chỉ xem được kết quả thi của chính mình
                        conditions.push({ key: 'student_id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                    } else if (table.table === 'fees') {
                        // Học viên chỉ xem được học phí của chính mình
                        conditions.push({ key: 'student_id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                    } else if (['schedules', 'class_schedules', 'exams', 'attendance'].includes(table.table)) {
                        // Các bảng liên quan tới lớp/học viên nhưng không dùng logic giáo viên
                        if (!classIds.length) {
                            return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                        }

                        const key = 'class_id';
                        conditions.push({ key, value: classIds.join(','), compare: 'in', orWhere: 'and' });

                        if (table.table === 'attendance') {
                            // Attendance có student_id nên giới hạn thêm theo chính học viên
                            conditions.push({ key: 'student_id', value: studentId.toString(), compare: '=', orWhere: 'and' });
                        }
                    }
                } catch (error) {
                    console.error('Error in student scoping logic:', error);
                    // Đảm bảo không trả lỗi 500 cho học viên, chỉ trả về rỗng an toàn
                    return res.status(200).json({ code: 'success', data: [], recordTotal: 0, recordFiltered: 0 });
                }
            }
            
            const limit = parseInt(req.query.limit?.toString() ?? '20', 10);
            const page = parseInt(req.query.page?.toString() ?? '1', 10);
            const searchKeyword = (req.query.q ?? req.query.search ?? '').toString().trim();

            // For the study-results router, use a specialized joined query on exam_results/exams/classes
            const response = router === 'study-results'
                ? await MainService.getExamResultsWithDetails(conditions, limit, page, searchKeyword)
                : await MainService.getRecords(
                    table.table,
                    conditions,
                    req.query.include?.toString(),
                    req.query.include_by?.toString(),
                    req.query.order?.toString(),
                    req.query.order_by?.toString(),
                    limit,
                    page,
                    searchKeyword
                );
            
            if (decoded) {
                response.data = MainController.filterSensitiveFields(table.table, response.data, decoded.roles);
            }

            const keyType = MainService.getKeyTypeFromModule(router);
            if(keyType) response.data = new Helper().convertDataTypeResponse(response.data, keyType);

            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { router, id } = req.params;
            const table = RouterConfigs[router];
            if (!table || !id) return res.status(404).json({ error: 'Not found' });
            
            const decoded = req.body.decode;
            const recordId = parseInt(id);

            if (decoded && Array.isArray(decoded.roles) && decoded.roles.includes(2) && !decoded.roles.includes(1)) {
                const context = await MainController.getTeacherContext(decoded.id);
                if (!context || !(await MainController.isRecordOwnedByTeacher(table.table, recordId, context))) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }

            let response = await MainService.getRecordById(table.table, recordId);
            if (decoded) {
                response = MainController.filterSensitiveFields(table.table, response, decoded.roles);
            }
            res.status(200).json(new PostAndUpdateDeleteResponse(response));
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const user_id = req.body.decode.id;
            if(!user_id) return res.status(404).json('user not found');
            const user = await UserService.getProfile(user_id);
            return res.json({data: user}); 
        } catch (error: any) {
            next(error);
        }
    }

    static async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { feeId, studentId, courseId, transferNote } = req.body;
            const decoded = (req as any).decode || req.body.decode;

            if (!studentId || !courseId || !transferNote) {
                return res.status(400).json({ error: "Missing required fields: studentId, courseId, transferNote" });
            }

            // Security check: If student, ensure they are confirming for themselves
            if (decoded && Array.isArray(decoded.roles) && decoded.roles.includes(3) && !decoded.roles.includes(1) && !decoded.roles.includes(2)) {
                const studentContext = await RBAC_Helper.getStudentContext(decoded.id);
                if (!studentContext || studentContext.studentId !== Number(studentId)) {
                    return res.status(403).json({ error: "Forbidden: You can only confirm payments for yourself" });
                }
            }

            // Check for existing fee record
            let query = db('fees').where({
                student_id: studentId,
                course_id: courseId,
                is_deleted: 0
            });

            if (feeId) {
                query = query.where({ id: feeId });
            }

            const feeRecord = await query.first();

            if (!feeRecord) {
                return res.status(404).json({ error: "No fee record found for this student and course" });
            }

            // Duplicate submission protection: Check if already submitted or paid
            const currentStatus = MainService.normalizeStatus(feeRecord.status);
            if (currentStatus === 'PAID') {
                return res.status(400).json({ 
                    error: 'Thanh toán đã hoàn tất.' 
                });
            }
            if (feeRecord.is_payment_submitted) {
                return res.status(400).json({ 
                    error: 'Yêu cầu thanh toán đang chờ duyệt.' 
                });
            }

            // Student submit -> ONLY set is_payment_submitted = true
            await db('fees')
                .where({ id: feeRecord.id })
                .update({
                    is_payment_submitted: true,
                    notes: transferNote,
                    updated_at: new Date()
                });

            return res.status(200).json({ 
                code: 'success', 
                message: "Payment confirmation submitted successfully. Waiting for admin approval.",
                data: { id: feeRecord.id, status: 'debt', is_payment_submitted: true }
            });
        } catch (error: any) {
            console.error('Error confirming payment:', error);
            res.status(500).json({ error: error.message });
        }
    }
}


