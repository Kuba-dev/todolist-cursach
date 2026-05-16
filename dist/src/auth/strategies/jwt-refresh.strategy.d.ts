import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "src/utils/types/jwt-payload";
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate({ userId }: JwtPayload): Promise<{
        id: number;
        email: string;
        hashedPassword: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
