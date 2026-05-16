import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dtos/register.dto";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register({ email, password }: RegisterDto, res: Response): Promise<string>;
    googleAuth(email: string, res: Response): Promise<string>;
    generateTokens(userId: number, res: Response): Promise<string>;
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        hashedPassword: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
