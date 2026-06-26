import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHomepageSectionDto,
  UpdateHomepageSectionDto,
  UpdateHomepageSectionStatusDto,
} from './dto/homepage-section.dto';

@Injectable()
export class HomepageService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findActiveSections() {
    const sections = await this.prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: sections.map((section) => this.serializeSection(section)),
    };
  }

  async findAllSections() {
    const sections = await this.prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: sections.map((section) => this.serializeSection(section)),
    };
  }

  async findSectionById(id: string) {
    const section = await this.prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    return {
      success: true,
      data: this.serializeSection(section),
    };
  }

  async createSection(dto: CreateHomepageSectionDto) {
    const section = await this.prisma.homepageSection.create({
      data: this.buildSectionData(dto) as Prisma.HomepageSectionCreateInput,
    });

    return {
      success: true,
      data: this.serializeSection(section),
    };
  }

  async updateSection(id: string, dto: UpdateHomepageSectionDto) {
    await this.findSectionById(id);

    const section = await this.prisma.homepageSection.update({
      where: { id },
      data: this.buildSectionData(dto, true) as Prisma.HomepageSectionUpdateInput,
    });

    return {
      success: true,
      data: this.serializeSection(section),
    };
  }

  async updateSectionStatus(id: string, dto: UpdateHomepageSectionStatusDto) {
    await this.findSectionById(id);

    const section = await this.prisma.homepageSection.update({
      where: { id },
      data: { isActive: dto.isActive },
    });

    return {
      success: true,
      data: this.serializeSection(section),
    };
  }

  async deleteSection(id: string) {
    await this.findSectionById(id);

    await this.prisma.homepageSection.delete({
      where: { id },
    });

    return {
      success: true,
      data: { id },
    };
  }

  private buildSectionData(
    dto: CreateHomepageSectionDto | UpdateHomepageSectionDto,
    isUpdate = false,
  ) {
    const data: Record<string, unknown> = {};

    if ('type' in dto && dto.type !== undefined) {
      data.type = dto.type;
    }

    const stringFields = [
      'title',
      'subtitle',
      'description',
      'imageUrl',
      'imagePublicId',
      'ctaLabel',
      'ctaHref',
    ] as const;

    stringFields.forEach((field) => {
      if (field in dto && dto[field] !== undefined) {
        data[field] = dto[field] === '' ? null : dto[field];
      } else if (!isUpdate) {
        data[field] = null;
      }
    });

    if ('sortOrder' in dto && dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    } else if (!isUpdate) {
      data.sortOrder = 0;
    }

    if ('isActive' in dto && dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    } else if (!isUpdate) {
      data.isActive = true;
    }

    if ('metadata' in dto && dto.metadata !== undefined) {
      data.metadata = this.parseMetadata(dto.metadata);
    } else if (!isUpdate) {
      data.metadata = {};
    }

    return data;
  }

  private parseMetadata(metadata?: string) {
    if (!metadata) return {};

    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }

  private serializeSection(section: {
    id: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    imageUrl: string | null;
    imagePublicId: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    sortOrder: number;
    isActive: boolean;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: section.id,
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      imageUrl: section.imageUrl,
      imagePublicId: section.imagePublicId,
      ctaLabel: section.ctaLabel,
      ctaHref: section.ctaHref,
      sortOrder: section.sortOrder,
      isActive: section.isActive,
      metadata: section.metadata,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
    };
  }
}
