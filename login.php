<?php

session_start();

require_once 'conexion.php';

$usuario    = $_POST['usuario'];
$contrasena = $_POST['contrasena'];

$cuenta = $db->query("SELECT id_persona, suspendido FROM usuario
                      WHERE usuario = '$usuario'
                      AND contrasena = SHA2('$contrasena', 256)");

if ($cuenta->num_rows == 0) {
    echo "Usuario o contraseña incorrectos";
    exit;
}

$fila = $cuenta->fetch_assoc();

if ($fila['suspendido'] == 1) {
    echo "Tu usuario está suspendido. Hablá con el administrador del sistema.";
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
