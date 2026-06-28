-- CreateEnum
CREATE TYPE "EmailNotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('ORDER_CONFIRMED_CUSTOMER', 'ORDER_CONFIRMED_ADMIN', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'RETURN_REQUEST_RECEIVED', 'LOW_STOCK_ALERT', 'PASSWORD_RESET', 'WELCOME');

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT,
    "eventType" "EmailEventType" NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "status" "EmailNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "brevoMessageId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_notifications_idempotencyKey_key" ON "email_notifications"("idempotencyKey");

-- CreateIndex
CREATE INDEX "email_notifications_orderId_idx" ON "email_notifications"("orderId");

-- CreateIndex
CREATE INDEX "email_notifications_userId_idx" ON "email_notifications"("userId");

-- CreateIndex
CREATE INDEX "email_notifications_eventType_idx" ON "email_notifications"("eventType");

-- CreateIndex
CREATE INDEX "email_notifications_status_idx" ON "email_notifications"("status");

-- CreateIndex
CREATE INDEX "email_notifications_brevoMessageId_idx" ON "email_notifications"("brevoMessageId");

-- CreateIndex
CREATE INDEX "email_notifications_recipientEmail_idx" ON "email_notifications"("recipientEmail");

-- AddForeignKey
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
