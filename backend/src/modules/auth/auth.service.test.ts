import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service";
import { ConflictError, UnauthorizedError } from "../../utils/errors";

vi.mock("./auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateRefreshToken: vi.fn(),
  },
}));

vi.mock("../../utils/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed"),
  comparePassword: vi.fn(),
}));

vi.mock("../../utils/jwt", () => ({
  signAccessToken: vi.fn().mockReturnValue("access"),
  signRefreshToken: vi.fn().mockReturnValue("refresh"),
  verifyRefreshToken: vi.fn(),
}));

import { authRepository } from "./auth.repository";
import { comparePassword } from "../../utils/password";

describe("AuthService", () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws ConflictError when email exists", async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue({
      id: "1",
      name: "Test",
      email: "test@test.com",
      password: "hash",
      role: "USER",
      refreshToken: null,
      theme: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.register({ name: "Test", email: "test@test.com", password: "Password1" }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws UnauthorizedError on invalid login", async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(null);

    await expect(
      service.login({ email: "wrong@test.com", password: "pass" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError on wrong password", async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue({
      id: "1",
      name: "Test",
      email: "test@test.com",
      password: "hash",
      role: "USER",
      refreshToken: null,
      theme: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(
      service.login({ email: "test@test.com", password: "wrong" }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
