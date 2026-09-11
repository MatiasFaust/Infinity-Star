<?php

require_once 'config.php';

$db = new mysqli(BDhost, BDuser, BDpass, BDnombre);

function comoLista($resultado) {
    $datos = array();

    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    return $datos;
}

function contar($tabla, $condicion = "") {
    global $db;

    $sql = "SELECT COUNT(*) AS cuantos FROM $tabla";

    if ($condicion != "") {
        $sql = $sql . " WHERE " . $condicion;
    }

    $fila = $db->query($sql)->fetch_assoc();

    return $fila['cuantos'];
}

function responder($datos) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
