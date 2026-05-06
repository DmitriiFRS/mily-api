-- CreateTable
CREATE TABLE `popular_directions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageId` INTEGER NULL,
    `originCityId` INTEGER NOT NULL,
    `destinationCityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `popular_directions` ADD CONSTRAINT `popular_directions_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `popular_directions` ADD CONSTRAINT `popular_directions_originCityId_fkey` FOREIGN KEY (`originCityId`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `popular_directions` ADD CONSTRAINT `popular_directions_destinationCityId_fkey` FOREIGN KEY (`destinationCityId`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
