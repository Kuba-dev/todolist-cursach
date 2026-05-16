"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2_1 = require("argon2");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register({ email, password }, res) {
        const hashedPassword = await (0, argon2_1.hash)(password);
        const createdUser = await this.usersService.createOne({ email, hashedPassword });
        return await this.generateTokens(createdUser.id, res);
    }
    async googleAuth(email, res) {
        const userByEmail = await this.usersService.getOne({ email });
        if (userByEmail) {
            return await this.generateTokens(userByEmail.id, res);
        }
        const createdUser = await this.usersService.createOne({ email });
        return await this.generateTokens(createdUser.id, res);
    }
    async generateTokens(userId, res) {
        const accessToken = await this.jwtService.signAsync({ userId }, {
            secret: this.configService.getOrThrow("JWT_ACCESS_SECRET"),
            expiresIn: this.configService.getOrThrow("JWT_ACCESS_EXPIRES")
        });
        const refreshToken = await this.jwtService.signAsync({ userId }, {
            secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
            expiresIn: this.configService.getOrThrow("JWT_REFRESH_EXPIRES")
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true
        });
        return accessToken;
    }
    async validateUser(email, password) {
        const userByEmail = await this.usersService.getOne({ email });
        if (!userByEmail) {
            return null;
        }
        if (!userByEmail.hashedPassword) {
            throw new common_1.BadRequestException("Probably you already have an account via google");
        }
        const isValidPw = await (0, argon2_1.verify)(userByEmail.hashedPassword, password);
        if (!isValidPw) {
            return null;
        }
        return userByEmail;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map