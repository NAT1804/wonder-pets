import { Environment, validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('should apply defaults when optional variables are omitted', () => {
    const result = validateEnv({});

    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGINS).toBe('http://localhost:4200');
    expect(result.SWAGGER_ENABLED).toBeUndefined();
    expect(result.JWT_REFRESH_EXPIRES_DAYS).toBe(7);
  });

  it('should parse valid environment variables in production', () => {
    const result = validateEnv({
      NODE_ENV: 'production',
      PORT: '4000',
      CORS_ORIGINS: 'https://pets.example.com',
      SWAGGER_ENABLED: 'false',
      JWT_ACCESS_SECRET: 'a-very-strong-production-secret-key-at-least-32-chars',
      JWT_REFRESH_EXPIRES_DAYS: '14',
      COOKIE_SECURE: 'true',
    });

    expect(result.NODE_ENV).toBe(Environment.Production);
    expect(result.PORT).toBe(4000);
    expect(result.CORS_ORIGINS).toBe('https://pets.example.com');
    expect(result.SWAGGER_ENABLED).toBe(false);
    expect(result.JWT_REFRESH_EXPIRES_DAYS).toBe(14);
    expect(result.COOKIE_SECURE).toBe(true);
  });

  it('should throw when JWT_ACCESS_SECRET is missing or short in production', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'too-short',
      }),
    ).toThrow('JWT_ACCESS_SECRET must be set');
  });

  it('should throw on invalid PORT or NODE_ENV', () => {
    expect(() => validateEnv({ PORT: '99999' })).toThrow(
      'Invalid environment configuration',
    );
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(
      'Invalid environment configuration',
    );
  });
});
