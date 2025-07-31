-- CreateTable
CREATE TABLE `TipoDocumento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sintetico` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TipoDocumento_sintetico_key`(`sintetico`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
