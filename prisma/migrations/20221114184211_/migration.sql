/*
  Warnings:

  - You are about to alter the column `timeOfRecentMessage` on the `Conversation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Conversation` MODIFY `timeOfRecentMessage` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `timeCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
