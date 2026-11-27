import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const ALLOWED_UPLOAD_FOLDERS = ['products', 'categories'] as const;
export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export class PresignUploadDto {
  @ApiPropertyOptional({
    enum: ALLOWED_UPLOAD_FOLDERS,
    default: 'products',
  })
  @IsOptional()
  @IsIn(ALLOWED_UPLOAD_FOLDERS)
  folder: UploadFolder = 'products';

  @ApiProperty({
    enum: ALLOWED_IMAGE_TYPES,
    example: 'image/webp',
  })
  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: AllowedImageType;
}
