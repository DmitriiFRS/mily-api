/*
  Warnings:

  - A unique constraint covering the columns `[originCityId,destinationCityId]` on the table `popular_directions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `popular_directions_originCityId_destinationCityId_key` ON `popular_directions`(`originCityId`, `destinationCityId`);
