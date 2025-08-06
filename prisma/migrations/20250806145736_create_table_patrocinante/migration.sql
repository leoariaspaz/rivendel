-- CreateTable
CREATE TABLE `Patrocinante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `nroMatricula` INTEGER NOT NULL,
    `domicilio` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `nroCasillero` INTEGER NULL,

    UNIQUE INDEX `Patrocinante_nroMatricula_key`(`nroMatricula`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
