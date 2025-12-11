-- This is an empty migration.
INSERT IGNORE INTO rivendel.TipoDocumento
(id, sintetico, descripcion)
VALUES(1, 'DNI', 'Documento Nacional de Identidad');

INSERT IGNORE INTO rivendel.TipoDocumento
(id, sintetico, descripcion)
VALUES(2, 'LE', 'Libreta de Enrolamiento');

INSERT IGNORE INTO rivendel.TipoDocumento
(id, sintetico, descripcion)
VALUES(3, 'LC', 'Libreta Cívica');

INSERT IGNORE INTO rivendel.TipoDocumento
(id, sintetico, descripcion)
VALUES(4, 'PASS', 'Pasaporte');
