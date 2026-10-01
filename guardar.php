<?php

require_once 'conexion.php';

session_start();

$yo = 0;

if (isset($_SESSION['id_persona'])) {
    $yo = $_SESSION['id_persona'];
}

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
    $telefono  = $_POST['telefono'];

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
                        correo = '$correo', direccion = '$direccion', telefono = '$telefono'
                    WHERE id_persona = $idPersona");

    } else {
        if (contar("persona", "correo = '$correo'") > 0) {
            header("Location: $formulario?error=correo");
            exit;
        }

        $db->query("INSERT INTO persona (nombre, apellido, cedula, correo, direccion, telefono)
                    VALUES ('$nombre', '$apellido', '$cedula', '$correo', '$direccion', '$telefono')");

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

    anotar($yo, "Registró o editó a " . $nombre . " " . $apellido . " (" . $rol . ")");

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

    anotar($yo, "Agregó la ambulancia " . $matricula);

    header("Location: Html/Administrativo/ambulancias.html");
}

if ($que == "traslado") {

    $vuelve = "Html/Administrativo/registrarTraslado.html";

    $origen     = $_POST['origen'];
    $destino    = $_POST['destino'];
    $origenLat  = $_POST['origenLat'];
    $origenLng  = $_POST['origenLng'];
    $destinoLat = $_POST['destinoLat'];
    $destinoLng = $_POST['destinoLng'];
    $minutos    = $_POST['minutos'];
    $ambulancia = $_POST['ambulancia'];
    $chofer     = $_POST['chofer'];
    $lleva      = $_POST['lleva'];

    $copilotoNombre   = $_POST['copilotoNombre'];
    $copilotoApellido = $_POST['copilotoApellido'];
    $copilotoCedula   = $_POST['copilotoCedula'];

    if ($origenLat == "" || $destinoLat == "") {
        header("Location: $vuelve?error=sinMarcar");
        exit;
    }

    if ($origenLat == $destinoLat && $origenLng == $destinoLng) {
        header("Location: $vuelve?error=mismaRuta");
        exit;
    }

    if ($minutos == "") {
        $minutos = "NULL";
    }

    $paciente    = "NULL";
    $tipo        = "";
    $descripcion = "";

    if ($lleva == "paciente") {
        $paciente = $_POST['paciente'];

        if ($paciente == "") {
            header("Location: $vuelve?error=sinPaciente");
            exit;
        }

    } else {
        $tipo        = $_POST['tipoElemento'];
        $descripcion = $_POST['descripcionElemento'];

        if ($tipo == "") {
            header("Location: $vuelve?error=sinElemento");
            exit;
        }
    }

    $misma = "origen = '$origen' AND destino = '$destino' AND id_ambulancia = $ambulancia";
    $ya    = $db->query("SELECT id_ruta FROM ruta WHERE $misma")->fetch_assoc();

    if ($ya) {
        $idRuta = $ya['id_ruta'];

    } else {
        $db->query("INSERT INTO ruta (origen, destino, id_ambulancia,
                                      origen_lat, origen_lng, destino_lat, destino_lng)
                    VALUES ('$origen', '$destino', $ambulancia,
                            $origenLat, $origenLng, $destinoLat, $destinoLng)");

        $idRuta = $db->insert_id;
    }

    $db->query("INSERT INTO traslado (punto_origen, destino, tipo_elemento, descripcion_elemento,
                                      id_paciente, id_ambulancia, id_ruta, estado, minutos_estimados,
                                      copiloto_nombre, copiloto_apellido, copiloto_cedula)
                VALUES ('$origen', '$destino', '$tipo', '$descripcion',
                        $paciente, $ambulancia, $idRuta, 'Pendiente', $minutos,
                        '$copilotoNombre', '$copilotoApellido', '$copilotoCedula')");

    $idTraslado = $db->insert_id;

    $db->query("INSERT INTO funcionario_traslado_maneja (id_funcionario, id_traslado)
                VALUES ($chofer, $idTraslado)");

    if (isset($_SESSION['id_persona'])) {
        $quien = $_SESSION['id_persona'];

        $admin = $db->query("SELECT id_funcionario FROM funcionario
                             WHERE id_persona = $quien AND tipo_funcion = 'administrativo'")->fetch_assoc();

        if ($admin) {
            $db->query("INSERT INTO funcionario_traslado_administra (id_funcionario, id_traslado)
                        VALUES (" . $admin['id_funcionario'] . ", $idTraslado)");
        }
    }

    anotar($yo, "Registró un traslado de " . $origen . " a " . $destino);

    header("Location: $vuelve?guardado=si");
}




