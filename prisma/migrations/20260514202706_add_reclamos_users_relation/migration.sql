-- AlterTable
ALTER TABLE `Reclamos` ADD COLUMN `idUsuario` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Reclamos` ADD CONSTRAINT `Reclamos_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
