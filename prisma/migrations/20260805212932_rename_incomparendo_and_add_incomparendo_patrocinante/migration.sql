ALTER TABLE `PartesReclamos` RENAME COLUMN `incomparendo` TO `incomparendoParte`,
    ADD COLUMN `incomparendoPatrocinante` BOOLEAN NOT NULL DEFAULT false;