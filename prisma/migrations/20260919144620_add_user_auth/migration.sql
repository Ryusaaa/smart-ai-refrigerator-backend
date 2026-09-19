-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingredients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NULL,
    `imageUrl` VARCHAR(2048) NULL,
    `source` ENUM('MANUAL', 'CAMERA', 'SENSOR', 'HARDWARE', 'AI_SCAN') NOT NULL DEFAULT 'MANUAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `cookingTime` INTEGER NOT NULL,
    `difficulty` VARCHAR(191) NOT NULL,
    `instructions` JSON NOT NULL,
    `imageUrl` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_ingredients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipeId` INTEGER NOT NULL,
    `ingredientName` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `isOptional` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_sources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipeId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_sources` ADD CONSTRAINT `recipe_sources_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
