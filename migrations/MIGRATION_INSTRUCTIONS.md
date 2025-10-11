# Hướng dẫn chạy Migration cho Teacher Module

## Các trường mới được thêm vào bảng teachers

Migration `20250115000000_add_new_fields_to_teachers_table.js` sẽ thêm các trường sau:

1. **avatar_url** (varchar(500)) - Đường dẫn hình đại diện
2. **salary** (decimal(15,2)) - Lương cơ bản
3. **hire_date** (date) - Ngày tuyển dụng
4. **contract_type** (enum) - Loại hợp đồng: 'Hợp đồng', 'Biên chế', 'Thời vụ'
5. **teaching_hours_per_week** (int) - Số giờ dạy mỗi tuần
6. **languages** (text) - Ngôn ngữ có thể dạy
7. **certifications** (text) - Chứng chỉ chuyên môn

## Cách chạy migration

### 1. Chạy migration
```bash
cd Haninh_Server
npm run migrate:latest
```

### 2. Kiểm tra kết quả
```bash
# Xem trạng thái migration
npm run migrate:status

# Xem danh sách các migration đã chạy
npm run migrate:list
```

### 3. Rollback nếu cần
```bash
# Rollback migration cuối cùng
npm run migrate:rollback

# Rollback tất cả migration
npm run migrate:reset
```

## Sau khi chạy migration thành công

1. **Cập nhật frontend**: Thay đổi `*ngIf="false"` thành `*ngIf="true"` trong các file:
   - `teacher.html` - Bỏ comment phần "Advanced Information Section"
   - `teacher-detail.html` - Bỏ comment các trường mới

2. **Kiểm tra API**: Đảm bảo backend đã hỗ trợ các trường mới

3. **Test chức năng**: Kiểm tra thêm/sửa/xóa giáo viên với các trường mới

## Lưu ý quan trọng

- **Backup database** trước khi chạy migration
- Các trường mới đều là **nullable** nên không ảnh hưởng đến dữ liệu cũ
- Frontend hiện tại đã được thiết kế để hoạt động với cả cấu trúc cũ và mới
- Sau khi migration, có thể bật các tính năng nâng cao bằng cách thay đổi `*ngIf="false"` thành `*ngIf="true"`

## Cấu trúc database sau migration

```sql
CREATE TABLE teachers (
  id int(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_code varchar(20) UNIQUE,
  teacher_name varchar(100) NOT NULL,
  gender enum('Nam','Nữ','Khác') DEFAULT 'Nam',
  dob date,
  email varchar(100),
  phone varchar(20),
  address varchar(255),
  department varchar(100),
  specialization varchar(255),
  experience_years int(11) DEFAULT 0,
  degree enum('Cử nhân','Thạc sĩ','Tiến sĩ','Khác') DEFAULT 'Cử nhân',
  status enum('Đang dạy','Tạm nghỉ','Đã nghỉ') DEFAULT 'Đang dạy',
  note text,
  
  -- Các trường mới
  avatar_url varchar(500),
  salary decimal(15,2),
  hire_date date,
  contract_type enum('Hợp đồng','Biên chế','Thời vụ'),
  teaching_hours_per_week int,
  languages text,
  certifications text,
  
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_contract_type (contract_type),
  INDEX idx_hire_date (hire_date),
  INDEX idx_salary (salary)
);
```
