/*
  Warnings:

  - You are about to drop the column `recentMessage` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `recentMessage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `recentMessage`;
