<?php

require_once 'conexion.php';

session_start();

$vuelve = "Html/Administrativo/miClave.html";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

if (!isset($_SESSION['id_persona'])) {
    header("Location: Index.html");
    exit;
}

$yo      = $_SESSION['id_persona'];
$actual  = $_POST['actual'];
$nueva   = $_POST['nueva'];
$repetir = $_POST['repetir'];

if (strlen($nueva) < 8) {
    header("Location: $vuelve?error=claveCorta");
    exit;
}

if ($nueva != $repetir) {
    header("Location: $vuelve?error=noCoinciden");
    exit;
}

$bien = contar("usuario", "id_persona = $yo AND contrasena = SHA2('$actual', 256)");

if ($bien == 0) {
    header("Location: $vuelve?error=claveActual");
    exit;
}

$db->query("UPDATE usuario SET contrasena = SHA2('$nueva', 256)
            WHERE id_persona = $yo");

anotar($yo, "Cambió su contraseña");

header("Location: $vuelve?guardado=si");
