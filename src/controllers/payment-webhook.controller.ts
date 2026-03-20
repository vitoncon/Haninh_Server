import { Request, Response } from 'express';
import db from '../db/config.db';
import { SocketService } from '../services/socket.service';

export class PaymentWebhookController {
    /**
     * Fake Webhook Callback for QR Payment
     * Expects: { content: string, amount: number }
     */
    static async fakeCallback(req: Request, res: Response): Promise<any> {
        try {
            const { content, amount } = req.body;

            if (!content || !amount) {
                return res.status(400).json({ success: false, message: 'Dữ liệu không đầy đủ (yêu cầu content và amount)' });
            }

            // Extract fee ID from content (Expected format: "FEE_123")
            const match = content.match(/FEE_(\d+)/i);
            if (!match) {
                return res.status(400).json({ success: false, message: 'Nội dung chuyển khoản không hợp lệ (không chứa mã hóa đơn)' });
            }

            const feeId = parseInt(match[1]);

            // Database Transaction ensures atomicity
            await db.transaction(async (trx) => {
                // Check if fee exists and match amount
                const fee = await trx('fees').where({ id: feeId, is_deleted: 0 }).first();

                if (!fee) {
                    throw new Error('Không tìm thấy thông tin học phí');
                }

                // If already paid, do nothing to prevent duplicate inserts
                if (fee.status === 'PAID') {
                    return res.status(200).json({ success: true, message: 'Hóa đơn đã được thanh toán trước đó' });
                }

                // Strictly speaking, webhook amount should match exactly. 
                // We'll allow slight variance or exact match based on production needs.
                if (Number(fee.amount) !== Number(amount)) {
                    throw new Error(`Số tiền thanh toán không khớp (Yêu cầu: ${fee.amount}, Nhận được: ${amount})`);
                }

                // 1. Update fee
                await trx('fees')
                    .where({ id: feeId })
                    .update({
                        status: 'PAID',
                        paid_date: trx.raw('CURRENT_DATE'),
                        updated_at: trx.fn.now()
                    });

                // 2. Insert into transactions table
                await trx('transactions').insert({
                    fee_id: feeId,
                    content: content,
                    amount: amount,
                    status: 'SUCCESS',
                    created_at: trx.fn.now()
                });

                // 3. Emit websocket event for Realtime UI update
                SocketService.emitPaymentUpdated(feeId, 'PAID');
            });

            return res.status(200).json({
                success: true,
                message: 'Thanh toán thành công'
            });

        } catch (error: any) {
            console.error('Webhook Error:', error);
            // In a real webhook, return 400 or appropriate status so provider knows to retry or fail
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
