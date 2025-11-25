/*
  Warnings:

  - You are about to drop the column `segFechaHoraInicio` on the `Reclamos` table. All the data in the column will be lost.
  - You are about to drop the column `segHoraFin` on the `Reclamos` table. All the data in the column will be lost.
  - You are about to drop the column `segundaFecha` on the `Reclamos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numero,fechaHoraInicio]` on the table `Reclamos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Reclamos_numero_key` ON `Reclamos`;

-- AlterTable
ALTER TABLE `Reclamos` DROP COLUMN `segFechaHoraInicio`,
    DROP COLUMN `segHoraFin`,
    DROP COLUMN `segundaFecha`;

-- CreateIndex
CREATE UNIQUE INDEX `Reclamos_numero_fechaHoraInicio_key` ON `Reclamos`(`numero`, `fechaHoraInicio`);
