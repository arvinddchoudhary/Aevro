import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadsService } from '../uploads/uploads.service';

type MultipartPart = {
  type: 'file' | 'field';
  fieldname: string;
  filename?: string;
  mimetype?: string;
  value?: unknown;
  toBuffer?: () => Promise<Buffer>;
};

type MultipartRequest = FastifyRequest & {
  parts: () => AsyncIterable<MultipartPart>;
};

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUploadsController {
  constructor(@Inject(UploadsService) private readonly uploadsService: UploadsService) {}

  @Post('product-images')
  async uploadProductImages(@Req() request: MultipartRequest) {
    const files: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];
    const fields = {
      categorySlug: '',
      productSlug: '',
      colorSlug: '',
    };

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (!part.toBuffer || !part.filename || !part.mimetype) {
          throw new BadRequestException('Invalid file upload.');
        }

        files.push({
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimetype: part.mimetype,
        });
      }

      if (part.type === 'field' && part.fieldname in fields) {
        fields[part.fieldname as keyof typeof fields] = String(part.value ?? '');
      }
    }

    if (!fields.categorySlug || !fields.productSlug || !fields.colorSlug) {
      throw new BadRequestException('categorySlug, productSlug, and colorSlug are required.');
    }

    const images = await this.uploadsService.uploadProductImages({
      files,
      categorySlug: fields.categorySlug,
      productSlug: fields.productSlug,
      colorSlug: fields.colorSlug,
    });

    return {
      success: true,
      data: images,
    };
  }

  @Post('homepage-image')
  async uploadHomepageImage(@Req() request: MultipartRequest) {
    const files: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (!part.toBuffer || !part.filename || !part.mimetype) {
          throw new BadRequestException('Invalid file upload.');
        }

        files.push({
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimetype: part.mimetype,
        });
      }
    }

    if (files.length === 0) {
      throw new BadRequestException('At least one image is required.');
    }

    if (files.length > 1) {
      throw new BadRequestException('Upload one image at a time for homepage sections.');
    }

    const image = await this.uploadsService.uploadHomepageImage(files[0]);

    return {
      success: true,
      data: image,
    };
  }
}
