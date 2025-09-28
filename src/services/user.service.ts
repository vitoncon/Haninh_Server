import { User } from "@interfaces/user.interface";
import db from "src/db/config.db";
import userRoleService from "./userRole.service";

export class UserService {
  static async findByEmail(email: string): Promise<User> {
    try {
      let user = await db("users")
        .where("email", email)
        .where("is_deleted", 0)
        .first();
      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async create(user: Partial<User>): Promise<number> {
    try {
      const [userId] = await db("users").insert(user);
      await userRoleService.createDefaultRole(userId);
      return userId;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async update(user_id: number, user: Partial<User>): Promise<number> {
    try {
      // Cập nhật thông tin người dùng theo ID
      const result = await db("users").update(user).where("id", user_id); // Sử dụng 'id' thay vì 'is'

      // Trả về số lượng bản ghi đã được cập nhật
      return result; // result là số lượng bản ghi đã cập nhật (0 nếu không có gì thay đổi)
    } catch (error: any) {
      throw new Error(error); // Ném lỗi nếu có
    }
  }

  static async getProfile(id: number): Promise<User> {
    try {
      // Lấy thông tin user với role
      const result = await db("users")
        .select(
          "users.id", 
          "users.name", 
          "users.avatar", 
          "users.email",
          "roles.name as role_name",
          "roles.id as role_id"
        )
        .leftJoin("user_roles", "users.id", "user_roles.user_id")
        .leftJoin("roles", "user_roles.role_id", "roles.id")
        .where("users.id", id)
        .where("users.is_deleted", 0)
        .first();

      // Xử lý avatar URL - nếu có avatar thì tạo full URL, nếu không thì dùng default
      if (result) {
        if (result.avatar) {
          // Nếu avatar là đường dẫn đầy đủ thì giữ nguyên, nếu không thì thêm base URL
          if (result.avatar.startsWith('http')) {
            result.avatarUrl = result.avatar;
          } else {
            // Nếu avatar trong DB đã bắt đầu bằng /img_avatar thì giữ nguyên
            result.avatarUrl = result.avatar.startsWith('/img_avatar')
              ? result.avatar
              : `/img_avatar/${result.avatar}`;
          }          
        } else {
          // Sử dụng ảnh default nếu không có avatar
          result.avatarUrl = '/img_avatar/avatar_default.jpg';
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
