/*
  Warnings:

  - A unique constraint covering the columns `[idTipoDocumento,nroDocumento]` on the table `Parte` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Parte_idTipoDocumento_nroDocumento_key` ON `Parte`(`idTipoDocumento`, `nroDocumento`);
