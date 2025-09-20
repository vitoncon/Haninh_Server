export interface BaseEntity{
    created_at: Date; 
    updated_at: Date; 
    created_by: number; // 0 or 1 
    updated_by: number; // 0 or 1 
    is_deleted: number; // 0 or 1 
    deleted_by: number; // 0 or 1 
}