<?php

require_once 'conexion.php';
require_once 'correo.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$correo = trim($_POST['correo']);

// Buscamos solo funcionarios y choferes, los pacientes no tienen cuenta.
$persona = $db->query("SELECT persona.id_persona, persona.nombre, usuario.usuario
                       FROM persona
                       JOIN usuario ON usuario.id_persona = persona.id_persona
                       JOIN funcionario ON funcionario.id_persona = persona.id_persona
                       WHERE persona.correo = '$correo'
                       LIMIT 1")->fetch_assoc();

// Siempre contestamos lo mismo, asi nadie puede averiguar que correos existen.
if (!$persona) {
    header("Location: olvide.html?enviado=si");
    exit;
}

$idPersona = $persona['id_persona'];
$codigo    = md5(uniqid(rand(), true));

$db->query("INSERT INTO recuperacion (id_persona, codigo, momento)
            VALUES ($idPersona, '$codigo', NOW())");

$enlace = direccionPublica() . "/nuevaClave.html?codigo=" . $codigo;

$mensaje = "<p>Hola " . $persona['nombre'] . ",</p>";
$mensaje .= "<p>Tu usuario para entrar al sistema es: <b>" . $persona['usuario'] . "</b></p>";
$mensaje .= "<p>Si tambien olvidaste tu contrase&ntilde;a, pod&eacute;s poner una nueva desde este enlace:</p>";
$mensaje .= "<p><a href='" . $enlace . "'>" . $enlace . "</a></p>";
$mensaje .= "<p>El enlace sirve una sola vez y vence en 2 horas.</p>";
$mensaje .= "<p>Si no pediste esto, ignora este correo.</p>";
$mensaje .= "<p>Hospital de Cl&iacute;nicas Montevideo</p>";

mandarCorreo($correo, "Tu usuario del Hospital de Clinicas", $mensaje);

anotar($idPersona, "Pidió recuperar su usuario");

header("Location: olvide.html?enviado=si");
