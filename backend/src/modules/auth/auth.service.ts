import type { User } from "@prisma/client";
import { authRepository } from "./auth.repository";
import type { RegisterDto, LoginDto } from "./auth.dto";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { ConflictError, UnauthorizedError } from "../../utils/errors";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, "password" | "refreshToken">;
  tokens: AuthTokens;
}

function sanitizeUser(user: User): Omit<User, "password" | "refreshToken"> {
  const { password: _p, refreshToken: _r, ...safe } = user;
  return safe;
}

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashed = await hashPassword(dto.password);
    const user = await authRepository.create({
      name: dto.name,
      email,
      password: hashed,
    });

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(dto.email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await authRepository.findById(payload.userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      return this.issueTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(userId: string): Promise<void> {
    await authRepository.updateRefreshToken(userId, null);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await authRepository.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
