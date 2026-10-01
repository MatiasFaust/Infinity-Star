CREATE TABLE token (
  id_token int NOT NULL AUTO_INCREMENT,
  accion   varchar(40) NOT NULL,
  codigo   varchar(50) NOT NULL,
  PRIMARY KEY (id_token),
  UNIQUE (accion)
);

INSERT INTO token (accion, codigo) VALUES
  ('registrarPaciente',    'Paciente2026'),
  ('registrarFuncionario', 'Funcionario2026'),
  ('registrarChofer',      'Chofer2026'),
  ('eliminarPersona',      'BorrarPersona2026'),
  ('editarAmbulancia',     'EditarMovil2026'),
  ('eliminarAmbulancia',   'BorrarMovil2026'),
  ('eliminarDocumento',    'BorrarDoc2026'),
  ('editarPersona',        'EditarPersona2026');
