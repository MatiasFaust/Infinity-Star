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
    $codigo = trim($_POST['codigo']);

    $tipoToken = "registro";

    if (isset($_POST["tipo"]) && $_POST["tipo"] == "eliminar") {
        $tipoToken = "eliminar";
    }

    if ($codigo == "") {
        header("Location: $vuelve?error=sinCodigo");
        exit;
    }

    $id = "";

    if (isset($_POST['id'])) {
        $id = $_POST['id'];
    }

    $repetido = "codigo = '$codigo'";

    if ($id != "") {
        $repetido = $repetido . " AND id_clave <> $id";
    }

    if (contar("clave_acceso", $repetido) > 0) {
        header("Location: $vuelve?error=tokenRepetido");
        exit;
    }

    if ($id == "") {
        $db->query("INSERT INTO clave_acceso (codigo, tipo) VALUES ('$codigo', '$tipoToken')");
        anotar($yo, "Creó el token de acceso " . $codigo);

    } else {
        $db->query("UPDATE clave_acceso SET codigo = '$codigo' WHERE id_clave = $id");
        anotar($yo, "Cambió un token de acceso a " . $codigo);
    }

    header("Location: $vuelve?guardado=si");
    exit;
}

if ($accion == "borrarToken") {
    $id = $_POST['id'];

    if (contar("clave_acceso", "") <= 1) {
        header("Location: $vuelve?error=ultimoToken");
        exit;
    }

    $clave = $db->query("SELECT codigo FROM clave_acceso WHERE id_clave = $id")->fetch_assoc();

    $db->query("DELETE FROM clave_acceso WHERE id_clave = $id");

    if ($clave) {
        anotar($yo, "Borró el token de acceso " . $clave['codigo']);
    }

    header("Location: $vuelve?borrada=si");
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
