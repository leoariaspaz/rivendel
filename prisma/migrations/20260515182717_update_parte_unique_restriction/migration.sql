/*
  Warnings:

  - A unique constraint covering the columns `[idTipoDocumento,nroDocumento,idUsuario]` on the table `Parte` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Parte` DROP FOREIGN KEY `Parte_idTipoDocumento_fkey`;

-- DropIndex
DROP INDEX `Parte_idTipoDocumento_nroDocumento_key` ON `Parte`;

-- CreateIndex
CREATE UNIQUE INDEX `Parte_idTipoDocumento_nroDocumento_idUsuario_key` ON `Parte`(`idTipoDocumento`, `nroDocumento`, `idUsuario`);

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idTipoDocumento_fkey` FOREIGN KEY (`idTipoDocumento`) REFERENCES `TipoDocumento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
