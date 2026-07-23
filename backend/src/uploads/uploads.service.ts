import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

type UploadFile = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    this.cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    this.apiKey = configService.get<string>('CLOUDINARY_API_KEY') ?? '';
    this.apiSecret = configService.get<string>('CLOUDINARY_API_SECRET') ?? '';
  }

  async uploadProductImages(input: {
    files: UploadFile[];
    categorySlug: string;
    productSlug: string;
    colorSlug: string;
  }) {
    this.assertCloudinaryConfigured();

    if (input.files.length === 0) {
      throw new BadRequestException('At least one image is required.');
    }

    if (input.files.length > 5) {
      throw new BadRequestException('Upload up to 5 images per color.');
    }

    input.files.forEach((file) => this.validateImage(file));

    const folder = `aevro/products/${input.categorySlug}/${input.productSlug}/${input.colorSlug}`;

    return Promise.all(
      input.files.map(async (file, index) => {
        const result = await this.uploadToCloudinary(file, folder);

        return {
          url: result.secure_url,
          publicId: result.public_id,
          altText: `${input.productSlug} ${input.colorSlug} image ${index + 1}`,
          sortOrder: index,
          isPrimary: index === 0,
        };
      }),
    );
  }

  async uploadHomepageImage(file: UploadFile) {
    this.assertCloudinaryConfigured();
    this.validateImage(file);

    const folder = 'aevro/homepage';
    const result = await this.uploadToCloudinary(file, folder);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      altText: 'Homepage section image',
    };
  }

  async uploadReviewImages(input: { files: UploadFile[]; reviewId: string }) {
    this.assertCloudinaryConfigured();

    if (input.files.length === 0) return [];
    if (input.files.length > 4) {
      throw new BadRequestException('Upload up to 4 review images.');
    }

    input.files.forEach((file) => this.validateImage(file));
    const folder = `aevro/reviews/${input.reviewId}`;

    const uploaded: Array<{ url: string; publicId: string; sortOrder: number }> = [];
    try {
      for (const [index, file] of input.files.entries()) {
        const result = await this.uploadToCloudinary(file, folder);
        uploaded.push({ url: result.secure_url, publicId: result.public_id, sortOrder: index });
      }
      return uploaded;
    } catch (error) {
      await Promise.all(uploaded.map((image) => this.deleteImage(image.publicId)));
      throw error;
    }
  }

  async deleteImage(publicId: string) {
    if (!publicId || !this.cloudName || !this.apiKey || !this.apiSecret) return false;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.signCloudinaryParams({ public_id: publicId, timestamp });
    const formData = new FormData();
    formData.set('public_id', publicId);
    formData.set('api_key', this.apiKey);
    formData.set('timestamp', timestamp);
    formData.set('invalidate', 'true');
    formData.set('signature', signature);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        { method: 'POST', body: formData },
      );
      if (!response.ok) {
        this.logger.warn('Cloudinary review-image cleanup was unsuccessful.');
        return false;
      }
      return true;
    } catch {
      this.logger.warn('Cloudinary review-image cleanup was unsuccessful.');
      return false;
    }
  }

  private validateImage(file: UploadFile) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only jpg, jpeg, png, and webp images are allowed.');
    }

    if (file.buffer.byteLength > 5 * 1024 * 1024) {
      throw new BadRequestException('Each image must be 5MB or smaller.');
    }
  }

  private async uploadToCloudinary(file: UploadFile, folder: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.signCloudinaryParams({ folder, timestamp });
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });

    formData.set('file', blob, file.filename);
    formData.set('api_key', this.apiKey);
    formData.set('timestamp', timestamp);
    formData.set('folder', folder);
    formData.set('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Cloudinary upload failed.');
    }

    return (await response.json()) as CloudinaryUploadResponse;
  }

  private signCloudinaryParams(params: Record<string, string>) {
    const payload = Object.entries(params)
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return createHash('sha1')
      .update(`${payload}${this.apiSecret}`)
      .digest('hex');
  }

  private assertCloudinaryConfigured() {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new ServiceUnavailableException('Cloudinary is not configured.');
    }
  }
}
