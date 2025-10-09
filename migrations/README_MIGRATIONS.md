# Database Migrations

## Thứ tự chạy migrations

Để tạo database hoàn chỉnh cho hệ thống quản lý học viện, hãy chạy các migrations theo thứ tự sau:

### 1. Chạy migrations cơ bản (đã có sẵn):
```bash
npx knex migrate:latest --env development
```

### 2. Nếu cần rollback và chạy lại từ đầu:
```bash
# Rollback tất cả migrations
npx knex migrate:rollback --all --env development

# Chạy lại từ đầu
npx knex migrate:latest --env development
```

## Cấu trúc bảng sau khi chạy migrations

### Bảng chính:
1. **roles** - Vai trò người dùng
2. **users** - Người dùng hệ thống
3. **user_roles** - Liên kết user-role
4. **otps** - Mã OTP xác thực

### Bảng nghiệp vụ:
5. **courses** - Khóa học
6. **classes** - Lớp học
7. **teachers** - Giáo viên
8. **students** - Học viên
9. **class_students** - Liên kết lớp-học viên
10. **class_schedules** - Lịch học
11. **study_results** - Kết quả học tập
12. **teaching_assignments** - Phân công giảng dạy
13. **fees** - Quản lý học phí
14. **certificates** - Quản lý chứng chỉ
15. **student_certificates** - Liên kết học viên-chứng chỉ

## Lưu ý quan trọng

- Migration `class_schedules` phụ thuộc vào bảng `classes` và `teachers`
- Migration `classes` phụ thuộc vào bảng `courses`
- Migration `class_students` phụ thuộc vào bảng `classes` và `students`
- Migration `study_results` phụ thuộc vào bảng `students` và `classes`
- Migration `teaching_assignments` phụ thuộc vào bảng `teachers` và `classes`
- Migration `fees` phụ thuộc vào bảng `students`, `classes` và `courses`
- Migration `student_certificates` phụ thuộc vào bảng `students`, `certificates` và `classes`

## Kiểm tra migrations

```bash
# Xem trạng thái migrations
npx knex migrate:status --env development

# Xem danh sách migrations đã chạy
npx knex migrate:list --env development
```

## Troubleshooting

Nếu gặp lỗi foreign key constraint:
1. Kiểm tra thứ tự migrations
2. Đảm bảo bảng cha đã được tạo trước bảng con
3. Rollback và chạy lại nếu cần
