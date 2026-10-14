-- ============================================================
--  BASE DE DATOS DEL HOSPITAL DE CLINICAS MONTEVIDEO
--  Para cargar en el servidor del liceo.
-- ============================================================
--
--  COMO SE USA
--
--  1) En el phpMyAdmin del servidor, crear una base vacia
--     (por ejemplo que se llame hospital).
--  2) Entrar a esa base, ir a la pestania "Importar"
--     y subir este archivo.
--  3) Listo, quedan creadas las 21 tablas con los tokens
--     y el usuario superadmin para poder entrar.
--
--  OJO: este archivo trae solo la estructura, sin pacientes
--  ni funcionarios cargados. Los datos de prueba de mi
--  computadora no se suben porque son datos personales.
--
-- ============================================================



/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividad` (
  `id_actividad` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `accion` varchar(255) NOT NULL,
  `momento` datetime NOT NULL,
  PRIMARY KEY (`id_actividad`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ambulancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ambulancia` (
  `id_ambulancia` int(11) NOT NULL AUTO_INCREMENT,
  `matricula` varchar(20) NOT NULL,
  `movil` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_ambulancia`),
  UNIQUE KEY `matricula` (`matricula`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clave_acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clave_acceso` (
  `id_clave` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `tipo` varchar(20) NOT NULL DEFAULT 'registro',
  PRIMARY KEY (`id_clave`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `categoria_tipo` varchar(100) DEFAULT NULL,
  `id_funcionario` int(11) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `codigo` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  KEY `id_funcionario` (`id_funcionario`),
  KEY `fk_documento_paciente` (`id_paciente`),
  CONSTRAINT `documento_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `fk_documento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `encuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `encuesta` (
  `id_encuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_documento` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `codigo` varchar(40) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_encuesta`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `encuesta_ibfk_1` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `encuesta_paciente_entra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `encuesta_paciente_entra` (
  `id_encuesta` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  PRIMARY KEY (`id_encuesta`,`id_paciente`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `encuesta_paciente_entra_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuesta` (`id_encuesta`),
  CONSTRAINT `encuesta_paciente_entra_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funcionario` (
  `id_funcionario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `tipo_funcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `persona_funcion` (`id_persona`,`tipo_funcion`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `funcionario_paciente_lleva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funcionario_paciente_lleva` (
  `id_funcionario` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_paciente`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `funcionario_paciente_lleva_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_paciente_lleva_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `funcionario_traslado_administra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funcionario_traslado_administra` (
  `id_funcionario` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `funcionario_traslado_administra_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_traslado_administra_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `funcionario_traslado_maneja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funcionario_traslado_maneja` (
  `id_funcionario` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_funcionario`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `funcionario_traslado_maneja_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `funcionario_traslado_maneja_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `persona_unica` (`id_persona`),
  CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `paciente_traslado_acompania`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paciente_traslado_acompania` (
  `id_paciente` int(11) NOT NULL,
  `id_traslado` int(11) NOT NULL,
  PRIMARY KEY (`id_paciente`,`id_traslado`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `paciente_traslado_acompania_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `paciente_traslado_acompania_ibfk_2` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `persona` (
  `id_persona` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `cedula` int(11) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `posicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posicion` (
  `id_posicion` int(11) NOT NULL AUTO_INCREMENT,
  `id_traslado` int(11) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `momento` datetime NOT NULL,
  PRIMARY KEY (`id_posicion`),
  KEY `id_traslado` (`id_traslado`),
  CONSTRAINT `posicion_ibfk_1` FOREIGN KEY (`id_traslado`) REFERENCES `traslado` (`id_traslado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pregunta` (
  `id_pregunta` int(11) NOT NULL AUTO_INCREMENT,
  `id_encuesta` int(11) NOT NULL,
  `texto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pregunta`),
  KEY `id_encuesta` (`id_encuesta`),
  CONSTRAINT `pregunta_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuesta` (`id_encuesta`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `qr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qr` (
  `id_qr` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `id_documento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_qr`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `qr_ibfk_1` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `respuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `token` (
  `id_token` int(11) NOT NULL AUTO_INCREMENT,
  `accion` varchar(40) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `accion` (`accion`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `traslado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `suspendido` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `id_persona` (`id_persona`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- ============================================================
--  TOKENS DE ACCESO
-- ============================================================
--  Cada accion de la pagina pide su propio token.
--  Estos son de ejemplo. Una vez que entres como superadmin
--  cambialos desde la pantalla de superadmin, porque estos
--  estan escritos aca y los puede leer cualquiera.

INSERT INTO `token` (`id_token`, `accion`, `codigo`) VALUES
(1, 'registrarPaciente',   'CambiarEsto1'),
(2, 'registrarAdministrativo', 'CambiarEsto2'),
(3, 'registrarChofer',     'CambiarEsto3'),
(4, 'eliminarPersona',     'CambiarEsto4'),
(5, 'editarPersona',       'CambiarEsto5'),
(6, 'editarAmbulancia',    'CambiarEsto6'),
(7, 'eliminarAmbulancia',  'CambiarEsto7'),
(8, 'eliminarDocumento',   'CambiarEsto8');


-- ============================================================
--  USUARIO SUPERADMIN
-- ============================================================
--  Este es el unico usuario que viene cargado, para poder
--  entrar la primera vez. Despues, desde la pantalla de
--  superadmin, se registran los funcionarios y los choferes.
--
--  ANTES DE IMPORTAR: cambiale la contrasena abajo donde dice
--  CambiarEstaClave. La pagina la guarda cifrada con SHA2,
--  por eso no se puede leer despues, ni siquiera por mi.

INSERT INTO `persona` (`nombre`, `apellido`, `cedula`, `correo`, `telefono`)
VALUES ('Admin', 'Principal', 11111111, NULL, NULL);

INSERT INTO `funcionario` (`id_persona`, `tipo_funcion`)
VALUES (LAST_INSERT_ID(), 'superadmin');

INSERT INTO `usuario` (`id_persona`, `usuario`, `contrasena`, `suspendido`)
VALUES ((SELECT `id_persona` FROM `persona` WHERE `cedula` = 11111111),
        'Admin1',
        SHA2('CambiarEstaClave', 256),
        0);
