import { BaseEntity } from "./base.interface";
import { Role } from "./role.interface";

export interface User extends BaseEntity{
    id: number;
    name: string;
    avatar?: string;
    avatarUrl?: string; // Đường dẫn đầy đủ đến avatar
    email: string;
    password: string;
    refresh_token?: string;
    verifyEmail: number;
}