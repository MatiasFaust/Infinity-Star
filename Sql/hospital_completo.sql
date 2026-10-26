-- ============================================================
--  BASE DE DATOS DEL HOSPITAL DE CLINICAS MONTEVIDEO
-- ============================================================
--
--  COMO SE USA
--
--  1) En phpMyAdmin, crear una base vacia llamada hospital.
--  2) Entrar a esa base, ir a la pestania "Importar"
--     y subir este archivo.
--  3) Listo. Con este archivo solo alcanza: quedan las 17
--     tablas, los tokens, los 42 centros de salud y el
--     usuario para poder entrar la primera vez.
--
--  ENTRAR LA PRIMERA VEZ
--     usuario: Admin1
--     clave:   CambiarEstaClave
--     Cambiala apenas entres.
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
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividad` (
  `id_actividad` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `accion` varchar(255) NOT NULL,
  `momento` datetime NOT NULL,
  PRIMARY KEY (`id_actividad`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ajuste` (
  `clave` varchar(50) NOT NULL,
  `valor` text NOT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
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
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `centro` (
  `id_centro` int(11) NOT NULL AUTO_INCREMENT,
  `referencia` varchar(10) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `departamento` varchar(100) NOT NULL,
  `localidad` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`id_centro`),
  UNIQUE KEY `referencia` (`referencia`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `funcionario` (
  `id_funcionario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `tipo_funcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `persona_funcion` (`id_persona`,`tipo_funcion`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qr` (
  `id_qr` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `id_documento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_qr`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `qr_ibfk_1` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
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
  `creado` datetime DEFAULT NULL,
  PRIMARY KEY (`id_traslado`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_ambulancia` (`id_ambulancia`),
  KEY `id_ruta` (`id_ruta`),
  CONSTRAINT `traslado_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `traslado_ibfk_2` FOREIGN KEY (`id_ambulancia`) REFERENCES `ambulancia` (`id_ambulancia`),
  CONSTRAINT `traslado_ibfk_3` FOREIGN KEY (`id_ruta`) REFERENCES `ruta` (`id_ruta`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_persona` int(11) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `suspendido` tinyint(1) NOT NULL DEFAULT 0,
  `clave_propia` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `id_persona` (`id_persona`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
--  CENTROS DE SALUD
-- ============================================================
--  Directorio de hospitales y centros de Uruguay.
--  Sirve para elegir el origen y el destino del traslado.

INSERT INTO `centro` (`id_centro`, `referencia`, `nombre`, `tipo`, `departamento`, `localidad`, `direccion`, `lat`, `lng`) VALUES (1,'ART01','Hospital de Artigas','Hospital público (ASSE)','Artigas','Artigas','Lecueder 482',NULL,NULL),(2,'ART02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Artigas','Artigas','Amaro Ferreira Ramos 289',NULL,NULL),(3,'CAN01','Hospital de Canelones','Hospital público (ASSE)','Canelones','Canelones','Dr. Soca s/n',NULL,NULL),(4,'CAN02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Canelones','Canelones','Tolentino González s/n y Batlle y Ordóñez',NULL,NULL),(5,'CEL01','Hospital de Melo','Hospital público (ASSE)','Cerro Largo','Melo','Dr. Remigio Castellanos 751',NULL,NULL),(6,'CEL02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Cerro Largo','Melo','Rodó 665 entre Muñiz y Aparicio Saravia',NULL,NULL),(7,'COL01','Hospital de Colonia','Hospital público (ASSE)','Colonia','Colonia del Sacramento','Av. Roosevelt s/n',NULL,NULL),(8,'COL02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Colonia','Colonia del Sacramento','Fosalba 576 entre Vicente P. García y Av. Artigas',NULL,NULL),(9,'DUR01','Hospital de Durazno','Hospital público (ASSE)','Durazno','Durazno','Dr. Emilio Penza 900',NULL,NULL),(10,'DUR02','Centro Auxiliar Sarandí del Yí','Centro auxiliar público (ASSE)','Durazno','Sarandí del Yí','Av. Dr. Héctor Petrini 501',NULL,NULL),(11,'DUR03','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Durazno','Durazno','Eusebio Píriz s/n casi 18 de Julio',NULL,NULL),(12,'FLE01','Hospital de Flores / Trinidad','Hospital público (ASSE)','Flores','Trinidad','Batlle y Ordóñez 834 esq. M. Sánchez',NULL,NULL),(13,'FLE02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Flores','Trinidad','Santísima Trinidad casi Sarandí',NULL,NULL),(14,'FLO01','Hospital de Florida','Hospital público (ASSE)','Florida','Florida','Castillo 510',NULL,NULL),(15,'FLO02','Centro Auxiliar Sarandí Grande','Centro auxiliar público (ASSE)','Florida','Sarandí Grande','Luis Pasteur 1052',NULL,NULL),(16,'FLO03','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Florida','Florida','Alejandro Gallinal s/n esq. 18 de Julio',NULL,NULL),(17,'LAV01','Hospital de Minas','Hospital público (ASSE)','Lavalleja','Minas','Av. Varela 650',NULL,NULL),(18,'LAV02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Lavalleja','Minas','Juan Farina s/n entre Treinta y Tres y Roosevelt',NULL,NULL),(19,'MAL01','Hospital Elbio Rivero','Hospital público (ASSE)','Maldonado','Maldonado','Ventura Alegre s/n',NULL,NULL),(20,'MAL02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Maldonado','Maldonado','Rafael Pérez del Puerto y 18 de Julio',NULL,NULL),(21,'MON01','Hospital Pereira Rossell','Hospital público (ASSE)','Montevideo','Montevideo','Bv. Artigas 1550',NULL,NULL),(22,'MON02','Hospital Maciel','Hospital público (ASSE)','Montevideo','Montevideo','25 de Mayo 174',NULL,NULL),(23,'PAY01','Hospital de Paysandú','Hospital público (ASSE)','Paysandú','Paysandú','Monte Caseros 520',NULL,NULL),(24,'PAY02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Paysandú','Paysandú','Leandro Gómez 1039',NULL,NULL),(25,'RIN01','Hospital de Fray Bentos','Hospital público (ASSE)','Río Negro','Fray Bentos','25 de Mayo 3200',NULL,NULL),(26,'RIN02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Río Negro','Fray Bentos','Rivera 1229',NULL,NULL),(27,'RIV01','Hospital de Rivera','Hospital público (ASSE)','Rivera','Rivera','Uruguay 712',NULL,NULL),(28,'RIV02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Rivera','Rivera','Rodó 1070',NULL,NULL),(29,'ROC01','Hospital de Rocha','Hospital público (ASSE)','Rocha','Rocha','Martínez Rodríguez s/n',NULL,NULL),(30,'ROC02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Rocha','Rocha','Eliseo Marzol esq. Ramírez',NULL,NULL),(31,'SAL01','Hospital de Salto','Hospital público (ASSE)','Salto','Salto','18 de Julio 446',NULL,NULL),(32,'SAL02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Salto','Salto','Rivera s/n esq. Juan Carlos Gómez',NULL,NULL),(33,'SJO01','Hospital de San José','Hospital público (ASSE)','San José','San José de Mayo','Larrañaga 480',NULL,NULL),(34,'SJO02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','San José','San José de Mayo','Bengoa 651 esq. Artigas',NULL,NULL),(35,'SOR01','Hospital de Mercedes','Hospital público (ASSE)','Soriano','Mercedes','Sánchez esq. Gomensoro',NULL,NULL),(36,'SOR02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Soriano','Mercedes','Wilson Ferreira Aldunate 660',NULL,NULL),(37,'TAC01','Hospital de Tacuarembó','Hospital público (ASSE)','Tacuarembó','Tacuarembó','Treinta y Tres 444',NULL,NULL),(38,'TAC02','Centro Auxiliar Paso de los Toros','Centro auxiliar público (ASSE)','Tacuarembó','Paso de los Toros','Adelaida Puyol s/n',NULL,NULL),(39,'TAC03','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Tacuarembó','Tacuarembó','18 de Julio y Joaquín Suárez',NULL,NULL),(40,'TYT01','Hospital de Treinta y Tres','Hospital público (ASSE)','Treinta y Tres','Treinta y Tres','Manuel Lavalleja 1100',NULL,NULL),(41,'TYT02','Centro Auxiliar Sanitario - Sanidad Policial','Centro sanitario policial','Treinta y Tres','Treinta y Tres','Manuel Lavalleja s/n entre Manuel Oribe y Simón del Pino',NULL,NULL),(42,'MON03','Hospital de Clínicas Dr. Manuel Quintela','Hospital universitario público (Udelar)','Montevideo','Montevideo','Av. Italia 2870',NULL,NULL);

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
