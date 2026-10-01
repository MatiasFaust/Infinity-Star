ALTER TABLE usuario
  ADD suspendido tinyint(1) NOT NULL DEFAULT 0;

CREATE TABLE actividad (
  id_actividad int NOT NULL AUTO_INCREMENT,
  id_persona   int,
  accion       varchar(255) NOT NULL,
  momento      datetime NOT NULL,
  PRIMARY KEY (id_actividad)
);

INSERT INTO persona (nombre, apellido, cedula, correo, direccion)
VALUES ('Super', 'Administrador', 11111111, 'superadmin@hospital.uy', 'Hospital de Clinicas');

INSERT INTO funcionario (id_persona, tipo_funcion)
VALUES ((SELECT id_persona FROM persona WHERE cedula = 11111111), 'superadmin');

INSERT INTO usuario (id_persona, usuario, contrasena)
VALUES ((SELECT id_persona FROM persona WHERE cedula = 11111111), 'Admin1', SHA2('Admin123', 256));
