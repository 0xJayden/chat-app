/*
  Warnings:

  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Conversation` DROP COLUMN `userId`,
    ADD COLUMN `fromUserId` VARCHAR(191) NOT NULL,
    ADD COLUMN `toUserId` VARCHAR(191) NOT NULL;
