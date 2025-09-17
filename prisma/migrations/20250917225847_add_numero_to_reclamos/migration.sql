/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `Reclamos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero` to the `Reclamos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Reclamos` ADD COLUMN `numero` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Reclamos_numero_key` ON `Reclamos`(`numero`);
