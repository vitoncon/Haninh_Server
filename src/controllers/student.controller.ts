import { Request, Response, NextFunction } from 'express';
import db from '../db/config.db';
import { RBAC_Helper } from '../utils/rbac.helper';
import { MainService } from '../services/main.service';
import { InvoiceService } from '../services/invoice.service';


export class StudentController {
    
    /**
     * Get all available courses with basic information
     */
    static async getCourses(req: Request, res: Response): Promise<any> {
        try {
            const { decode } = req.body;
            let studentId = 0;
            
            if (decode && decode.id) {
                const studentContext = await RBAC_Helper.getStudentContext(decode.id);
                studentId = studentContext?.studentId || 0;
            }

            const courses = await db('courses')
                .leftJoin('enrollments', function() {
                    this.on('courses.id', '=', 'enrollments.course_id')
                        .andOn('enrollments.student_id', '=', db.raw('?', [studentId]))
                })
                .select(
                    'courses.id', 
                    'courses.course_name as name', 
                    'courses.language', 
                    'courses.tuition_fee as price', 
                    'courses.description',
                    'enrollments.status as enrollment_status'
                )
                .where({ 'courses.is_deleted': 0 });
            
            return res.status(200).json({
                success: true,
                message: 'Fetched courses successfully',
                data: courses
            });

        } catch (error: any) {
            console.error('Error fetching student courses:', error);
            return res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    /**
     * Get fees for the current logged-in student
     */
    static async getMyFees(req: Request, res: Response): Promise<any> {
        try {
            const decode = (req as any).decode || req.body.decode;
            if (!decode || !decode.id) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized" 
                });
            }

            const studentContext = await RBAC_Helper.getStudentContext(decode.id);
            if (!studentContext || !studentContext.studentId) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'No student context found',
                    data: [] 
                });
            }

            const fees = await db('fees')
                .join('courses', 'fees.course_id', 'courses.id')
                .leftJoin('students', 'fees.student_id', 'students.id')
                .leftJoin('classes', 'fees.class_id', 'classes.id')
                .select(
                    'fees.*',
                    'courses.course_name as course_name',
                    'courses.course_code',
                    'students.full_name as student_name',
                    'classes.class_name as class_name'
                )
                .where({
                    'fees.student_id': studentContext.studentId,
                    'fees.is_deleted': 0
                });

            // Debug first record to see the fields if they are missing
            if (fees.length > 0) {
                console.log(`[DEBUG] studentId: ${studentContext.studentId}, fees count: ${fees.length}`);
                console.log(`[DEBUG] First fee metadata:`, {
                    id: fees[0].id,
                    student_name: fees[0].student_name,
                    class_name: fees[0].class_name
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Fetched student fees successfully',
                data: fees
            });

        } catch (error: any) {
            console.error('Error fetching student fees:', error);
            return res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    /**
     * Get QR for a specific fee
     */
    static async getFeeQR(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { decode } = req.body;

            
            if (!decode || !decode.id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const fee = await db('fees')
                .join('courses', 'fees.course_id', 'courses.id')
                .leftJoin('students', 'fees.student_id', 'students.id')
                .leftJoin('classes', 'fees.class_id', 'classes.id')
                .select(
                    'fees.*', 
                    'courses.course_code', 
                    'courses.course_name',
                    'students.full_name as student_name',
                    'classes.class_name as class_name'
                )
                .where({ 'fees.id': id, 'fees.is_deleted': 0 })
                .first();

            if (fee) {
                console.log(`[DEBUG] getFeeQR for ID ${id}:`, {
                    student_name: fee.student_name,
                    class_name: fee.class_name
                });
            }



            if (!fee) {
                return res.status(404).json({ success: false, message: "Fee record not found" });
            }

            // Security: Ensure fee belongs to student
            const studentContext = await RBAC_Helper.getStudentContext(decode.id);
            if (!studentContext || fee.student_id !== studentContext.studentId) {
                return res.status(403).json({ success: false, message: "Forbidden: You do not own this fee record" });
            }

            // VietQR Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>
            // Placeholder Bank Info: MB Bank, Account 123456789
            const amount = Math.round(fee.amount);
            const content = `HP_${fee.course_code}_${studentContext.studentId}`;
            const qrUrl = `https://img.vietqr.io/image/MB-123456789-compact.png?amount=${amount}&addInfo=${content}`;

            return res.status(200).json({
                success: true,
                message: "QR generated successfully",
                data: {
                    qrUrl,
                    amount,
                    content
                }
            });

        } catch (error: any) {
            console.error('Error generating QR:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Student notifies that they have paid
     */
    static async submitPayment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { decode } = req.body;


            if (!decode || !decode.id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const fee = await db('fees').where({ id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Fee record not found" });
            }

            // Security: Ensure fee belongs to student
            const studentContext = await RBAC_Helper.getStudentContext(decode.id);
            if (!studentContext || fee.student_id !== studentContext.studentId) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const currentStatus = MainService.normalizeStatus(fee.status);
            if (currentStatus === 'PAID') {
                return res.status(400).json({ success: false, message: "Học phí này đã được thanh toán" });
            }
            
            if (fee.is_payment_submitted) {
                return res.status(400).json({ success: false, message: "Yêu cầu thanh toán đang chờ xử lý" });
            }

            await db('fees')
                .where({ id })
                .update({
                    is_payment_submitted: true,
                    updated_at: db.fn.now()
                });

            return res.status(200).json({
                success: true,
                message: "Đã gửi thông báo thanh toán thành công. Vui lòng chờ admin xác nhận."
            });

        } catch (error: any) {
            console.error('Error submitting payment:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Enroll in a course (Placeholder/Basic)
     */
    static async enrollCourse(req: Request, res: Response): Promise<any> {
        try {
            const { course_id, decode } = req.body;


            if (!course_id) {
                return res.status(400).json({ success: false, message: "Course ID is required" });
            }

            const studentContext = await RBAC_Helper.getStudentContext(decode.id);
            if (!studentContext || !studentContext.studentId) {
                return res.status(403).json({ success: false, message: "Only students can enroll" });
            }

            // Check if already enrolled
            const existing = await db('enrollments')
                .where({ student_id: studentContext.studentId, course_id })
                .first();


            if (existing) {
                return res.status(400).json({ success: false, message: "You are already enrolled/pending for this course" });
            }

            await db('enrollments').insert({
                student_id: studentContext.studentId,
                course_id,
                status: 'pending',
                created_at: db.fn.now()
            });

            return res.status(201).json({
                success: true,
                message: "Enrolled successfully. Please proceed to payment."
            });

        } catch (error: any) {
            console.error('Error enrolling course:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get current student information from token
     */
    static async getCurrentStudent(req: Request, res: Response) {
        try {
            // Decoded user info should be in req.user or req.decode depending on middleware
            const { decode } = req.body;
            const user = decode;


            return res.json({
                success: true,
                message: "Get current student successfully",
                data: user
            });

        } catch (error: any) {
            console.error('Error in getCurrentStudent:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Server error"
            });
        }
    }

    /**
     * Get Invoice PDF for a specific fee
     */
    static async getFeeInvoice(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { decode } = req.body;
            
            if (!decode || !decode.id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }


            const feeId = Number(id);
            const fee = await db('fees').where({ id: feeId, is_deleted: 0 }).first();
            
            if (!fee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi học phí" });
            }

            // Security: Ensure fee belongs to student
            const studentContext = await RBAC_Helper.getStudentContext(decode.id);
            if (!studentContext || fee.student_id !== studentContext.studentId) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập hóa đơn này" });
            }

            if (fee.status !== 'PAID') {
                return res.status(400).json({ success: false, message: "Hóa đơn chỉ có sẵn cho các khoản đã thanh toán" });
            }

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Hoa_Don_Hoc_Phi_${id}.pdf`);

            // Generate and stream PDF
            await InvoiceService.generateInvoicePDF(feeId, res);

        } catch (error: any) {
            console.error('Error generating invoice PDF:', error);
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: error.message });
            }
        }
    }
}

