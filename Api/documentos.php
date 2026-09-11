<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

if ($tipo == "contadores") {
    responder(array(
        'pacientes'  => contar("paciente"),
        'documentos' => contar("documento"),
        'encuestas'  => contar("encuesta")
    ));
}

responder(array());
