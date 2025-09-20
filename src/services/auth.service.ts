import { User } from '@interfaces/user.interface';
import jwt from 'jsonwebtoken';
// híc


export class AuthService {
    // Implement JWT authentication logic here
    static async generateAccessToken(user: Partial<User>, userRoleIds: number[]): Promise<string | null> {
        try {
            return jwt.sign(
                { id: user.id, roles: userRoleIds },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: 60 * 60 }
            );
        } catch (error : any) {
            console.log(error.message);
            return null;
        }
    }

    static async generateRefreshToken(user: Partial<User>, userRoleIds: number[]): Promise<string | null> {
        try {
            return jwt.sign(
                { id: user.id, roles: userRoleIds }, // Sửa `user.Role` thành `user.role` cho nhất quán
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: "1d" }
            );
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    static async refreshTokenCreateNewAccessToken(refreshToken: string): Promise<string | null> {
        // Verify the refresh token
        try {
            const decoded = await this.verifyRefreshToken(refreshToken);

            if (decoded === "jwt expired") return decoded;

            // Generate a new access token using the decoded user information from the refresh token
            const user: Partial<User> = {
                id: decoded.id
            };
            const userRoleIds: number[] = decoded.roleIds;
            const accessToken = await this.generateAccessToken(user, userRoleIds) ;
            // Return the new access token
            return accessToken;
        } catch (err) {
            // Handle the error, such as by returning an error response or redirecting to a login page
            console.error(err);
            return null;
        }
    }

    static async verifyAccessToken(token: string): Promise<any | null> {
        try {
            // Verify the token using the secret key
            const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
            return decoded; // Return the decoded token data
        } catch (err : any) {
            console.error(err);
            if (err.message === "jwt expired") return err.message;
            return null; // Return null if token is not valid or has expired
        }
    }

    static async verifyRefreshToken(token: string): Promise<any | null> {
        try {
            // Verify the token using the secret key
            const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
            return decoded; // Return the decoded token data
        } catch (err: any) {
            console.error(err);
            if (err.message === "jwt expired") return err.message;
            return null; // Return null if token is not valid or has expired
        }
    }
}
