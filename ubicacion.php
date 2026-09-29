<?php

require_once 'conexion.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array('ok' => 0, 'motivo' => 'metodo'));
    exit;
}

if (!isset($_SESSION['id_persona'])) {
    echo json_encode(array('ok' => 0, 'motivo' => 'sesion'));
    exit;
}

$id      = $_POST['id'];
$latitud = $_POST['latitud'];
$longitud = $_POST['longitud'];
$quien   = $_SESSION['id_persona'];

if ($latitud == "" || $longitud == "") {
    echo json_encode(array('ok' => 0, 'motivo' => 'sinCoordenadas'));
    exit;
}

$mio = contar("funcionario_traslado_maneja
               JOIN funcionario ON funcionario.id_funcionario = funcionario_traslado_maneja.id_funcionario",
              "funcionario_traslado_maneja.id_traslado = $id AND funcionario.id_persona = $quien");

if ($mio == 0) {
    echo json_encode(array('ok' => 0, 'motivo' => 'noEsTuyo'));
    exit;
}

$db->query("INSERT INTO posicion (id_traslado, latitud, longitud, momento)
            VALUES ($id, $latitud, $longitud, NOW())");

echo json_encode(array('ok' => 1, 'momento' => date('d/m/Y H:i')));
