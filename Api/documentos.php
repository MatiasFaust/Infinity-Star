<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

if ($tipo == "contadores") {
    responder(array(
        'pacientes'  => contar("paciente")
    ));
}

responder(array());
