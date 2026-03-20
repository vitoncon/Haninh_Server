import { Request, Response } from 'express';
import db from '../db/config.db';
import { MainService } from '../services/main.service';

export class AdminFeeController {
    /**
     * Approve a student's payment declaration
     */
    static async approvePayment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const decode = (req as any).decode || (req as any).user;

            if (decode.role_id !== 1) { // Admin check
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const fee = await db('fees').where({ id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin học phí" });
            }

            await db('fees')
                .where({ id })
                .update({
                    status: 'PAID',
                    is_payment_submitted: false,
                    paid_date: db.fn.now(),
                    updated_at: db.fn.now(),
                    updated_by: decode.id
                });

            return res.status(200).json({
                success: true,
                message: "Đã phê duyệt thanh toán thành công."
            });

        } catch (error: any) {
            console.error('Error approving payment:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Reject a student's payment declaration
     */
    static async rejectPayment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const decode = (req as any).decode || (req as any).user;

            if (decode.role_id !== 1) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            const fee = await db('fees').where({ id, is_deleted: 0 }).first();
            if (!fee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin học phí" });
            }

            await db('fees')
                .where({ id })
                .update({
                    is_payment_submitted: false,
                    updated_at: db.fn.now(),
                    updated_by: decode.id
                });

            return res.status(200).json({
                success: true,
                message: "Yêu cầu thanh toán đã bị từ chối."
            });

        } catch (error: any) {
            console.error('Error rejecting payment:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get aggregated fee statistics grouped by class to prevent frontend N+1 queries
     */
    static async getClassFeeStatistics(req: Request, res: Response): Promise<any> {
        try {
            // Get all classes with course tuition fee and join directly with fees table
            const rawStats = await db('classes as c')
                .leftJoin('courses as co', 'c.course_id', 'co.id')
                .leftJoin('fees as f', function() {
                    this.on('f.class_id', '=', 'c.id')
                        .andOn('f.is_deleted', '=', db.raw('0'));
                })
                .where('c.is_deleted', 0)
                .select(
                    'c.id as class_id',
                    'c.class_name',
                    'c.class_code',
                    'co.course_name',
                    'co.tuition_fee',
                    // Count enrolled students from class_students (source of truth), not from fees table
                    db.raw('(SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as totalStudents'),
                    db.raw('COALESCE(SUM(f.amount), 0) as totalRevenue'),
                    db.raw('COALESCE(SUM(CASE WHEN f.status = \'PAID\' THEN f.amount ELSE 0 END), 0) as totalPaid')
                )
                .groupBy('c.id', 'co.id', 'c.class_name', 'c.class_code', 'co.course_name', 'co.tuition_fee');

            // Apply financial logic
            const formattedStats = rawStats.map((row: any) => {
                const totalStudents = Number(row.totalStudents) || 0;
                const tuitionFee = typeof row.tuition_fee === 'string' ? parseFloat(row.tuition_fee) : (Number(row.tuition_fee) || 0);
                const totalPaid = typeof row.totalPaid === 'string' ? parseFloat(row.totalPaid) : (Number(row.totalPaid) || 0);
                const totalRevenue = typeof row.totalRevenue === 'string' ? parseFloat(row.totalRevenue) : (Number(row.totalRevenue) || 0);
                
                const totalDebt = Math.max(0, totalRevenue - totalPaid);

                let paymentStatus = 'UNKNOWN';
                if (totalStudents === 0) {
                    paymentStatus = 'EMPTY'; // Chưa có học viên
                } else if (totalDebt === 0) {
                    paymentStatus = 'PAID';  // Đã thu đủ
                } else {
                    paymentStatus = 'DEBT';  // Còn nợ
                }

                return {
                    id: row.class_id,
                    class_name: row.class_name,
                    class_code: row.class_code,
                    course_name: row.course_name,
                    tuition_fee: tuitionFee,
                    totalStudents,
                    totalRevenue,
                    totalPaid,
                    totalDebt,
                    paymentStatus
                };
            });

            return res.status(200).json({
                code: 'success',
                message: 'Request success!',
                data: formattedStats
            });

        } catch (error: any) {
            console.error('Error fetching class fee statistics:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}
