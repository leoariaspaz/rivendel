-- DropForeignKey
ALTER TABLE `PartesReclamos` DROP FOREIGN KEY `PartesReclamos_idReclamo_fkey`;

-- AddForeignKey
ALTER TABLE `PartesReclamos` ADD CONSTRAINT `PartesReclamos_idReclamo_fkey` FOREIGN KEY (`idReclamo`) REFERENCES `Reclamos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
