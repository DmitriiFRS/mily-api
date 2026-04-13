-- CreateTable
CREATE TABLE `ad_translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `locale` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `adId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ad_translations` ADD CONSTRAINT `ad_translations_adId_fkey` FOREIGN KEY (`adId`) REFERENCES `ads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
