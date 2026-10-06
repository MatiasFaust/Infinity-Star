<?php

session_start();

require_once 'conexion.php';

$vuelve = "Html/Administrativo/superadmin.html";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

if (!esSuperadmin()) {
    header("Location: Index.html");
    exit;
}

$yo     = $_SESSION['id_persona'];
$accion = $_POST['accion'];

if ($accion == "guardarToken") {
    $id     = $_POST['id'];
    $codigo = trim($_POST['codigo']);

    if ($codigo == "") {
        header("Location: $vuelve?error=sinCodigo");
        exit;
    }

    if (contar("token", "codigo = '$codigo' AND id_token <> $id") > 0) {
        header("Location: $vuelve?error=tokenRepetido");
        exit;
    }

    $cual = $db->query("SELECT accion FROM token WHERE id_token = $id")->fetch_assoc();

    $db->query("UPDATE token SET codigo = '$codigo' WHERE id_token = $id");

    if ($cual) {
        anotar($yo, "Cambió el token de " . $cual['accion']);
    }

    header("Location: $vuelve?guardado=si");
    exit;
}


$id = $_POST['id'];

if ($id == $yo) {
    header("Location: $vuelve?error=vosMismo");
    exit;
}

$quien = $db->query("SELECT nombre, apellido FROM persona WHERE id_persona = $id")->fetch_assoc();
$nombre = "";

if ($quien) {
    $nombre = $quien['nombre'] . " " . $quien['apellido'];
}

if ($accion == "ponerClave") {
    $nueva = $_POST['nueva'];

    if (strlen($nueva) < 8) {
        header("Location: $vuelve?error=claveCorta");
        exit;
    }

    $db->query("UPDATE usuario SET contrasena = SHA2('$nueva', 256)
                WHERE id_persona = $id");

    anotar($yo, "Le puso una contraseña nueva a " . $nombre);

    header("Location: $vuelve?guardado=si");
    exit;
}

if ($accion == "suspender") {
    $valor = $_POST['valor'];

    $db->query("UPDATE usuario SET suspendido = $valor WHERE id_persona = $id");

    if ($valor == 1) {
        anotar($yo, "Suspendió a " . $nombre);
    } else {
        anotar($yo, "Reactivó a " . $nombre);
    }

    header("Location: $vuelve?guardado=si");
    exit;
}

if ($accion == "eliminar") {
    $funcionarios = $db->query("SELECT id_funcionario FROM funcionario WHERE id_persona = $id");

    while ($fila = $funcionarios->fetch_assoc()) {
        $idFuncionario = $fila['id_funcionario'];

        $db->query("DELETE FROM funcionario_traslado_maneja WHERE id_funcionario = $idFuncionario");
        $db->query("DELETE FROM funcionario_traslado_administra WHERE id_funcionario = $idFuncionario");
        $db->query("DELETE FROM funcionario_paciente_lleva WHERE id_funcionario = $idFuncionario");
        $db->query("UPDATE documento SET id_funcionario = NULL WHERE id_funcionario = $idFuncionario");
        $db->query("DELETE FROM funcionario WHERE id_funcionario = $idFuncionario");
    }

    $db->query("DELETE FROM usuario WHERE id_persona = $id");
    $db->query("UPDATE actividad SET id_persona = NULL WHERE id_persona = $id");

    if (contar("paciente", "id_persona = $id") == 0) {
        $db->query("DELETE FROM persona WHERE id_persona = $id");
    }

    anotar($yo, "Eliminó a " . $nombre);

    header("Location: $vuelve?borrada=si");
    exit;
}

header("Location: $vuelve");
