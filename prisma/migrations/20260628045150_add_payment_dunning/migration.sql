-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "lastReminderAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Payment_type_status_dueDate_idx" ON "Payment"("type", "status", "dueDate");
