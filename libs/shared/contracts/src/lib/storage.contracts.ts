export type UploadFolder = 'products' | 'categories';

export type AllowedImageContentType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/avif';

export interface PresignUploadRequest {
  folder?: UploadFolder;
  contentType: AllowedImageContentType;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
}
