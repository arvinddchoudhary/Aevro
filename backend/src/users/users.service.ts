import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AuthProvider, User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
}
