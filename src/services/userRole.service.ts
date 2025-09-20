import { UserRole } from "@interfaces/permissions.interface";
import db from "src/db/config.db";

class UserRoleService{
    async createDefaultRole(user_id: number): Promise<boolean>{
        try {
            let data = {
                user_id: user_id
            }
            let result = await db('user_roles').insert(data);
            if(result) return true;
            return false;


        } catch (error : any) {
            console.log(error);
            throw new Error(error);
        }
    }

    async getPmsFromUserId(user_id: number): Promise<UserRole[]>{
        try {
            let userRoles = await db('user_roles').where('user_id', user_id).where('is_deleted', 0);
            return userRoles || [];
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default new UserRoleService();