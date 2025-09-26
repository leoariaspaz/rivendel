/*
  Warnings:

  - Added the required column `rol` to the `PartesReclamos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PartesReclamos` ADD COLUMN `rol` INTEGER NOT NULL;
