/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ads` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ads` ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ads_slug_key` ON `ads`(`slug`);
