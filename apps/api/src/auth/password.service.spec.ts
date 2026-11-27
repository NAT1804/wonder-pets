import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('should hash and verify a password with unique salts', async () => {
    const hash1 = await service.hashPassword('SecretPass123!');
    const hash2 = await service.hashPassword('SecretPass123!');

    expect(hash1).not.toBe(hash2);
    expect(hash1.startsWith('scrypt$')).toBe(true);
    await expect(
      service.verifyPassword('SecretPass123!', hash1),
    ).resolves.toBe(true);
    await expect(
      service.verifyPassword('WrongPass123!', hash1),
    ).resolves.toBe(false);
  });

  it('should generate random refresh tokens and deterministically hash them', () => {
    const token1 = service.generateRefreshToken();
    const token2 = service.generateRefreshToken();

    expect(token1).not.toBe(token2);
    expect(service.hashToken(token1)).toBe(service.hashToken(token1));
    expect(service.hashToken(token1)).not.toBe(token1);
  });
});
