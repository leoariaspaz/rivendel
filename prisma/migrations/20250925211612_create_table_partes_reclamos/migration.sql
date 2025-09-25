-- CreateTable
CREATE TABLE `PartesReclamos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idParte` INTEGER NOT NULL,
    `idReclamo` INTEGER NOT NULL,

    UNIQUE INDEX `PartesReclamos_idParte_idReclamo_key`(`idParte`, `idReclamo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartesReclamos` ADD CONSTRAINT `PartesReclamos_idParte_fkey` FOREIGN KEY (`idParte`) REFERENCES `Parte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartesReclamos` ADD CONSTRAINT `PartesReclamos_idReclamo_fkey` FOREIGN KEY (`idReclamo`) REFERENCES `Reclamos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
