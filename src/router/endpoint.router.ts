import { Router, Request, Response } from 'express';
const router = Router();

import { MainController } from '../controllers/main.controller';
import { AdminFeeController } from '../controllers/admin-fee.controller';
import middlewaresMiddleware from '../middlewares/middlewares.middleware';

router.get('/profile', middlewaresMiddleware.checkLogin, MainController.getProfile)

// Admin Fee Approval Flow
router.patch('/admin/fees/:id/approve', middlewaresMiddleware.checkLogin, AdminFeeController.approvePayment);
router.patch('/admin/fees/:id/reject', middlewaresMiddleware.checkLogin, AdminFeeController.rejectPayment);

// Fee Statistics
router.get('/admin-fees/class-statistics', middlewaresMiddleware.checkLogin, AdminFeeController.getClassFeeStatistics);

import { PaymentWebhookController } from '../controllers/payment-webhook.controller';
router.post('/payments/fake-callback', PaymentWebhookController.fakeCallback);

// Add a record to any table based on 'table'
router.post('/payments/confirm', middlewaresMiddleware.checkLogin, MainController.confirmPayment);
router.post('/:router',middlewaresMiddleware.GuardMiddleware, MainController.create);

// Get all records from any table based on 'table'
router.get('/:router',middlewaresMiddleware.GuardMiddleware, MainController.get );

// Get a single record by ID from any table
router.get('/:router/:id',middlewaresMiddleware.GuardMiddleware, MainController.getById );

// Update a record in any table based on 'table' and 'id'
router.put('/:router/:id',middlewaresMiddleware.GuardMiddleware, MainController.put );

// Delete a record in any table based on 'table' and 'id'
router.delete('/:router/destroy/:id',middlewaresMiddleware.GuardMiddleware, MainController.delete);
router.delete('/:router/:id',middlewaresMiddleware.GuardMiddleware, MainController.setIsDelete);

export default router;
