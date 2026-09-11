<?php

require_once 'config.php';

$db = new mysqli(BDhost, BDuser, BDpass, BDnombre);


// Funciones que usan varios archivos

// convierte el resultado de una consulta en una lista normal
function comoLista($resultado) {

    $datos = array();

    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    return $datos;
}

// devuelve cuantas filas cumplen una condicion
function contar($tabla, $condicion = "") {

    global $db;

    $donde = $condicion == "" ? "" : "WHERE $condicion";

    return $db->query("SELECT COUNT(*) AS cuantos FROM $tabla $donde")->fetch_assoc()['cuantos'];
}

// manda los datos al JavaScript en formato JSON
function responder($datos) {

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
