import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign-upload')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Generate a presigned Cloudflare R2 upload URL for images (Admin)',
  })
  presignUpload(@Body() dto: PresignUploadDto) {
    return this.storageService.createPresignedUpload(dto);
  }
}
