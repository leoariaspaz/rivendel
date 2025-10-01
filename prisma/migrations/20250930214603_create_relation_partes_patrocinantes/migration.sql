-- AlterTable
ALTER TABLE `Parte` MODIFY `idPatrocinante` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Parte` ADD CONSTRAINT `Parte_idPatrocinante_fkey` FOREIGN KEY (`idPatrocinante`) REFERENCES `Patrocinante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
