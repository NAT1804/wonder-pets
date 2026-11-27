import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };
  let passwordService: PasswordService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-access-token'),
    };
    passwordService = new PasswordService();
    const configService = {
      get: jest.fn().mockReturnValue(7),
    } as unknown as ConfigService;

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      passwordService,
      configService,
    );
  });

  it('should register a new customer and issue tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'alice@wonderpets.vn',
      fullName: 'Alice',
      phone: null,
      role: Role.CUSTOMER,
      emailVerified: false,
    });
    prisma.refreshToken.create.mockResolvedValue({});

    const session = await service.register({
      email: 'Alice@WonderPets.vn ',
      password: 'Password123!',
      fullName: 'Alice',
    });

    expect(session.accessToken).toBe('signed-access-token');
    expect(session.refreshToken).toBeTruthy();
    expect(session.user.email).toBe('alice@wonderpets.vn');
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  it('should reject duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        email: 'alice@wonderpets.vn',
        password: 'Password123!',
        fullName: 'Alice',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject login with wrong password', async () => {
    const hash = await passwordService.hashPassword('CorrectPass123!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'alice@wonderpets.vn',
      passwordHash: hash,
      fullName: 'Alice',
      phone: null,
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: false,
    });

    await expect(
      service.login({
        email: 'alice@wonderpets.vn',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should revoke all user sessions when a revoked refresh token is reused', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1', isActive: true },
    });

    await expect(service.refresh('reused-token')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', revokedAt: null },
      }),
    );
  });
});
