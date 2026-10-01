<?php

require_once 'conexion.php';

session_start();

$yo = 0;

if (isset($_SESSION['id_persona'])) {
    $yo = $_SESSION['id_persona'];
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$que = $_GET['que'];
$id  = $_POST['id'];

$tokenBorrado = "";

if (isset($_POST['tokenBorrado'])) {
    $tokenBorrado = trim($_POST['tokenBorrado']);
}

if ($que == "persona" || $que == "docPaciente" || $que == "ambulancia") {
    if (contar("clave_acceso", "codigo = '$tokenBorrado' AND tipo = 'eliminar'") == 0) {
        $vuelve = "usuarios.html";

        if (isset($_POST['vuelve'])) {
            $vuelve = $_POST['vuelve'];
        }

        if ($que == "docPaciente") {
            $vuelve = "documentosPaciente.html";
        }

        if ($que == "ambulancia") {
            $vuelve = "ambulancias.html";
        }

        header("Location: Html/Administrativo/" . $vuelve . "?error=tokenBorrado");
        exit;
    }
}

if ($que == "persona") {
    $rol = "";

    if (isset($_POST['rol'])) {
        $rol = $_POST['rol'];
    }

    if ($rol == "" || $rol == "paciente") {
        $paciente = $db->query("SELECT id_paciente FROM paciente WHERE id_persona = $id")->fetch_assoc();

        if ($paciente) {
            $idPaciente = $paciente['id_paciente'];

            $db->query("DELETE FROM documento WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM paciente_traslado_acompania WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM encuesta_paciente_entra WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM respuesta WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM funcionario_paciente_lleva WHERE id_paciente = $idPaciente");
            $db->query("UPDATE traslado SET id_paciente = NULL WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM paciente WHERE id_paciente = $idPaciente");
        }
    }

    if ($rol != "paciente") {
        $sql = "SELECT id_funcionario FROM funcionario WHERE id_persona = $id";

        if ($rol != "") {
            $sql = $sql . " AND tipo_funcion = '$rol'";
        }

        $funcionarios = $db->query($sql);

        while ($fila = $funcionarios->fetch_assoc()) {
            $idFuncionario = $fila['id_funcionario'];

            $db->query("DELETE FROM funcionario_traslado_maneja WHERE id_funcionario = $idFuncionario");
            $db->query("DELETE FROM funcionario_traslado_administra WHERE id_funcionario = $idFuncionario");
            $db->query("DELETE FROM funcionario_paciente_lleva WHERE id_funcionario = $idFuncionario");
            $db->query("UPDATE documento SET id_funcionario = NULL WHERE id_funcionario = $idFuncionario");
            $db->query("DELETE FROM funcionario WHERE id_funcionario = $idFuncionario");
        }
    }

    if (contar("paciente", "id_persona = $id") + contar("funcionario", "id_persona = $id") == 0) {
        $db->query("DELETE FROM usuario WHERE id_persona = $id");
        $db->query("DELETE FROM persona WHERE id_persona = $id");
    }

    $vuelve = $_POST['vuelve'];


} else if ($que == "ambulancia") {
    if (contar("traslado", "id_ambulancia = $id") > 0) {
        header("Location: Html/Administrativo/ambulancias.html?error=usada");
        exit;
    }

    $db->query("DELETE FROM ambulancia WHERE id_ambulancia = $id");

    $vuelve = "ambulancias.html?borrada=si";

} else if ($que == "documento") {
    $doc = $db->query("SELECT archivo FROM documento
                       WHERE id_documento = $id AND categoria_tipo = 'pdf'")->fetch_assoc();

    if ($doc && $doc['archivo'] != "") {
        $ruta = "Archivos/" . $doc['archivo'];

        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }

    $db->query("DELETE FROM qr WHERE id_documento = $id");
    $db->query("DELETE FROM documento WHERE id_documento = $id");

    $vuelve = "documentosQr.html?borrada=si";

} else if ($que == "docPaciente") {
    $doc = $db->query("SELECT archivo FROM documento
                       WHERE id_documento = $id AND categoria_tipo = 'paciente'")->fetch_assoc();

    if ($doc && $doc['archivo'] != "") {
        $ruta = "Archivos/" . $doc['archivo'];

        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }

    $db->query("DELETE FROM documento WHERE id_documento = $id");

    $vuelve = "documentosPaciente.html?borrada=si";

} else {
    $vuelve = "usuarios.html";
}

anotar($yo, "Eliminó un registro (" . $que . ")");

header("Location: Html/Administrativo/$vuelve");
