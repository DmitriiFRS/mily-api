/*
  Warnings:

  - A unique constraint covering the columns `[email,phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `about` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_email_phoneNumber_key` ON `users`(`email`, `phoneNumber`);
