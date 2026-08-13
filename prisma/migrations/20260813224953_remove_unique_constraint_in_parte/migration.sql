-- DropForeignKey
ALTER TABLE `Parte` DROP FOREIGN KEY `Parte_idTipoDocumento_fkey`;

-- DropIndex
DROP INDEX `Parte_idTipoDocumento_nroDocumento_idUsuario_key` ON `Parte`;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idTipoDocumento_fkey` FOREIGN KEY (`idTipoDocumento`) REFERENCES `TipoDocumento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
