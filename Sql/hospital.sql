

CREATE TABLE persona (
  id_persona int NOT NULL AUTO_INCREMENT,
  nombre     varchar(255),
  apellido   varchar(255),
  cedula     int,
  correo     varchar(255),
  direccion  varchar(255),
  PRIMARY KEY (id_persona),
  UNIQUE (cedula),
  UNIQUE (correo)
);

CREATE TABLE usuario (
  id_usuario int NOT NULL AUTO_INCREMENT,
  id_persona int,
  usuario    varchar(50) NOT NULL,
  contrasena varchar(255) NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE (usuario),
  UNIQUE (id_persona),
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona)
);

CREATE TABLE paciente (
  id_paciente int NOT NULL AUTO_INCREMENT,
  id_persona  int,
  PRIMARY KEY (id_paciente),
  UNIQUE (id_persona),
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona)
);

CREATE TABLE funcionario (
  id_funcionario int NOT NULL AUTO_INCREMENT,
  id_persona     int,
  tipo_funcion   varchar(100),
  PRIMARY KEY (id_funcionario),
  UNIQUE (id_persona, tipo_funcion),
  FOREIGN KEY (id_persona) REFERENCES persona (id_persona)
);

CREATE TABLE clave_acceso (
  id_clave int NOT NULL AUTO_INCREMENT,
  codigo   varchar(50) NOT NULL,
  PRIMARY KEY (id_clave),
  UNIQUE (codigo)
);

CREATE TABLE ambulancia (
  id_ambulancia int NOT NULL AUTO_INCREMENT,
  matricula     varchar(20) NOT NULL,
  movil         varchar(100),
  PRIMARY KEY (id_ambulancia),
  UNIQUE (matricula)
);

CREATE TABLE traslado (
  id_traslado          int NOT NULL AUTO_INCREMENT,
  tiempo_salida        datetime,
  tiempo_llegada       datetime,
  punto_origen         varchar(255),
  destino              varchar(255),
  tipo_elemento        varchar(100),
  descripcion_elemento text,
  id_paciente          int,
  id_ambulancia        int,
  estado               varchar(50) DEFAULT 'Pendiente',
  inicio_real          datetime,
  fin_real             datetime,
  PRIMARY KEY (id_traslado),
  FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente),
  FOREIGN KEY (id_ambulancia) REFERENCES ambulancia (id_ambulancia)
);

CREATE TABLE documento (
  id_documento   int NOT NULL AUTO_INCREMENT,
  titulo         varchar(255),
  categoria_tipo varchar(100),
  id_funcionario int,
  id_paciente    int,
  archivo        varchar(255),
  fecha          datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id_documento),
  FOREIGN KEY (id_funcionario) REFERENCES funcionario (id_funcionario),
  FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente)
);

CREATE TABLE qr (
  id_qr        int NOT NULL AUTO_INCREMENT,
  url          varchar(255),
  id_documento int,
  PRIMARY KEY (id_qr),
  FOREIGN KEY (id_documento) REFERENCES documento (id_documento)
);

CREATE TABLE encuesta (
  id_encuesta  int NOT NULL AUTO_INCREMENT,
  id_documento int,
  fecha        datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id_encuesta),
  FOREIGN KEY (id_documento) REFERENCES documento (id_documento)
);

CREATE TABLE pregunta (
  id_pregunta int NOT NULL AUTO_INCREMENT,
  id_encuesta int NOT NULL,
  texto       varchar(255),
  respuesta   varchar(255),
  PRIMARY KEY (id_pregunta),
  FOREIGN KEY (id_encuesta) REFERENCES encuesta (id_encuesta)
);

CREATE TABLE encuesta_paciente_entra (
  id_encuesta int NOT NULL,
  id_paciente int NOT NULL,
  PRIMARY KEY (id_encuesta, id_paciente),
  FOREIGN KEY (id_encuesta) REFERENCES encuesta (id_encuesta),
  FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente)
);

CREATE TABLE funcionario_paciente_lleva (
  id_funcionario int NOT NULL,
  id_paciente    int NOT NULL,
  PRIMARY KEY (id_funcionario, id_paciente),
  FOREIGN KEY (id_funcionario) REFERENCES funcionario (id_funcionario),
  FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente)
);

CREATE TABLE funcionario_traslado_maneja (
  id_funcionario int NOT NULL,
  id_traslado    int NOT NULL,
  PRIMARY KEY (id_funcionario, id_traslado),
  FOREIGN KEY (id_funcionario) REFERENCES funcionario (id_funcionario),
  FOREIGN KEY (id_traslado) REFERENCES traslado (id_traslado)
);

CREATE TABLE funcionario_traslado_administra (
  id_funcionario int NOT NULL,
  id_traslado    int NOT NULL,
  PRIMARY KEY (id_funcionario, id_traslado),
  FOREIGN KEY (id_funcionario) REFERENCES funcionario (id_funcionario),
  FOREIGN KEY (id_traslado) REFERENCES traslado (id_traslado)
);

CREATE TABLE paciente_traslado_acompania (
  id_paciente int NOT NULL,
  id_traslado int NOT NULL,
  PRIMARY KEY (id_paciente, id_traslado),
  FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente),
  FOREIGN KEY (id_traslado) REFERENCES traslado (id_traslado)
);

INSERT INTO clave_acceso (codigo) VALUES ('Funcionario2026');
