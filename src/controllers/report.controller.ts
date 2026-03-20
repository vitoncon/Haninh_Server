// src/controllers/report.controller.ts
import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { RBAC_Helper } from '../utils/rbac.helper';

export class ReportController {
    static async exportStudentResults(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const studentId = Number(id);
            const { decode } = req.body;
            const roles = decode.roles || [];
            const isAdmin = roles.includes(1);
            const isTeacher = roles.includes(2) && !isAdmin;

            if (isTeacher) {
                const context = await RBAC_Helper.getTeacherContext(decode.id);
                if (!context || !(await RBAC_Helper.isStudentOwnedByTeacher(studentId, context))) {
                    return res.status(403).json({ error: 'Bạn không có quyền xuất báo cáo cho học viên này' });
                }
            }

            const data = await ReportService.getStudentReportData(studentId);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bang_Diem_${data.student.student_code || studentId}.pdf`);

            ReportService.generateStudentPDF(data, res);
        } catch (error: any) {
            console.error('Report Error:', error);
            if (!res.headersSent) {
                return res.status(500).json({ error: error.message });
            }
        }
    }
}
