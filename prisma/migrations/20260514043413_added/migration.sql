/*
  Warnings:

  - Made the column `slug` on table `ads` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ads` MODIFY `slug` VARCHAR(191) NOT NULL;
