<?php

require_once 'conexion.php';

$que = $_GET['que'];

if ($que == "persona") {
    $rol = $_POST['rol'];

    $vuelve = "Html/Administrativo/usuarios.html";
    $formulario = "Html/Administrativo/registrar.html";

    if (isset($_POST['vuelve'])) {
        $vuelve = $_POST['vuelve'];
        $formulario = $_POST['formulario'];
    }

    if ($rol != "paciente") {
        $token = $_POST['token'];

        if (contar("clave_acceso", "codigo = '$token'") == 0) {
            header("Location: $formulario?error=token");
            exit;
        }
    }

    $nombre    = $_POST['nombre'];
    $apellido  = $_POST['apellido'];
    $cedula    = $_POST['cedula'];
    $correo    = $_POST['correo'];
    $direccion = $_POST['direccion'];

    $ya = $db->query("SELECT id_persona FROM persona WHERE cedula = '$cedula'")->fetch_assoc();

    if ($rol != "paciente") {
        $deOtro = "usuario = '" . $_POST['usuario'] . "'";

        if ($ya) {
            $deOtro = $deOtro . " AND id_persona <> " . $ya['id_persona'];
        }

        if (contar("usuario", $deOtro) > 0) {
            header("Location: $formulario?error=usuario");
            exit;
        }
    }

    if ($ya) {
        $idPersona = $ya['id_persona'];

        $db->query("UPDATE persona
                    SET nombre = '$nombre', apellido = '$apellido',
                        correo = '$correo', direccion = '$direccion'
                    WHERE id_persona = $idPersona");

    } else {
        if (contar("persona", "correo = '$correo'") > 0) {
            header("Location: $formulario?error=correo");
            exit;
        }

        $db->query("INSERT INTO persona (nombre, apellido, cedula, correo, direccion)
                    VALUES ('$nombre', '$apellido', '$cedula', '$correo', '$direccion')");

        $idPersona = $db->insert_id;
    }

    if ($rol == "paciente") {
        if (contar("paciente", "id_persona = $idPersona") == 0) {
            $db->query("INSERT INTO paciente (id_persona) VALUES ($idPersona)");
        }

    } else {
        $usuario    = $_POST['usuario'];
        $contrasena = $_POST['contrasena'];

        if (contar("funcionario", "id_persona = $idPersona AND tipo_funcion = '$rol'") == 0) {
            $db->query("INSERT INTO funcionario (id_persona, tipo_funcion)
                        VALUES ($idPersona, '$rol')");
        }

        if (contar("usuario", "id_persona = $idPersona") == 0) {
            $db->query("INSERT INTO usuario (id_persona, usuario, contrasena)
                        VALUES ($idPersona, '$usuario', SHA2('$contrasena', 256))");
        }
    }

    header("Location: $vuelve");

} else if ($que == "ambulancia") {
    $matricula = $_POST['matricula'];
    $movil     = $_POST['movil'];

    if (contar("ambulancia", "matricula = '$matricula'") > 0) {
        header("Location: Html/Administrativo/ambulancias.html?error=matricula");
        exit;
    }

    $db->query("INSERT INTO ambulancia (matricula, movil)
                VALUES ('$matricula', '$movil')");

    header("Location: Html/Administrativo/ambulancias.html");
}
