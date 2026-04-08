-- DropIndex
DROP INDEX `users_email_phoneNumber_key` ON `users`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `hashedRefreshToken` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phoneNumber` VARCHAR(191) NULL;
