-- DropForeignKey
ALTER TABLE `ads` DROP FOREIGN KEY `ads_authorId_fkey`;

-- DropIndex
DROP INDEX `ads_authorId_fkey` ON `ads`;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
