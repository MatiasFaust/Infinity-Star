-- El directorio actualizado suma el Hospital de Clínicas, que es el del proyecto.

INSERT INTO centro (referencia, nombre, tipo, departamento, localidad, direccion) VALUES
('MON03', 'Hospital de Clínicas Dr. Manuel Quintela', 'Hospital universitario público (Udelar)', 'Montevideo', 'Montevideo', 'Av. Italia 2870')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), direccion = VALUES(direccion);
