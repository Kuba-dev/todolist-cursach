import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { Response } from "express";
import { Profile } from "passport-google-oauth20";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<string>;
    login(_dto: RegisterDto, userId: number, res: Response): Promise<string>;
    refresh(userId: number, res: Response): Promise<string>;
    logout(res: Response): Promise<void>;
    google(): void;
    googleCallback(req: Request & {
        user: Profile;
    }, res: Response): Promise<string>;
}
