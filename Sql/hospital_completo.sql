-- Base de datos del Hospital de Clinicas
-- Generado el 30/09/2026 00:16

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `ambulancia`;
CREATE TABLE `ambulancia` (
  `id_ambulancia` int(11) NOT NULL AUTO_INCREMENT,
  `matricula` varchar(20) NOT NULL,
  `movil` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_ambulancia`),
  UNIQUE KEY `matricula` (`matricula`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `ambulancia` (`id_ambulancia`, `matricula`, `movil`) VALUES ('47', 'iad 1234', 'dasd');
INSERT INTO `ambulancia` (`id_ambulancia`, `matricula`, `movil`) VALUES ('48', 'dasd 123', 'dsadsa 12');

DROP TABLE IF EXISTS `clave_acceso`;
CREATE TABLE `clave_acceso` (
  `id_clave` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  PRIMARY KEY (`id_clave`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `clave_acceso` (`id_clave`, `codigo`) VALUES ('1', 'Funcionario2026');

DROP TABLE IF EXISTS `documento`;
CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `categoria_tipo` varchar(100) DEFAULT NULL,
  `id_funcionario` int(11) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_documento`),
  KEY `id_funcionario` (`id_funcionario`),
  KEY `fk_documento_paciente` (`id_paciente`),
  CONSTRAINT `documento_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `fk_documento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `documento` (`id_documento`, `titulo`, `categoria_tipo`, `id_funcionario`, `id_paciente`, `archivo`, `fecha`) VALUES ('22', 'Centellograma de perfusión miocárdica', 'pdf', '79', NULL, 'doc1790720079914.pdf', '2026-09-29 19:14:39');

DROP TABLE IF EXISTS `encuesta`;
CREATE TABLE `encuesta` (
  `id_encuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_documento` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_encuesta`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `encuesta_ibfk_1` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `encuesta_paciente_entra`;
CREATE TABLE `encuesta_paciente_entra` (
  `id_encuesta` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  PRIMARY KEY (`id_encuesta`,`id_paciente`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `encuesta_paciente_entra_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuesta` (`id_encuesta`),
  CONSTRAINT `encuesta_paciente_entra_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `funcionario`;
CREATE TABLE `funcionario` (
  `id_funcionario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `tipo_funcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `persona_funcion` (`id_persona`,`tipo_funcion`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `funcionario` (`id_funcionario`, `id_persona`, `tipo_funcion`) VALUES ('78', '129', 'chofer');
INSERT INTO `funcionario` (`id_funcionario`, `id_persona`, `tipo_funcion`) VALUES ('79', '130', 'administrativo');
INSERT INTO `funcionario` (`id_funcionario`, `id_persona`, `tipo_funcion`) VALUES ('80', '131', 'administrativo');
INSERT INTO `funcionario` (`id_funcionario`, `id_persona`, `tipo_funcion`) VALUES ('81', '133', 'chofer');
INSERT INTO `funcionario` (`id_funcionario`, `id_persona`, `tipo_funcion`) VALUES ('82', '134', 'chofer');

DROP TABLE IF EXISTS `funcionario_paciente_lleva`;
CREATE TABLE `funcionario_paciente_lleva` (
  `id_funcionario` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_paciente`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `funcionario_paciente_lleva_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_paciente_lleva_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `funcionario_traslado_administra`;
CREATE TABLE `funcionario_traslado_administra` (
  `id_funcionario` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `funcionario_traslado_administra_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_traslado_administra_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `funcionario_traslado_administra` (`id_funcionario`, `id_traslado`) VALUES ('79', '26');

DROP TABLE IF EXISTS `funcionario_traslado_maneja`;
CREATE TABLE `funcionario_traslado_maneja` (
  `id_funcionario` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `funcionario_traslado_maneja_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_traslado_maneja_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `funcionario_traslado_maneja` (`id_funcionario`, `id_traslado`) VALUES ('82', '26');

DROP TABLE IF EXISTS `paciente`;
CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `persona_unica` (`id_persona`),
  CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `paciente` (`id_paciente`, `id_persona`) VALUES ('54', '128');

DROP TABLE IF EXISTS `paciente_traslado_acompania`;
CREATE TABLE `paciente_traslado_acompania` (
  `id_paciente` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_paciente`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `paciente_traslado_acompania_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `paciente_traslado_acompania_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `persona`;
CREATE TABLE `persona` (
  `id_persona` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `cedula` int(11) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('128', 'Lautaro', 'Pintos', '99999999', 'facuultad2007@gmail.com', 'cerrito');
INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('129', 'Matías', 'Faust', '12344444', 'mtsfaust@gmail.com', 'Soriano 1854');
INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('130', 'Gaston ', 'Gomez', '33333333', 'Gaston@gmail.com', 'Av Italia');
INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('131', 'Julio', 'Pintos', '28567771', 'Jumakalau@gmail.com', 'Vicente Mongrell 823');
INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('133', 'Diego', 'Perez', '12351252', 'dedasdwe@gmail.com', 'dasd3eade');
INSERT INTO `persona` (`id_persona`, `nombre`, `apellido`, `cedula`, `correo`, `direccion`) VALUES ('134', 'Lautaro', 'Lautaro', '41255555', 'sd3e3f@gmail.com', 'daed3');

DROP TABLE IF EXISTS `posicion`;
CREATE TABLE `posicion` (
  `id_posicion` int(11) NOT NULL AUTO_INCREMENT,
  `id_traslado` int(11) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `momento` datetime NOT NULL,
  PRIMARY KEY (`id_posicion`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `posicion_ibfk_1` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `pregunta`;
CREATE TABLE `pregunta` (
  `id_pregunta` int(11) NOT NULL AUTO_INCREMENT,
  `id_encuesta` int(11) NOT NULL,
  `texto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pregunta`),
  KEY `id_encuesta` (`id_encuesta`),
  CONSTRAINT `pregunta_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuesta` (`id_encuesta`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `qr`;
CREATE TABLE `qr` (
  `id_qr` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `id_documento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_qr`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `qr_ibfk_1` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `qr` (`id_qr`, `url`, `id_documento`) VALUES ('4', 'documento.php?id=22', '22');

DROP TABLE IF EXISTS `respuesta`;
CREATE TABLE `respuesta` (
  `id_respuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_pregunta` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `respuesta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_respuesta`),
  KEY `id_pregunta` (`id_pregunta`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `respuesta_ibfk_1` FOREIGN KEY (`id_pregunta`) REFERENCES `pregunta` (`id_pregunta`),
  CONSTRAINT `respuesta_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `ruta`;
CREATE TABLE `ruta` (
  `id_ruta` int(11) NOT NULL AUTO_INCREMENT,
  `origen` varchar(255) NOT NULL,
  `destino` varchar(255) NOT NULL,
  `id_ambulancia` int(11) NOT NULL,
  `origen_lat` decimal(10,7) DEFAULT NULL,
  `origen_lng` decimal(10,7) DEFAULT NULL,
  `destino_lat` decimal(10,7) DEFAULT NULL,
  `destino_lng` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`id_ruta`),
  UNIQUE KEY `origen` (`origen`,`destino`,`id_ambulancia`),
  KEY `id_ambulancia` (`id_ambulancia`),
  CONSTRAINT `ruta_ibfk_1` FOREIGN KEY (`id_ambulancia`) REFERENCES `ambulancia` (`id_ambulancia`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `ruta` (`id_ruta`, `origen`, `destino`, `id_ambulancia`, `origen_lat`, `origen_lng`, `destino_lat`, `destino_lng`) VALUES ('7', '2615, Avenida 8 de Octubre, Tres Cruces, Montevideo, 11601, Uruguay', 'Paysandú, 60000, Uruguay', '48', '-34.8907536', '-56.1614227', '-32.3464670', '-58.0764771');

DROP TABLE IF EXISTS `traslado`;
CREATE TABLE `traslado` (
  `id_traslado` int(11) NOT NULL AUTO_INCREMENT,
  `tiempo_salida` datetime DEFAULT NULL,
  `tiempo_llegada` datetime DEFAULT NULL,
  `punto_origen` varchar(255) DEFAULT NULL,
  `destino` varchar(255) DEFAULT NULL,
  `tipo_elemento` varchar(100) DEFAULT NULL,
  `descripcion_elemento` text DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_ambulancia` int(11) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Pendiente',
  `copiloto_nombre` varchar(100) DEFAULT NULL,
  `copiloto_apellido` varchar(100) DEFAULT NULL,
  `copiloto_cedula` varchar(20) DEFAULT NULL,
  `id_ruta` int(11) DEFAULT NULL,
  `llegada_real` datetime DEFAULT NULL,
  `minutos_estimados` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_traslado`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_ambulancia` (`id_ambulancia`),
  KEY `id_ruta` (`id_ruta`),
  CONSTRAINT `traslado_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `traslado_ibfk_2` FOREIGN KEY (`id_ambulancia`) REFERENCES `ambulancia` (`id_ambulancia`),
  CONSTRAINT `traslado_ibfk_3` FOREIGN KEY (`id_ruta`) REFERENCES `ruta` (`id_ruta`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `traslado` (`id_traslado`, `tiempo_salida`, `tiempo_llegada`, `punto_origen`, `destino`, `tipo_elemento`, `descripcion_elemento`, `id_paciente`, `id_ambulancia`, `estado`, `copiloto_nombre`, `copiloto_apellido`, `copiloto_cedula`, `id_ruta`, `llegada_real`, `minutos_estimados`) VALUES ('26', '2026-09-29 18:13:25', '2026-09-29 23:09:25', '2615, Avenida 8 de Octubre, Tres Cruces, Montevideo, 11601, Uruguay', 'Paysandú, 60000, Uruguay', '', '', '54', '48', 'Finalizado', 'dead', 'deadea', '12344444', '7', '2026-09-29 18:13:42', '296');

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `id_persona` (`id_persona`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuario` (`id_usuario`, `id_persona`, `usuario`, `contrasena`) VALUES ('76', '129', 'Matias', '5f684df28279b5dc7537b65e83fd7f6cb3ef0d925d1b0a7688a34c9073275fed');
INSERT INTO `usuario` (`id_usuario`, `id_persona`, `usuario`, `contrasena`) VALUES ('77', '130', 'Gaston', '0378139a6772568c6f37a4643c1b1a53b357000ed4bb0b27cbe5e459470b05bd');
INSERT INTO `usuario` (`id_usuario`, `id_persona`, `usuario`, `contrasena`) VALUES ('78', '131', 'Julio', '9fc9b458969f9babde3e0b0fd086b374c49acb03d1e4225a282a36264b2db08a');
INSERT INTO `usuario` (`id_usuario`, `id_persona`, `usuario`, `contrasena`) VALUES ('79', '133', 'Diego', '7cc7b8a9e8c500509d2b85acae734e700676f11e45f2338370e3421f8a80ae66');
INSERT INTO `usuario` (`id_usuario`, `id_persona`, `usuario`, `contrasena`) VALUES ('80', '134', 'Lautaro', '4c7b36de6a79c903ad8a8cc52d3dea4767bbc21dc3fd6a807ccbf6180e407551');

SET FOREIGN_KEY_CHECKS = 1;
