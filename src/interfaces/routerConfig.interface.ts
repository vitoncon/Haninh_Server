// Định nghĩa cấu hình cho từng bảng
export interface TableConfig {
    table: string;
    isPublic: boolean;
}

// Định nghĩa cấu hình toàn bộ Router
export interface RouterConfig {
    [key: string]: TableConfig; // Cho phép nhiều cấu hình bảng với key là tên bảng
}
