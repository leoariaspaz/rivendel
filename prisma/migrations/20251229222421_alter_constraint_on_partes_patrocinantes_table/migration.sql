ALTER TABLE `Parte` DROP CONSTRAINT `Parte_idPatrocinante_fkey`;
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idPatrocinante_fkey` FOREIGN KEY (`idPatrocinante`) REFERENCES `Patrocinante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
