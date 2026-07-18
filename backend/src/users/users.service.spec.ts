import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthProvider, UserRole } from '@prisma/client';
import { UsersService } from './users.service';

type TestUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: UserRole;
  emailVerified: boolean;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TestAccount = {
  userId: string;
  provider: AuthProvider;
  providerAccountId: string;
};

function createUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'user-1',
    name: 'Existing User',
    email: 'existing@aevro.com',
    passwordHash: null,
    role: UserRole.CUSTOMER,
    emailVerified: false,
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createUsersService(seed: { users?: TestUser[]; accounts?: TestAccount[]; pending?: string[] } = {}) {
  const users = new Map((seed.users ?? []).map((user) => [user.email, user]));
  const accounts = [...(seed.accounts ?? [])];
  const pending = new Set(seed.pending ?? []);

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email?: string } }) =>
        where.email ? users.get(where.email) ?? null : null,
      create: async ({ data }: { data: { name: string; email: string; role: UserRole; emailVerified: boolean; authAccounts: { create: TestAccount } } }) => {
        await new Promise((resolve) => setImmediate(resolve));
        if (users.has(data.email)) {
          throw { code: 'P2002' };
        }

        const user = createUser({
          id: `user-${users.size + 1}`,
          name: data.name,
          email: data.email,
          role: data.role,
          emailVerified: data.emailVerified,
        });
        users.set(user.email, user);
        accounts.push({ ...data.authAccounts.create, userId: user.id });
        return user;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<TestUser> }) => {
        const user = [...users.values()].find((candidate) => candidate.id === where.id);
        assert.ok(user);
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
      },
    },
    authAccount: {
      findUnique: async ({ where }: { where: { provider_providerAccountId?: { provider: AuthProvider; providerAccountId: string }; userId_provider?: { userId: string; provider: AuthProvider } } }) => {
        const byProvider = where.provider_providerAccountId;
        const byUser = where.userId_provider;
        const account = accounts.find((candidate) =>
          byProvider
            ? candidate.provider === byProvider.provider && candidate.providerAccountId === byProvider.providerAccountId
            : candidate.userId === byUser?.userId && candidate.provider === byUser.provider,
        );
        if (!account) return null;
        const user = [...users.values()].find((candidate) => candidate.id === account.userId);
        return { ...account, user };
      },
      create: async ({ data }: { data: TestAccount }) => {
        if (accounts.some((account) => account.provider === data.provider && account.providerAccountId === data.providerAccountId)) {
          throw { code: 'P2002' };
        }
        accounts.push(data);
        return data;
      },
    },
    pendingRegistration: {
      deleteMany: async ({ where }: { where: { email: string } }) => {
        const removed = pending.delete(where.email);
        return { count: removed ? 1 : 0 };
      },
    },
    $transaction: async (callback: (tx: unknown) => Promise<TestUser>) => callback(prisma),
  };

  return {
    service: new UsersService(prisma as never),
    accounts,
    pending,
    users,
  };
}

test('creates a Google customer and resolves a matching pending registration', async () => {
  const fixture = createUsersService({ pending: ['new@aevro.com'] });

  const user = await fixture.service.upsertGoogleUser({
    name: 'New User',
    email: ' NEW@AEVRO.COM ',
    providerAccountId: 'google-new',
    emailVerified: true,
  });

  assert.equal(user.email, 'new@aevro.com');
  assert.equal(user.role, UserRole.CUSTOMER);
  assert.equal(user.passwordHash, null);
  assert.equal(user.emailVerified, true);
  assert.deepEqual(fixture.accounts, [
    { userId: user.id, provider: AuthProvider.GOOGLE, providerAccountId: 'google-new' },
  ]);
  assert.equal(fixture.pending.has('new@aevro.com'), false);
});

test('returns an existing Google identity without creating another account', async () => {
  const user = createUser({ id: 'google-user', email: 'google@aevro.com', emailVerified: true });
  const fixture = createUsersService({
    users: [user],
    accounts: [{ userId: user.id, provider: AuthProvider.GOOGLE, providerAccountId: 'google-sub' }],
  });

  const result = await fixture.service.upsertGoogleUser({
    name: 'Different Name',
    email: user.email,
    providerAccountId: 'google-sub',
    emailVerified: true,
  });

  assert.equal(result.id, user.id);
  assert.equal(fixture.accounts.length, 1);
});

test('links an existing password account without changing password hash or role', async () => {
  const passwordUser = createUser({
    id: 'password-user',
    email: 'password@aevro.com',
    passwordHash: 'existing-password-hash',
    role: UserRole.ADMIN,
    emailVerified: false,
  });
  const fixture = createUsersService({
    users: [passwordUser],
    pending: [passwordUser.email],
  });

  const result = await fixture.service.upsertGoogleUser({
    name: 'Google Name',
    email: passwordUser.email,
    providerAccountId: 'google-password-user',
    emailVerified: true,
  });

  assert.equal(result.id, passwordUser.id);
  assert.equal(result.passwordHash, 'existing-password-hash');
  assert.equal(result.role, UserRole.ADMIN);
  assert.equal(result.emailVerified, true);
  assert.equal(fixture.accounts.length, 1);
  assert.equal(fixture.pending.has(passwordUser.email), false);
});

test('concurrent first Google logins recover from P2002 without duplicate users', async () => {
  const fixture = createUsersService();
  const input = {
    name: 'Concurrent User',
    email: 'concurrent@aevro.com',
    providerAccountId: 'google-concurrent',
    emailVerified: true,
  };

  const [first, second] = await Promise.all([
    fixture.service.upsertGoogleUser(input),
    fixture.service.upsertGoogleUser(input),
  ]);

  assert.equal(first.id, second.id);
  assert.equal(fixture.users.size, 1);
  assert.equal(fixture.accounts.length, 1);
});
