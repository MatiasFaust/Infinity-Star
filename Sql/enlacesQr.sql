-- Varios QR con enlaces (encuestas, formularios, páginas), cada uno con su nombre.
-- Antes había uno solo, el de la encuesta, guardado en la tabla ajuste:
-- si estaba cargado, lo pasamos a esta lista para no perderlo.

CREATE TABLE IF NOT EXISTS enlace_qr (
    id_enlace INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    enlace TEXT NOT NULL,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_enlace)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO enlace_qr (nombre, enlace)
SELECT 'Encuesta de satisfacción', valor FROM ajuste
WHERE clave = 'encuestaEnlace' AND valor <> ''
  AND NOT EXISTS (SELECT 1 FROM enlace_qr);

DELETE FROM ajuste WHERE clave = 'encuestaEnlace';
