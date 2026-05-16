import { PrismaService } from "prisma/prisma.service";
import { GetUserDto } from "./dtos/get-user.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
export declare class UsersService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    createOne(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        hashedPassword: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getOne({ id, email }: GetUserDto): Promise<{
        id: number;
        email: string;
        hashedPassword: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
