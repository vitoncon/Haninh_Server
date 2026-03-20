import { Request, Response } from 'express';
import db from '../db/config.db';

export class PaymentController {
    /**
     * POST /api/payments
     * Student creates payment (sets status to PENDING)
     */
    static async createPayment(req: Request, res: Response): Promise<any> {
        try {
            const { fee_id, payment_method } = req.body;
            const decode = (req as any).decode || (req as any).user;

            if (!decode || !decode.id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            if (!fee_id) {
                return res.status(400).json({ success: false, message: "fee_id is required" });
            }

            const fee = await db('fees').where({ id: fee_id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Fee record not found" });
            }

            // Optional: verify student owns fee

            if (fee.status === 'PAID') {
                return res.status(400).json({ success: false, message: "Fee is already PAID." });
            }

            if (fee.status === 'PENDING') {
                return res.status(400).json({ success: false, message: "Payment is already PENDING review." });
            }

            const method = payment_method || 'QR';

            await db('fees')
                .where({ id: fee_id })
                .update({
                    status: 'PENDING',
                    payment_method: method,
                    updated_at: db.fn.now()
                });

            return res.status(200).json({
                success: true,
                message: "Đã gửi yêu cầu thanh toán."
            });

        } catch (error: any) {
            console.error('Error in createPayment:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/payments
     * Admin views all payments/fees
     */
    static async getPayments(req: Request, res: Response): Promise<any> {
        try {
            const decode = (req as any).decode || (req as any).user;
            
            // Check admin role? For simplicity, we assume middlewares or just check
            // if (decode.role_id !== 1) return res.status(403).json({ success: false, message: "Forbidden" });

            const fees = await db('fees')
                .join('students', 'fees.student_id', 'students.id')
                .select('fees.*', 'students.student_name', 'students.student_code')
                .where('fees.is_deleted', 0);

            return res.status(200).json({
                success: true,
                message: "Fetched payments successfully",
                data: fees
            });
        } catch (error: any) {
            console.error('Error fetching payments:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PUT /api/payments/:id/approve
     * Admin approves payment -> PAID
     */
    static async approvePayment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const decode = (req as any).decode || (req as any).user;

            const fee = await db('fees').where({ id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán." });
            }

            if (fee.status === 'PAID') {
                return res.status(400).json({ success: false, message: "Không thể phê duyệt, thanh toán đã PAID." });
            }

            await db('fees')
                .where({ id })
                .update({
                    status: 'PAID',
                    paid_date: db.fn.now(),
                    updated_at: db.fn.now(),
                    updated_by: decode.id
                });

            return res.status(200).json({
                success: true,
                message: "Đã xác nhận thanh toán thành công."
            });
        } catch (error: any) {
            console.error('Error approving payment:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PUT /api/payments/:id/reject
     * Admin rejects payment -> UNPAID
     */
    static async rejectPayment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const decode = (req as any).decode || (req as any).user;

            const fee = await db('fees').where({ id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán." });
            }

            if (fee.status === 'PAID') {
                return res.status(400).json({ success: false, message: "Không thể từ chối, thanh toán đã PAID." });
            }

            await db('fees')
                .where({ id })
                .update({
                    status: 'UNPAID',
                    updated_at: db.fn.now(),
                    updated_by: decode.id
                });

            return res.status(200).json({
                success: true,
                message: "Đã từ chối thanh toán."
            });
        } catch (error: any) {
             console.error('Error rejecting payment:', error);
             return res.status(500).json({ success: false, message: error.message });
        }
    }
}
