import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import middlewaresMiddleware from '../middlewares/middlewares.middleware';

const router = Router();

// Courses for students
router.get('/courses', middlewaresMiddleware.checkLogin, StudentController.getCourses);

// Fees for the logged-in student
router.get('/fees', middlewaresMiddleware.checkLogin, StudentController.getMyFees);

// New payment flow routes
router.get('/fees/:id/qr', middlewaresMiddleware.checkLogin, StudentController.getFeeQR);
router.get('/fees/:id/invoice', middlewaresMiddleware.checkLogin, StudentController.getFeeInvoice);
router.patch('/fees/:id/submit', middlewaresMiddleware.checkLogin, StudentController.submitPayment);


// Enrollment
router.post('/enroll-course', middlewaresMiddleware.checkLogin, StudentController.enrollCourse);

export default router;
