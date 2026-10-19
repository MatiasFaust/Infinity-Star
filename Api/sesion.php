<?php

session_start();

header("Cache-Control: no-store");

$tipo = "";

if (isset($_GET['tipo'])) {
    $tipo = $_GET['tipo'];
}

// Para saber si la persona ya se puso su propia contraseña.
if ($tipo == "clave") {
    require_once '../conexion.php';

    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_SESSION['id_persona'])) {
        echo json_encode(array("clavePropia" => 1));
        exit;
    }

    $yo = $_SESSION['id_persona'];
    $fila = $db->query("SELECT clave_propia FROM usuario WHERE id_persona = $yo")->fetch_assoc();

    $rol = "administrativo";

    if (contar("funcionario", "id_persona = $yo AND tipo_funcion = 'chofer'") > 0) {
        $rol = "chofer";
    }

    echo json_encode(array(
        "clavePropia" => $fila ? (int) $fila['clave_propia'] : 1,
        "rol" => $rol
    ));
    exit;
}

if (isset($_SESSION['id_persona'])) {
    echo "1";
} else {
    echo "0";
}
