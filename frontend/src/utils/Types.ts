import { type JwtPayload } from 'jwt-decode';

export interface TokenData {
    accessToken: string;
}
export interface TokenPayload extends JwtPayload {
    firstName: string;
    lastName: string;
    userId?: number;
}