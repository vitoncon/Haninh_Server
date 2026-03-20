import db from '../db/config.db';
import PDFDocument from 'pdfkit';
import fs from 'fs';

export class ReportService {
    static async getStudentReportData(studentId: number) {
        // ... (data fetching logic remain same)
        const student = await db('students').where({ id: studentId }).first();
        if (!student) throw new Error('Không tìm thấy học viện');

        const classInfo = await db('class_students as cs')
            .join('classes as c', 'cs.class_id', 'c.id')
            .where('cs.student_id', studentId)
            .select('c.*')
            .first();

        const results = await db('exam_results as er')
            .join('exams as e', 'er.exam_id', 'e.id')
            .where('er.student_id', studentId)
            .select(
                'e.exam_name',
                'er.total_score',
                'e.exam_date',
                'e.status'
            )
            .where('e.status', 'published');

        const attendanceRecords = await db('attendance')
            .where({ student_id: studentId, is_deleted: 0 });
        
        const attendance = {
            total: attendanceRecords.length,
            present: attendanceRecords.filter(r => r.status === 'present').length,
            absent: attendanceRecords.filter(r => r.status === 'absent').length,
            late: attendanceRecords.filter(r => r.status === 'late').length,
            excused: attendanceRecords.filter(r => r.status === 'excused').length
        };

        return { student, classInfo, results, attendance };
    }

    static generateStudentPDF(data: any, stream: NodeJS.WritableStream) {
        const { student, classInfo, results, attendance } = data;
        const doc = new PDFDocument({ margin: 50 });

        // --- Font Registration for Vietnamese Support ---
        const fontPath = 'C:\\Windows\\Fonts\\Arial.ttf';
        const fontBoldPath = 'C:\\Windows\\Fonts\\Arialbd.ttf';
        
        let titleFont = 'Helvetica-Bold';
        let regularFont = 'Helvetica';

        if (fs.existsSync(fontPath)) {
            doc.registerFont('Arial', fontPath);
            regularFont = 'Arial';
            if (fs.existsSync(fontBoldPath)) {
                doc.registerFont('Arial-Bold', fontBoldPath);
                titleFont = 'Arial-Bold';
            }
            doc.font(regularFont);
        }

        doc.pipe(stream);

        // Header
        doc.fontSize(20).font(titleFont).text('HA NINH ACADEMY', { align: 'center' });
        doc.fontSize(16).text('BÁO CÁO TIẾN ĐỘ HỌC TẬP', { align: 'center' });
        doc.moveDown();

        // Student Info
        doc.fontSize(12).font(regularFont).text(`Học viên: ${student.full_name}`);
        doc.text(`Mã HV: ${student.student_code || 'N/A'}`);
        doc.text(`Lớp: ${classInfo?.class_name || 'N/A'}`);
        doc.text(`Ngày sinh: ${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}`);
        doc.moveDown();

        // Attendance Summary
        doc.fontSize(14).font(titleFont).text('Tóm tắt chuyên cần');
        doc.fontSize(12).font(regularFont);
        doc.text(`Tổng số buổi: ${attendance.total}`);
        doc.text(`Hiện diện: ${attendance.present} | Vắng: ${attendance.absent} | Muộn: ${attendance.late} | Phép: ${attendance.excused}`);
        const attendRate = attendance.total > 0 ? Math.round(((attendance.present + attendance.late + attendance.excused) / attendance.total) * 100) : 0;
        doc.text(`Tỷ lệ chuyên cần: ${attendRate}%`);
        doc.moveDown();

        // Table Header
        doc.fontSize(14).font(titleFont).text('Kết quả học tập');
        doc.moveDown(0.5);
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Tên bài kiểm tra', 50, tableTop);
        doc.text('Ngày', 300, tableTop);
        doc.text('Điểm số', 500, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Rows
        doc.font(regularFont);
        let currentY = tableTop + 25;
        let totalScore = 0;

        results.forEach((res: any) => {
            doc.text(res.exam_name, 50, currentY);
            doc.text(new Date(res.exam_date).toLocaleDateString('vi-VN'), 300, currentY);
            doc.text(res.total_score.toString(), 500, currentY);
            totalScore += Number(res.total_score);
            currentY += 20;

            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
        });

        // Footer
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        doc.moveDown();
        const avgScore = results.length > 0 ? (totalScore / results.length).toFixed(2) : '0';
        doc.fontSize(12).font(titleFont).text(`Điểm trung bình: ${avgScore}`, { align: 'right' });
        doc.fontSize(10).font(regularFont).text(`Tạo lúc: ${new Date().toLocaleString('vi-VN')}`, { align: 'right' });

        doc.end();
    }
}

