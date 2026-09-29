<?php

// Copiá este archivo como config.php y poné los datos que te da el hosting.
// En XAMPP, en tu computadora, los datos son los que están abajo.

define('BDhost', '127.0.0.1');
define('BDpuerto', 3307);
define('BDuser', 'root');
define('BDpass', '');
define('BDnombre', 'hospital');

// Dejalo vacío: el sistema averigua solo la dirección para armar los QR.
// Solo completalo si el hosting usa un dominio distinto al que ves en el navegador.
define('SitioPublico', '');

// Si está completo, los QR apuntan acá en vez de a esta computadora.
define('SitioDocumentos', '');

?>
