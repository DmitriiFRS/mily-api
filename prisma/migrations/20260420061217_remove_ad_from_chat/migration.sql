/*
  Warnings:

  - You are about to drop the column `adId` on the `chat_rooms` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `chat_rooms_adId_idx` ON `chat_rooms`;

-- AlterTable
ALTER TABLE `chat_rooms` DROP COLUMN `adId`;
