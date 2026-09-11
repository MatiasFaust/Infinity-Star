<?php

session_start();

require_once 'conexion.php';

$usuario    = $_POST['usuario'];
$contrasena = $_POST['contrasena'];

$cuenta = $db->query("SELECT id_persona FROM usuario
                      WHERE usuario = '$usuario'
                      AND contrasena = SHA2('$contrasena', 256)");

if ($cuenta->num_rows == 0) {
    echo "Usuario o contraseña incorrectos";
    exit;
}

$idPersona = $cuenta->fetch_assoc()['id_persona'];

$_SESSION['id_persona'] = $idPersona;

if (contar("funcionario", "id_persona = $idPersona AND tipo_funcion = 'administrativo'") > 0) {
    header("Location: Html/Modulos.html");
} else {
    header("Location: Html/Administrativo/Chofer.html");
}
