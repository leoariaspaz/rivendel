-- AlterTable
ALTER TABLE `Parte` ADD COLUMN `idUsuario` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
