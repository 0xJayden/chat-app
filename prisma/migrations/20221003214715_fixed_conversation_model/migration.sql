/*
  Warnings:

  - You are about to drop the column `fromUserId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Conversation` DROP COLUMN `fromUserId`,
    DROP COLUMN `to`,
    DROP COLUMN `toUserId`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `to`;

-- CreateTable
CREATE TABLE `_ConversationToUser` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ConversationToUser_AB_unique`(`A`, `B`),
    INDEX `_ConversationToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
