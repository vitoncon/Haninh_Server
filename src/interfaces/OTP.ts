import { BaseEntity } from "./base.interface";

export interface OTP extends BaseEntity{
    email: string;
    otp: string;
    exp: Date;
    
}