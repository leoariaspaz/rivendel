-- This is an empty migration.
ALTER TABLE `Parte` DROP CONSTRAINT `Parte_idPatrocinante_fkey`;
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idPatrocinante_fkey` FOREIGN KEY (`idPatrocinante`) REFERENCES `Parte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
