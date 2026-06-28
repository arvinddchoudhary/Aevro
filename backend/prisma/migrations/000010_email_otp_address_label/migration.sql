ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'EMAIL_VERIFICATION_OTP';

ALTER TABLE "user_addresses"
ADD COLUMN IF NOT EXISTS "label" TEXT NOT NULL DEFAULT 'Home';

CREATE TABLE IF NOT EXISTS "email_verification_otps" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_verification_otps_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "email_verification_otps"
  ADD CONSTRAINT "email_verification_otps_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "email_verification_otps_userId_expiresAt_idx"
ON "email_verification_otps"("userId", "expiresAt");
