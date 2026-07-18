-- Preconditions checked before this migration was created:
-- SELECT "userId", provider, COUNT(*)
-- FROM auth_accounts
-- GROUP BY "userId", provider
-- HAVING COUNT(*) > 1;
--
-- If this query returns rows in another environment, stop deployment and choose
-- the valid identity for each user before applying this migration. Do not delete
-- accounts blindly because provider identities are used to authenticate users.
CREATE UNIQUE INDEX "auth_accounts_userId_provider_key"
ON "auth_accounts"("userId", provider);
