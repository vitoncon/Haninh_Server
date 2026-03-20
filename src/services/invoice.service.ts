import db from '../db/config.db';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';

export class InvoiceService {
    /**
     * Generate a professional PDF invoice for a fee record with Vietnamese support
     */
    static async generateInvoicePDF(feeId: number, res: Response) {
        // Fetch fee with all details
        const fee = await db('fees')
            .join('courses', 'fees.course_id', 'courses.id')
            .join('students', 'fees.student_id', 'students.id')
            .join('classes', 'fees.class_id', 'classes.id')
            .select(
                'fees.*',
                'courses.course_name',
                'courses.course_code',
                'students.full_name as student_name',
                'students.student_code',
                'classes.class_name'
            )
            .where('fees.id', feeId)
            .first();

        if (!fee) throw new Error('Không tìm thấy bản ghi học phí');
        if (fee.status !== 'PAID') throw new Error('Hóa đơn chỉ có sẵn cho các khoản đã thanh toán');

        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A5', 
            layout: 'portrait'
        });

        // --- Font Registration for Vietnamese Support ---
        const fontPath = 'C:\\Windows\\Fonts\\Arial.ttf';
        const fontBoldPath = 'C:\\Windows\\Fonts\\Arialbd.ttf';
        const fontItalicPath = 'C:\\Windows\\Fonts\\ariali.ttf';

        if (fs.existsSync(fontPath)) {
            doc.registerFont('Arial', fontPath);
            if (fs.existsSync(fontBoldPath)) doc.registerFont('Arial-Bold', fontBoldPath);
            if (fs.existsSync(fontItalicPath)) doc.registerFont('Arial-Italic', fontItalicPath);
            doc.font('Arial');
        } else {
            console.warn('Vietnamese-supporting font (Arial) not found. Falling back to standard fonts.');
        }

        // Pipe to response
        doc.pipe(res);

        // --- Header ---
        const titleFont = fs.existsSync(fontBoldPath) ? 'Arial-Bold' : 'Helvetica-Bold';
        const regularFont = fs.existsSync(fontPath) ? 'Arial' : 'Helvetica';
        const italicFont = fs.existsSync(fontItalicPath) ? 'Arial-Italic' : 'Helvetica-Oblique';

        doc.fontSize(16).font(titleFont).text('HA NINH ACADEMY', { align: 'center' });
        doc.fontSize(10).font(regularFont).text('Địa chỉ: Tổ 3, Phường Tân Thịnh, Thành phố Thái Nguyên, tỉnh Thái Nguyên', { align: 'center' });
        doc.text('Hotline: 0369539223', { align: 'center' });

        doc.moveDown();
        
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // --- Title ---
        doc.fontSize(14).font(titleFont).text('PHIẾU THU HỌC PHÍ', { align: 'center' });
        doc.fontSize(10).font(italicFont).text('(TUITION RECEIPT)', { align: 'center' });
        doc.moveDown();

        // --- Receipt Info ---
        const leftCol = 60;
        const rightCol = 180;

        doc.fontSize(10).font(titleFont).text('Số hóa đơn (No):', leftCol);
        // Use monospaced font for receipt number if possible, or just Arial
        doc.font(regularFont).text(fee.receipt_number || `REC-${fee.id}`, rightCol);
        
        doc.font(titleFont).text('Ngày thu (Date):', leftCol);
        doc.font(regularFont).text(fee.paid_date ? new Date(fee.paid_date).toLocaleDateString('vi-VN') : 'N/A', rightCol);
        doc.moveDown();

        // --- Student Info ---
        doc.font(titleFont).text('Học viên (Student):', leftCol);
        doc.font(regularFont).text(fee.student_name, rightCol);

        doc.font(titleFont).text('Mã HV (ID):', leftCol);
        doc.font(regularFont).text(fee.student_code || 'N/A', rightCol);

        doc.font(titleFont).text('Lớp (Class):', leftCol);
        doc.font(regularFont).text(fee.class_name, rightCol);
        doc.moveDown();

        // --- Payment Details ---
        doc.rect(50, doc.y, doc.page.width - 100, 60).stroke();
        const tableTop = doc.y + 10;
        
        doc.font(titleFont).text('Nội dung (Description)', 60, tableTop);
        doc.text('Thành tiền (Amount)', 250, tableTop);
        
        doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();
        
        doc.font(regularFont).text(`${fee.payment_type || 'Học phí'} - ${fee.course_name}`, 60, tableTop + 25, { width: 180 });
        const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee.amount);
        doc.font(titleFont).text(formattedAmount, 250, tableTop + 25);
        
        doc.moveDown(4);

        // --- Footer Info ---
        doc.font(titleFont).text('Phương thức (Method):', leftCol);
        doc.font(regularFont).text(fee.payment_method || 'N/A', rightCol);

        if (fee.notes) {
            doc.font(titleFont).text('Ghi chú (Note):', leftCol);
            doc.font(regularFont).text(fee.notes, rightCol);
        }

        doc.moveDown(2);

        // --- Signatures ---
        const sigY = doc.y;
        doc.fontSize(9).font(titleFont);
        doc.text('Người nộp tiền', 70, sigY);
        doc.text('Người lập phiếu', 280, sigY);
        
        doc.fontSize(8).font(italicFont);
        doc.text('(Ký, họ tên)', 80, sigY + 12);
        doc.text('(Ký, họ tên)', 290, sigY + 12);

        doc.moveDown(4);
        doc.fillColor('#666666').fontSize(8).font(regularFont).text('Cảm ơn bạn đã đồng hành cùng Ha Ninh Academy!', { align: 'center' });

        // Finalize
        doc.end();
    }
}
