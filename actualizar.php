<?php

require_once 'conexion.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

// Solo los administrativos y el superadmin pueden modificar datos.
if (!esAdministrativo()) {
    header("Location: Index.html");
    exit;
}

$que = "";

if (isset($_GET['que'])) {
    $que = $_GET['que'];
}
$id  = $_POST['id'];

if ($que == "persona") {
    $token = "";

    if (isset($_POST["token"])) {
        $token = $_POST["token"];
    }

    if (!tokenCorrecto("editarPersona", $token)) {
        header("Location: Html/Administrativo/editarUsuario.html?id=" . $id . "&error=token");
        exit;
    }

    $nombre    = $_POST['nombre'];
    $apellido  = $_POST['apellido'];
    $cedula    = $_POST['cedula'];
    $correo    = $_POST['correo'];
    $direccion = $_POST['direccion'];
    $telefono  = $_POST['telefono'];

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
                    correo = '$correo', direccion = '$direccion', telefono = '$telefono'
                WHERE id_persona = $id");

    header("Location: Html/Administrativo/usuarios.html");

} else if ($que == "ambulancia") {
    $token = "";

    if (isset($_POST["token"])) {
        $token = $_POST["token"];
    }

    if (!tokenCorrecto("editarAmbulancia", $token)) {
        header("Location: Html/Administrativo/editarAmbulancia.html?id=" . $_POST["id"] . "&error=token");
        exit;
    }

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

} else if ($que == "traslado") {

    // Corregir un traslado que ya está cargado. El chofer ve los cambios
    // enseguida, porque lee de la misma tabla.

    $vuelve = "Html/Administrativo/verTraslados.html";

    $origen      = $_POST['origen'];
    $destino     = $_POST['destino'];
    $ambulancia  = $_POST['ambulancia'];
    $chofer      = $_POST['chofer'];
    $lleva       = $_POST['lleva'];
    $minutos     = $_POST['minutos'];

    $origenLat  = $_POST['origenLat'];
    $origenLng  = $_POST['origenLng'];
    $destinoLat = $_POST['destinoLat'];
    $destinoLng = $_POST['destinoLng'];

    if ($origenLat == "" || $destinoLat == "") {
        header("Location: Html/Administrativo/registrarTraslado.html?id=$id&error=sinMarcar");
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
            header("Location: Html/Administrativo/registrarTraslado.html?id=$id&error=sinPaciente");
            exit;
        }

    } else {
        $tipo        = $_POST['tipoElemento'];
        $descripcion = $_POST['descripcionElemento'];

        if ($tipo == "") {
            header("Location: Html/Administrativo/registrarTraslado.html?id=$id&error=sinElemento");
            exit;
        }
    }

    // Buscamos la ruta y si no existe la creamos, igual que al registrar.
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

    $db->query("UPDATE traslado
                SET punto_origen = '$origen', destino = '$destino',
                    tipo_elemento = '$tipo', descripcion_elemento = '$descripcion',
                    id_paciente = $paciente, id_ambulancia = $ambulancia,
                    id_ruta = $idRuta, minutos_estimados = $minutos,
                    copiloto_nombre = '" . $_POST['copilotoNombre'] . "',
                    copiloto_apellido = '" . $_POST['copilotoApellido'] . "',
                    copiloto_cedula = '" . $_POST['copilotoCedula'] . "'
                WHERE id_traslado = $id");

    // El chofer puede haber cambiado.
    $db->query("DELETE FROM funcionario_traslado_maneja WHERE id_traslado = $id");
    $db->query("INSERT INTO funcionario_traslado_maneja (id_funcionario, id_traslado)
                VALUES ($chofer, $id)");

    session_start();

    $yo = 0;

    if (isset($_SESSION['id_persona'])) {
        $yo = $_SESSION['id_persona'];
    }

    anotar($yo, "Modificó el traslado " . $id);

    header("Location: $vuelve?guardado=si");
}
