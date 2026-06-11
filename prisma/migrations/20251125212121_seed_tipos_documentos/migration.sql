-- This is an empty migration.
INSERT IGNORE INTO TipoDocumento
(id, sintetico, descripcion)
VALUES(1, 'DNI', 'Documento Nacional de Identidad');

INSERT IGNORE INTO TipoDocumento
(id, sintetico, descripcion)
VALUES(2, 'LE', 'Libreta de Enrolamiento');

INSERT IGNORE INTO TipoDocumento
(id, sintetico, descripcion)
VALUES(3, 'LC', 'Libreta Cívica');

INSERT IGNORE INTO TipoDocumento
(id, sintetico, descripcion)
VALUES(4, 'PASS', 'Pasaporte');

INSERT IGNORE INTO TipoDocumento
(id, sintetico, descripcion)
VALUES(5, 'CUIT', 'Clave Única de Identificación Tributaria');
