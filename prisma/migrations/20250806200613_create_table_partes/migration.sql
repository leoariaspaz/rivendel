-- CreateTable
CREATE TABLE `Parte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `idTipoDocumento` INTEGER NOT NULL,
    `nroDocumento` VARCHAR(191) NOT NULL,
    `cuil` VARCHAR(191) NOT NULL,
    `idPatrocinante` INTEGER NOT NULL,
    `nroWhatsapp` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idTipoDocumento_fkey` FOREIGN KEY (`idTipoDocumento`) REFERENCES `TipoDocumento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idPatrocinante_fkey` FOREIGN KEY (`idPatrocinante`) REFERENCES `Patrocinante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
