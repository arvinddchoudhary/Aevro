import { FastifyRequest } from 'fastify';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};
