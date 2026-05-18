/*
  Warnings:

  - You are about to drop the `Resolucion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Reclamos` DROP FOREIGN KEY `Reclamos_idResolucion_fkey`;

-- DropIndex
DROP INDEX `Reclamos_idResolucion_fkey` ON `Reclamos`;

-- DropTable
DROP TABLE `Resolucion`;
