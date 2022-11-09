-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `read` BOOLEAN NULL,
    ADD COLUMN `timeOfRecentMessage` INTEGER NULL;
