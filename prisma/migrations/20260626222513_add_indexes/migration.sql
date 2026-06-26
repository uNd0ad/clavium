-- CreateIndex
CREATE INDEX "Contract_ownerId_idx" ON "Contract"("ownerId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_propertyId_status_idx" ON "Contract"("propertyId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Offer_toUserId_idx" ON "Offer"("toUserId");

-- CreateIndex
CREATE INDEX "Offer_fromUserId_idx" ON "Offer"("fromUserId");

-- CreateIndex
CREATE INDEX "Offer_propertyId_status_idx" ON "Offer"("propertyId", "status");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_contractId_type_status_idx" ON "Payment"("contractId", "type", "status");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_status_transactionType_idx" ON "Property"("status", "transactionType");

-- CreateIndex
CREATE INDEX "SavedProperty_userId_idx" ON "SavedProperty"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Ticket_contractId_idx" ON "Ticket"("contractId");

-- CreateIndex
CREATE INDEX "Ticket_authorId_idx" ON "Ticket"("authorId");

-- CreateIndex
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");
