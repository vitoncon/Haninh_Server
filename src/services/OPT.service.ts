import { OTP } from "@interfaces/OTP";
import db from "src/db/config.db";


export class OTPService{
    static async create(data: Partial<OTP>): Promise<any> {
        try {
            return await db('otps').insert(data);
        } catch (error: any) {
            throw new Error(error)
        }
    }

    static async getByEmailAndNotExpired (data: Partial<OTP>): Promise<OTP> {
        try {
            let opt = await db('otps').where('email', data.email).where('otp',data.otp).where('is_deleted',0).first();
            return opt;
        } catch (error: any) {
            console.log(error);
            throw new Error(error);
            
        }

    }

    static async deleteOTP(data: Partial<OTP>): Promise<void> {
        try {
            // Tìm OTP theo email và otp và đảm bảo is_deleted = 0
            const otp = await db('otps')
                .where('email', data.email)
                .where('otp', data.otp)
                .where('is_deleted', 0)
                .first();
    
            // Nếu không tìm thấy OTP, ném lỗi
            if (!otp) {
                throw new Error('OTP không tồn tại hoặc đã bị xóa');
            }
    
            // Xóa bản ghi OTP khỏi bảng
            await db('otps')
                .where('id', otp.id)
                .del();
    
            console.log('OTP đã được xóa thành công');
        } catch (error: any) {
            console.log(error);
            throw new Error(error); // Ném lỗi nếu có
        }
    }
    
}