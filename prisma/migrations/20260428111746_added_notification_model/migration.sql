-- DropIndex
DROP INDEX `notifications_createdAt_idx` ON `notifications`;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `referenceId` INTEGER NULL,
    ADD COLUMN `type` ENUM('CHAT_MESSAGE', 'SYSTEM', 'ORDER_UPDATE', 'REVIEW_RECEIVED') NOT NULL DEFAULT 'CHAT_MESSAGE';

-- CreateIndex
CREATE INDEX `notifications_userId_type_referenceId_isRead_idx` ON `notifications`(`userId`, `type`, `referenceId`, `isRead`);
