<?php

require_once 'conexion.php';
require_once 'correo.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$correo = trim($_POST['correo']);

// Solo funcionarios y choferes, los pacientes no tienen cuenta.
$persona = $db->query("SELECT persona.id_persona, persona.nombre, usuario.usuario
                       FROM persona
                       JOIN usuario ON usuario.id_persona = persona.id_persona
                       JOIN funcionario ON funcionario.id_persona = persona.id_persona
                       WHERE persona.correo = '$correo'
                       LIMIT 1")->fetch_assoc();

// Siempre contestamos lo mismo, asi nadie averigua que correos existen.
if (!$persona) {
    header("Location: olvide.html?enviado=si");
    exit;
}

$idPersona = $persona['id_persona'];

// Las contrasenas se guardan cifradas y no se pueden leer,
// asi que armamos una nueva y le mandamos esa.
$letras = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
$nueva = "";

for ($i = 0; $i < 8; $i++) {
    $nueva = $nueva . substr($letras, rand(0, strlen($letras) - 1), 1);
}

$db->query("UPDATE usuario SET contrasena = SHA2('$nueva', 256)
            WHERE id_persona = $idPersona");

$mensaje = "<p>Hola " . $persona['nombre'] . ",</p>";
$mensaje .= "<p>Estos son tus datos para entrar al sistema del Hospital de Cl&iacute;nicas:</p>";
$mensaje .= "<p><b>Usuario:</b> " . $persona['usuario'] . "<br>";
$mensaje .= "<b>Contrase&ntilde;a:</b> " . $nueva . "</p>";
$mensaje .= "<p>Por seguridad te generamos una contrase&ntilde;a nueva, porque las contrase&ntilde;as se guardan cifradas y nadie puede verlas, ni siquiera el hospital.</p>";
$mensaje .= "<p>Si no pediste esto, avisale al administrador del sistema.</p>";
$mensaje .= "<p>Hospital de Cl&iacute;nicas Montevideo</p>";

mandarCorreo($correo, "Tu usuario y contrasena del Hospital de Clinicas", $mensaje);

anotar($idPersona, "Pidió recuperar su usuario y se le generó una contraseña nueva");

header("Location: olvide.html?enviado=si");
