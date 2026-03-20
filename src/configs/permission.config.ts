import { Permission } from "@interfaces/permissions.interface";

export const  Permissions: Permission[] = [
    {
        id: 1,
        role_id: 2,
        table_name: 'tests',
        pms: [1, 1,1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'users',
        pms: [1, 1,1, 1, 1] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'roles',
        pms: [1, 1, 1, 1, 0]
    },
     {
        id: 1,
        role_id: 1,
        table_name: 'courses',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'courses',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem thông tin khóa học
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'classes',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'classes',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem thông tin lớp học
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exams',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'exams',
        // Teacher can view/create/update exams for their classes (scoped by MainController),
        // but cannot delete them.
        pms: [1, 1, 1, 0, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exam_skills',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'exam_skills',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 3,
        role_id: 3,
        table_name: 'exam_skills',
        pms: [1, 0, 0, 0, 0] // Student can only read exam skills (no write/delete)
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'exam_results',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'exam_results',
        // Teacher can view/create/update exam results (scores) for their students,
        // but cannot delete them. Ownership is enforced in MainController.
        pms: [1, 1, 1, 0, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_schedules',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'class_schedules',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem lịch học của lớp
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'schedules',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'schedules',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem lịch dạy của mình
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'teachers',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'teachers',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem danh sách teachers (để tìm teacher của mình)
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_teachers',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'class_teachers',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem phân công giảng dạy (class_teachers)
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'students',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'students',
        pms: [1, 0, 0, 0, 0] // Teacher can read their students
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'class_students',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'class_students',
        pms: [1, 0, 0, 0, 0] // Teacher can read class students list
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'study_results',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'study_results',
        pms: [1, 1, 1, 0, 0] // Teacher can create/update study results, but not delete
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'attendance',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'attendance',
        pms: [1, 1, 1, 0, 0] // Teacher can access, create, update, but not delete attendance
    },
    // ===== Student (role_id = 3) read-only, scoped permissions =====
    {
        id: 1,
        role_id: 3,
        table_name: 'students',
        pms: [1, 0, 0, 0, 0] // Học viên chỉ được xem hồ sơ của chính mình (scoped ở backend)
    },
    {
        id: 2,
        role_id: 3,
        table_name: 'class_students',
        pms: [1, 0, 0, 0, 0] // Xem danh sách lớp mình đã/đang học (scoped ở backend)
    },
    {
        id: 3,
        role_id: 3,
        table_name: 'classes',
        pms: [1, 0, 0, 0, 0] // Xem thông tin các lớp mình học
    },
    {
        id: 4,
        role_id: 3,
        table_name: 'schedules',
        pms: [1, 0, 0, 0, 0] // Xem lịch học của các lớp mình học
    },
    {
        id: 5,
        role_id: 3,
        table_name: 'class_schedules',
        pms: [1, 0, 0, 0, 0] // Xem lịch học chi tiết của các lớp mình học
    },
    {
        id: 6,
        role_id: 3,
        table_name: 'attendance',
        pms: [1, 0, 0, 0, 0] // Xem lịch sử điểm danh của chính mình (scoped ở backend)
    },
    {
        id: 7,
        role_id: 3,
        table_name: 'study_results',
        pms: [1, 0, 0, 0, 0] // Xem kết quả học tập của chính mình (scoped ở backend)
    },
    {
        id: 8,
        role_id: 3,
        table_name: 'exams',
        pms: [1, 0, 0, 0, 0] // Xem thông tin bài kiểm tra của các lớp mình học
    },
    {
        id: 9,
        role_id: 3,
        table_name: 'exam_results',
        pms: [1, 0, 0, 0, 0] // Xem kết quả bài kiểm tra của chính mình
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'teaching_assignments',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 2,
        role_id: 2,
        table_name: 'teaching_assignments',
        pms: [1, 0, 0, 0, 0] // Giáo viên chỉ có thể xem phân công giảng dạy của mình
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'fees',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'certificates',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'student_certificates',
        pms: [1, 1, 1, 1, 0]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'user_roles',
        pms: [1, 1, 1, 1, 0] // [canAccess, canAdd, canEdit, canDelete, onlyGetPersonal]
    },
    {
        id: 1,
        role_id: 1,
        table_name: 'leads',
        pms: [1, 1, 1, 1, 0] // Admin needs full access to leads
    },
]

