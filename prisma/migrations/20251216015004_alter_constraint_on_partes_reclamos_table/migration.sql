ALTER TABLE `PartesReclamos` DROP CONSTRAINT `PartesReclamos_idReclamo_fkey`;
ALTER TABLE `PartesReclamos` ADD CONSTRAINT `PartesReclamos_idReclamo_fkey` FOREIGN KEY (`idReclamo`) REFERENCES `Reclamos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
