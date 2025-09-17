-- CreateTable
CREATE TABLE `Reclamos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rubros` VARCHAR(191) NOT NULL,
    `idResolucion` INTEGER NOT NULL,
    `fechaHoraInicio` DATETIME(3) NOT NULL,
    `horaFin` DATETIME(3) NOT NULL,
    `segundaFecha` DATETIME(3) NULL,
    `segFechaHoraInicio` DATETIME(3) NULL,
    `segHoraFin` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reclamos` ADD CONSTRAINT `Reclamos_idResolucion_fkey` FOREIGN KEY (`idResolucion`) REFERENCES `Resolucion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
