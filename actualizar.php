<?php

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$que = $_GET['que'];
$id  = $_POST['id'];

if ($que == "persona") {
    $nombre    = $_POST['nombre'];
    $apellido  = $_POST['apellido'];
    $cedula    = $_POST['cedula'];
    $correo    = $_POST['correo'];
    $direccion = $_POST['direccion'];

    if (contar("persona", "cedula = '$cedula' AND id_persona <> $id") > 0) {
        header("Location: Html/Administrativo/editarUsuario.html?id=$id&error=cedula");
        exit;
    }

    if (contar("persona", "correo = '$correo' AND id_persona <> $id") > 0) {
        header("Location: Html/Administrativo/editarUsuario.html?id=$id&error=correo");
        exit;
    }

    $db->query("UPDATE persona
                SET nombre = '$nombre', apellido = '$apellido', cedula = '$cedula',
                    correo = '$correo', direccion = '$direccion'
                WHERE id_persona = $id");

    header("Location: Html/Administrativo/usuarios.html");

} else if ($que == "ambulancia") {
    $matricula = $_POST['matricula'];
    $movil     = $_POST['movil'];

    if (contar("ambulancia", "matricula = '$matricula' AND id_ambulancia <> $id") > 0) {
        header("Location: Html/Administrativo/editarAmbulancia.html?id=$id&error=matricula");
        exit;
    }

    $db->query("UPDATE ambulancia
                SET matricula = '$matricula', movil = '$movil'
                WHERE id_ambulancia = $id");

    header("Location: Html/Administrativo/ambulancias.html");
}
