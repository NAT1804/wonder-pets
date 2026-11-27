import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ServiceUnavailableException when R2 is not configured', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new StorageService(configService);

    await expect(
      service.createPresignedUpload({
        folder: 'products',
        contentType: 'image/webp',
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('should generate presigned upload URL and public URL when R2 is configured', async () => {
    const values: Record<string, string> = {
      R2_ACCOUNT_ID: 'acc123',
      R2_ACCESS_KEY_ID: 'key123',
      R2_SECRET_ACCESS_KEY: 'secret123',
      R2_BUCKET_NAME: 'wonder-pets-media',
      R2_PUBLIC_BASE_URL: 'https://media.wonderpets.vn/',
    };
    const configService = {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://acc123.r2.cloudflarestorage.com/signed-url',
    );

    const service = new StorageService(configService);
    const result = await service.createPresignedUpload({
      folder: 'products',
      contentType: 'image/webp',
    });

    expect(result.uploadUrl).toBe(
      'https://acc123.r2.cloudflarestorage.com/signed-url',
    );
    expect(result.objectKey).toMatch(/^products\/\d{4}\/\d{2}\/.+\.webp$/);
    expect(result.publicUrl).toBe(
      `https://media.wonderpets.vn/${result.objectKey}`,
    );
    expect(result.expiresIn).toBe(300);
  });
});
