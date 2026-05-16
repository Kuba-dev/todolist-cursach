import { BadRequestException, ConflictException, Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { GetUserDto } from "./dtos/get-user.dto"
import { CreateUserDto } from "./dtos/create-user.dto"

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) {}

	async createOne(dto: CreateUserDto) {
		const userByEmail = await this.prismaService.user.findUnique({
			where: { email: dto.email }
		})

		if (userByEmail) {
			throw new ConflictException("User with this email is already existing")
		}

		const createdUser = await this.prismaService.user.create({
			data: dto
		})

		return createdUser
	}

	async findById(id: number) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		})

		if (!user) {
			throw new BadRequestException("User not found")
		}

		return user
	}

	async getProfile(userId: number) {
		return this.prismaService.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true
			}
		})
	}

	async getOne({ id, email }: GetUserDto) {
		if (!id && !email) {
			throw new BadRequestException()
		}

		const user = await this.prismaService.user.findFirst({
			where: { id, email }
		})

		return user
	}
}
