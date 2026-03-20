import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import db from '../db/config.db';
import { SocketService } from '../services/socket.service';

const publicCoursesRoutes = Router();

const getPublicCourses: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  db('courses')
    .select(
      'id',
      'course_name',
      'description',
      'language',
      'level',
      'duration_weeks',
      'tuition_fee'
    )
    .where({ status: 'Đang hoạt động', is_deleted: 0 })
    .limit(6)
    .then((courses) => {
      return res.json(courses);
    })
    .catch((error) => {
      console.error('Error fetching public courses:', error);
      return res.status(500).json({ error: 'Không thể tải khóa học.' });
    });
};

const registerLead: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const { fullname, phone, email, course_id, message } = req.body;

  if (!fullname || !phone) {
    res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên và số điện thoại.' });
    return;
  }

  const leadData = {
    fullname,
    phone,
    email,
    course_id: course_id ? parseInt(course_id) : null,
    message,
    status: 'new',
    created_at: new Date(),
    updated_at: new Date()
  };

  db('leads')
    .insert(leadData)
    .then((ids) => {
      const newLead = { ...leadData, id: ids[0] };
      // Notify admin
      SocketService.emitLeadCreated(newLead);
      res.status(201).json({ message: 'Đăng ký nhận tư vấn thành công!', leadId: ids[0] });
    })
    .catch((error) => {
      console.error('Error registering lead:', error);
      res.status(500).json({ error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' });
    });
};

publicCoursesRoutes.get('/courses', getPublicCourses);
publicCoursesRoutes.post('/register', registerLead);

export default publicCoursesRoutes;
