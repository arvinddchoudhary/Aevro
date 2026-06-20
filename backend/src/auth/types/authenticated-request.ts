import { FastifyRequest } from 'fastify';
import { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};
