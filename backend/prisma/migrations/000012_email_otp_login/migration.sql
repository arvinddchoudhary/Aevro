CREATE TABLE "login_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_otps_userId_expiresAt_idx" ON "login_otps"("userId", "expiresAt");
CREATE INDEX "login_otps_expiresAt_idx" ON "login_otps"("expiresAt");

ALTER TABLE "login_otps"
ADD CONSTRAINT "login_otps_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
