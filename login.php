<?php

session_start();

require_once 'conexion.php';

$usuario    = $_POST['usuario'];
$contrasena = $_POST['contrasena'];

$cuenta = $db->query("SELECT id_persona, suspendido FROM usuario
                      WHERE usuario = '$usuario'
                      AND contrasena = SHA2('$contrasena', 256)");

// Volvemos al login con el aviso, en vez de dejar una pantalla en blanco.
if ($cuenta->num_rows == 0) {
    header("Location: Index.html?error=entrar");
    exit;
}

$fila = $cuenta->fetch_assoc();

if ($fila['suspendido'] == 1) {
    header("Location: Index.html?error=suspendido");
    exit;
}

$idPersona = $fila['id_persona'];

$_SESSION['id_persona'] = $idPersona;

anotar($idPersona, "Inició sesión");

if (contar("funcionario", "id_persona = $idPersona AND tipo_funcion = 'superadmin'") > 0) {
    header("Location: Html/Administrativo/superadmin.html");

} else if (contar("funcionario", "id_persona = $idPersona AND tipo_funcion = 'administrativo'") > 0) {
    header("Location: Html/Modulos.html");

} else {
    header("Location: Html/Administrativo/Chofer.html");
}
