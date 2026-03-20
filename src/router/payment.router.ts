import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import middlewaresMiddleware from '../middlewares/middlewares.middleware';

const router = Router();

// Student creates payment (sets PENDING)
router.post('/', middlewaresMiddleware.checkLogin, PaymentController.createPayment);

// Admin gets all payments
router.get('/', middlewaresMiddleware.checkLogin, PaymentController.getPayments);

// Admin approves
router.put('/:id/approve', middlewaresMiddleware.checkLogin, PaymentController.approvePayment);

// Admin rejects
router.put('/:id/reject', middlewaresMiddleware.checkLogin, PaymentController.rejectPayment);

export default router;
