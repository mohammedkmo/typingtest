-- AlterTable
ALTER TABLE `Account` ADD COLUMN `refresh_token_expires_in` INTEGER NULL;

-- AlterTable
ALTER TABLE `TypingResult` ADD COLUMN `performanceScore` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `TypingResult_performanceScore_idx` ON `TypingResult`(`performanceScore`);
