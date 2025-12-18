/*
  Warnings:

  - You are about to drop the column `nroWhatsapp` on the `Parte` table. All the data in the column will be lost.
  - You are about to drop the column `nroWhatsapp` on the `Patrocinante` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Parte` DROP COLUMN `nroWhatsapp`;

-- AlterTable
ALTER TABLE `Patrocinante` DROP COLUMN `nroWhatsapp`;
