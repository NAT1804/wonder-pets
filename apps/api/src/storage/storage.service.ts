import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AllowedImageType, PresignUploadDto } from './dto/presign-upload.dto';

const EXTENSION_BY_MIME: Record<AllowedImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const PRESIGN_TTL_SECONDS = 300;

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  async createPresignedUpload(dto: PresignUploadDto) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('R2_BUCKET_NAME');
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucket ||
      !publicBaseUrl
    ) {
      throw new ServiceUnavailableException(
        'Cloudflare R2 storage is not configured',
      );
    }

    const client = this.getClient(accountId, accessKeyId, secretAccessKey);
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const ext = EXTENSION_BY_MIME[dto.contentType];
    const objectKey = `${dto.folder}/${year}/${month}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: PRESIGN_TTL_SECONDS,
    });

    const normalizedBase = publicBaseUrl.replace(/\/+$/, '');

    return {
      uploadUrl,
      objectKey,
      publicUrl: `${normalizedBase}/${objectKey}`,
      expiresIn: PRESIGN_TTL_SECONDS,
    };
  }

  private getClient(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
  ): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    return this.s3Client;
  }
}
