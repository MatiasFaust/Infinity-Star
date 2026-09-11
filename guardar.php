<?php

require_once 'conexion.php';

$que = $_GET['que'];

if ($que == "persona") {

    $rol = $_POST['rol'];

    // el registro publico manda a donde volver; desde el panel se vuelve a usuarios
    $vuelve   = isset($_POST['vuelve']) ? $_POST['vuelve'] : "Html/Administrativo/usuarios.html";
    $formulario = isset($_POST['formulario']) ? $_POST['formulario'] : "Html/Administrativo/registrar.html";

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

    // Una misma persona puede tener varios roles, pero se guarda una sola vez.
    // Si la cedula ya esta cargada reusamos esa persona en vez de crear otra.

    $ya = $db->query("SELECT id_persona FROM persona WHERE cedula = '$cedula'")->fetch_assoc();

    if ($ya) {

        $idPersona = $ya['id_persona'];

        $db->query("UPDATE persona
                    SET nombre = '$nombre', apellido = '$apellido',
                        correo = '$correo', direccion = '$direccion'
                    WHERE id_persona = $idPersona");

    } else {

        // el correo tambien es unico: si ya lo tiene otra persona, avisamos
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

        // la cuenta es de la persona, no del rol: una sola aunque tenga dos roles
        if (contar("usuario", "id_persona = $idPersona") == 0) {
            $db->query("INSERT INTO usuario (id_persona, usuario, contrasena)
                        VALUES ($idPersona, '$usuario', SHA2('$contrasena', 256))");
        }
    }

    header("Location: $vuelve");

} else if ($que == "ambulancia") {

    $matricula = $_POST['matricula'];
    $movil     = $_POST['movil'];

    $db->query("INSERT INTO ambulancia (matricula, movil)
                VALUES ('$matricula', '$movil')");

    header("Location: Html/Administrativo/ambulancias.html");
}
