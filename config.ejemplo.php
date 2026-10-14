<?php

// ============================================================
//  PASOS PARA SUBIR LA PAGINA AL SERVIDOR DEL LICEO
// ============================================================
//
//  1) Copiar toda la carpeta Web al servidor (por FTP o como te digan ellos).
//
//  2) Entrar al phpMyAdmin del servidor y crear una base vacia.
//     Despues entrar a esa base, ir a "Importar" y subir el archivo
//     Sql/hospital_completo.sql que esta en el proyecto.
//
//  3) Renombrar este archivo de config.ejemplo.php a config.php
//     (config.php no se sube a GitHub porque tiene las contrasenas).
//
//  4) Completar los datos de abajo con los que te de el profesor.
//
//  5) Darle permiso de escritura a la carpeta Archivos/ (permiso 755),
//     ahi es donde se guardan los PDF que se suben.
//
// ============================================================


// ---- Base de datos ----
// Estos son los datos de XAMPP, los de mi computadora.

define('BDhost', '127.0.0.1');
define('BDpuerto', 3307);
define('BDuser', 'root');
define('BDpass', '');
define('BDnombre', 'hospital');

// Para el servidor del liceo: borro las 5 lineas de arriba y uso estas,
// poniendo lo que me pase el profesor.
//
// define('BDhost', 'localhost');        // casi siempre es localhost
// define('BDpuerto', 3306);             // el puerto normal de MySQL
// define('BDuser', 'usuario_liceo');    // el usuario que me den
// define('BDpass', 'contrasena_liceo'); // la contrasena que me den
// define('BDnombre', 'hospital');       // el nombre de la base que cree


// ---- Direccion de la pagina ----
// En mi computadora van vacias y el sistema se da cuenta solo.
// En el servidor hay que ponerlas, porque son las que se meten
// adentro del QR y del link que le llega al paciente por WhatsApp.
// Si quedan vacias el QR apunta a localhost y desde el celular no abre.

define('SitioPublico', '');
define('SitioDocumentos', '');

// Para el servidor del liceo, por ejemplo:
//
// define('SitioPublico', 'http://servidor.liceo.edu.uy/Web');
// define('SitioDocumentos', 'http://servidor.liceo.edu.uy/Web');
//
// Va sin la barra al final.


// ---- Correo ----
// Poné acá el Gmail que va a enviar y la contraseña de aplicación de 16 letras.
// La contraseña de aplicación la sacás de: myaccount.google.com -> Seguridad -> Contraseñas de aplicaciones
// Va sin espacios. Ejemplo: 'abcdefghijklmnop'

define('CorreoCuenta', '');
define('CorreoClave', '');
define('CorreoNombre', 'Hospital de Clinicas Montevideo');


// ---- Encuesta ----
// Pegá acá el enlace del formulario que creaste en Google Forms.

define('EncuestaEnlace', '');

?>
