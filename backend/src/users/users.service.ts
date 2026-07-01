import {
  ConflictException,
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthProvider,
  Prisma,
  ProductStatus,
  User,
  UserAddress,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
} from './dto/user-profile.dto';
import { AddWishlistItemDto } from './dto/wishlist.dto';

type CreateEmailUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

type UpsertGoogleUserInput = {
  name: string;
  email: string;
  providerAccountId: string;
  emailVerified: boolean;
};

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.serializeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.ensureUserExists(userId);

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: dto.name?.trim(),
        phone: dto.phone?.trim(),
      },
    });

    return this.serializeUser(user);
  }

  async listAddresses(userId: string) {
    const addresses = await this.prisma.userAddress.findMany({
      where: {
        userId,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((address) => this.serializeAddress(address));
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    await this.ensureUserExists(userId);
    const addressCount = await this.prisma.userAddress.count({
      where: {
        userId,
      },
    });

    const address = await this.prisma.$transaction(async (tx) => {
      if (addressCount === 0) {
        await tx.userAddress.updateMany({
          where: {
            userId,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.userAddress.create({
        data: {
          ...this.buildAddressData(dto),
          userId,
          isDefault: addressCount === 0,
        },
      });
    });

    return this.serializeAddress(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    await this.ensureAddressBelongsToUser(userId, addressId);

    const address = await this.prisma.userAddress.update({
      where: {
        id: addressId,
      },
      data: this.buildAddressData(dto),
    });

    return this.serializeAddress(address);
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.ensureAddressBelongsToUser(userId, addressId);

    const address = await this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });

      return tx.userAddress.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      });
    });

    return this.serializeAddress(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.ensureAddressBelongsToUser(userId, addressId);

    await this.prisma.$transaction(async (tx) => {
      await tx.userAddress.delete({
        where: {
          id: addressId,
        },
      });

      if (address.isDefault) {
        const nextAddress = await tx.userAddress.findFirst({
          where: {
            userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (nextAddress) {
          await tx.userAddress.update({
            where: {
              id: nextAddress.id,
            },
            data: {
              isDefault: true,
            },
          });
        }
      }
    });
  }

  async listWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: this.wishlistItemSelect(),
    });

    return items.map((item) => this.serializeWishlistItem(item));
  }

  async addWishlistItem(userId: string, dto: AddWishlistItemDto) {
    await this.ensureUserExists(userId);

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          id: dto.variantId,
          productId: dto.productId,
        },
        select: {
          id: true,
        },
      });

      if (!variant) {
        throw new BadRequestException('Selected variant does not belong to this product.');
      }
    }

    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
      select: this.wishlistItemSelect(),
    });

    if (existingItem) {
      return this.serializeWishlistItem(existingItem);
    }

    const item = await this.prisma.wishlistItem.create({
      data: {
        userId,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
      select: this.wishlistItemSelect(),
    });

    return this.serializeWishlistItem(item);
  }

  async deleteWishlistItem(userId: string, itemId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found.');
    }

    await this.prisma.wishlistItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  async deleteWishlistProduct(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  async createEmailUser(input: CreateEmailUserInput) {
    const email = input.email.toLowerCase();
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    return this.prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: input.passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: false,
        authAccounts: {
          create: {
            provider: AuthProvider.EMAIL,
            providerAccountId: email,
          },
        },
      },
    });
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput) {
    const email = input.email.toLowerCase();
    const account = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.GOOGLE,
          providerAccountId: input.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (account) {
      return account.user;
    }

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      return this.prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: existingUser.name || input.name,
          emailVerified: existingUser.emailVerified || input.emailVerified,
          authAccounts: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerAccountId: input.providerAccountId,
            },
          },
        },
      });
    }

    return this.prisma.user.create({
      data: {
        name: input.name,
        email,
        role: UserRole.CUSTOMER,
        emailVerified: input.emailVerified,
        authAccounts: {
          create: {
            provider: AuthProvider.GOOGLE,
            providerAccountId: input.providerAccountId,
          },
        },
      },
    });
  }

  serializeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }
  }

  private async ensureAddressBelongsToUser(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    return address;
  }

  private buildAddressData(
    dto: CreateAddressDto | UpdateAddressDto,
  ) {
    return {
      label: dto.label?.trim() || 'Home',
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      addressLine1: dto.addressLine1.trim(),
      addressLine2: dto.addressLine2?.trim() || null,
      city: dto.city.trim(),
      state: dto.state.trim(),
      postalCode: dto.postalCode.trim(),
      country: dto.country.trim(),
    };
  }

  private serializeAddress(address: UserAddress) {
    return {
      id: address.id,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  private wishlistItemSelect() {
    return {
      id: true,
      userId: true,
      productId: true,
      variantId: true,
      createdAt: true,
      updatedAt: true,
      variant: {
        select: {
          id: true,
          colorName: true,
          colorSlug: true,
          colorHex: true,
          size: true,
          stock: true,
          sku: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
              isPrimary: true,
              variantId: true,
            },
          },
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          priceInPaise: true,
          sku: true,
          color: true,
          size: true,
          stock: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
              isPrimary: true,
              variantId: true,
            },
          },
          variants: {
            orderBy: [{ colorSlug: 'asc' }, { size: 'asc' }],
            select: {
              id: true,
              colorName: true,
              colorSlug: true,
              colorHex: true,
              size: true,
              stock: true,
              sku: true,
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                select: {
                  id: true,
                  url: true,
                  altText: true,
                  sortOrder: true,
                  isPrimary: true,
                  variantId: true,
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.WishlistItemSelect;
  }

  private serializeWishlistItem(
    item: Prisma.WishlistItemGetPayload<{
      select: ReturnType<UsersService['wishlistItemSelect']>;
    }>,
  ) {
    const variants = item.product.variants.map((variant) => ({
      id: variant.id,
      colorName: variant.colorName,
      colorSlug: variant.colorSlug,
      colorHex: variant.colorHex,
      size: variant.size,
      stock: variant.stock,
      sku: variant.sku,
      images: variant.images,
    }));
    const variantImages = variants.flatMap((variant) => variant.images);
    const primaryImage =
      item.variant?.images.find((image) => image.isPrimary) ??
      item.variant?.images[0] ??
      variantImages.find((image) => image.isPrimary) ??
      item.product.images.find((image) => image.isPrimary) ??
      variantImages[0] ??
      item.product.images[0] ??
      null;
    const colors = new Map<
      string,
      {
        colorName: string;
        colorSlug: string;
        colorHex: string | null;
        totalStock: number;
      }
    >();
    const sizesByColor: Record<
      string,
      {
        variantId: string;
        size: string;
        stock: number;
      }[]
    > = {};
    const imagesByColor: Record<string, typeof item.product.images> = {};

    variants.forEach((variant) => {
      const existingColor = colors.get(variant.colorSlug);

      colors.set(variant.colorSlug, {
        colorName: variant.colorName,
        colorSlug: variant.colorSlug,
        colorHex: variant.colorHex,
        totalStock: (existingColor?.totalStock ?? 0) + variant.stock,
      });

      sizesByColor[variant.colorSlug] = [
        ...(sizesByColor[variant.colorSlug] ?? []),
        {
          variantId: variant.id,
          size: variant.size,
          stock: variant.stock,
        },
      ];

      imagesByColor[variant.colorSlug] = [
        ...(imagesByColor[variant.colorSlug] ?? []),
        ...variant.images,
      ];
    });

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      selectedVariant: item.variant,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        priceInPaise: item.product.priceInPaise,
        sku: item.product.sku,
        color: item.product.color,
        size: item.product.size,
        stock: item.product.stock,
        status: item.product.status,
        category: item.product.category,
        images: item.product.images,
        primaryImage,
        availableColors: Array.from(colors.values()),
        sizesByColor,
        imagesByColor,
        variants,
        createdAt: item.product.createdAt,
        updatedAt: item.product.updatedAt,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
