-- CreateTable
CREATE TABLE `Aluno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `sexo` VARCHAR(191) NOT NULL,
    `idade` VARCHAR(191) NOT NULL,
    `responsavel` VARCHAR(191) NOT NULL,
    `dataNascimento` DATETIME(3) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `turma` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `permission` VARCHAR(191) NOT NULL,
    `photoPath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `permission` VARCHAR(191) NOT NULL,
    `token` LONGTEXT NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `token` LONGTEXT NOT NULL,
    `datatime` DATETIME(3) NOT NULL,
    `info` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChamadaJuniores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Data` DATETIME(3) NOT NULL,
    `Professor` VARCHAR(191) NOT NULL,
    `Titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlunoChamadaJunior` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `NomeAluno` VARCHAR(191) NOT NULL,
    `Presenca` VARCHAR(191) NOT NULL,
    `ChamadaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChamadaMaternal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Data` DATETIME(3) NOT NULL,
    `Professor` VARCHAR(191) NOT NULL,
    `Titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlunoChamadaMaternal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `NomeAluno` VARCHAR(191) NOT NULL,
    `Presenca` VARCHAR(191) NOT NULL,
    `ChamadaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Config_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AlunoChamadaJunior` ADD CONSTRAINT `AlunoChamadaJunior_ChamadaId_fkey` FOREIGN KEY (`ChamadaId`) REFERENCES `ChamadaJuniores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlunoChamadaMaternal` ADD CONSTRAINT `AlunoChamadaMaternal_ChamadaId_fkey` FOREIGN KEY (`ChamadaId`) REFERENCES `ChamadaMaternal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
