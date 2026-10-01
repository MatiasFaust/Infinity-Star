<?php

require_once 'conexion.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$vuelve = "Html/Administrativo/Chofer.html";

if (!isset($_SESSION['id_persona'])) {
    header("Location: Index.html");
    exit;
}

$id     = $_POST['id'];
$accion = $_POST['accion'];
$quien  = $_SESSION['id_persona'];

$mio = contar("funcionario_traslado_maneja
               JOIN funcionario ON funcionario.id_funcionario = funcionario_traslado_maneja.id_funcionario",
              "funcionario_traslado_maneja.id_traslado = $id AND funcionario.id_persona = $quien");

if ($mio == 0) {
    header("Location: $vuelve?error=noEsTuyo");
    exit;
}

$queHizo = "";

if ($accion == "confirmar") {
    $db->query("UPDATE traslado SET estado = 'Confirmado'
                WHERE id_traslado = $id AND estado = 'Pendiente'");

} else if ($accion == "iniciar") {
    $db->query("UPDATE traslado
                SET estado = 'En curso',
                    tiempo_salida = NOW(),
                    tiempo_llegada = DATE_ADD(NOW(), INTERVAL IFNULL(minutos_estimados, 0) MINUTE)
                WHERE id_traslado = $id AND estado = 'Confirmado'");

} else if ($accion == "llegue") {
    $db->query("UPDATE traslado
                SET estado = 'En retorno', llegada_real = NOW()
                WHERE id_traslado = $id AND estado = 'En curso'");

} else if ($accion == "finalizar") {
    $db->query("UPDATE traslado
                SET estado = 'Finalizado'
                WHERE id_traslado = $id AND estado = 'En retorno'");
}

if ($accion == "confirmar") {
    $queHizo = "Confirmó el traslado " . $id;

} else if ($accion == "iniciar") {
    $queHizo = "Salió con el traslado " . $id;

} else if ($accion == "llegue") {
    $queHizo = "Llegó al destino del traslado " . $id;

} else if ($accion == "finalizar") {
    $queHizo = "Volvió al hospital con el traslado " . $id;
}

if ($queHizo != "") {
    anotar($_SESSION['id_persona'], $queHizo);
}

header("Location: $vuelve?guardado=si");
