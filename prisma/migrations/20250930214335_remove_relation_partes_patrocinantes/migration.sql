-- DropForeignKey
ALTER TABLE `Parte` DROP FOREIGN KEY `Parte_idPatrocinante_fkey`;

-- DropIndex
DROP INDEX `Parte_idPatrocinante_fkey` ON `Parte`;
