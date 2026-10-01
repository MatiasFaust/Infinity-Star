<?php

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$codigo     = $_POST['codigo'];
$contrasena = $_POST['contrasena'];

if (strlen($contrasena) < 8) {
    header("Location: nuevaClave.html?codigo=$codigo&error=claveCorta");
    exit;
}

$pedido = $db->query("SELECT id_recuperacion, id_persona
                      FROM recuperacion
                      WHERE codigo = '$codigo'
                      AND usado = 0
                      AND momento > DATE_SUB(NOW(), INTERVAL 2 HOUR)")->fetch_assoc();

if (!$pedido) {
    header("Location: nuevaClave.html?error=enlaceVencido");
    exit;
}

$idPersona = $pedido['id_persona'];

$db->query("UPDATE usuario SET contrasena = SHA2('$contrasena', 256)
            WHERE id_persona = $idPersona");

$db->query("UPDATE recuperacion SET usado = 1
            WHERE id_recuperacion = " . $pedido['id_recuperacion']);

anotar($idPersona, "Cambió su contraseña desde el enlace de recuperación");

header("Location: Index.html?clave=cambiada");
