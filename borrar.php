<?php

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$que = $_GET['que'];
$id  = $_POST['id'];

if ($que == "persona") {
    $rol = isset($_POST['rol']) ? $_POST['rol'] : "";

    if ($rol == "" || $rol == "paciente") {
        $paciente = $db->query("SELECT id_paciente FROM paciente WHERE id_persona = $id")->fetch_assoc();

        if ($paciente) {
            $idPaciente = $paciente['id_paciente'];

            $db->query("DELETE FROM documento WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM paciente_traslado_acompania WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM encuesta_paciente_entra WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM funcionario_paciente_lleva WHERE id_paciente = $idPaciente");
            $db->query("UPDATE traslado SET id_paciente = NULL WHERE id_paciente = $idPaciente");
            $db->query("DELETE FROM paciente WHERE id_paciente = $idPaciente");
        }
    }

    if ($rol != "paciente") {
        $soloEse = $rol == "" ? "" : "AND tipo_funcion = '$rol'";

        $funcionarios = $db->query("SELECT id_funcionario FROM funcionario
                                    WHERE id_persona = $id $soloEse");

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

} else if ($que == "traslado") {
    $db->query("DELETE FROM funcionario_traslado_maneja WHERE id_traslado = $id");
    $db->query("DELETE FROM traslado WHERE id_traslado = $id");

    $vuelve = "verTraslados.html";

} else if ($que == "ambulancia") {
    if (contar("traslado", "id_ambulancia = $id") > 0) {
        header("Location: Html/Administrativo/ambulancias.html?error=usada");
        exit;
    }

    $db->query("DELETE FROM ambulancia WHERE id_ambulancia = $id");

    $vuelve = "ambulancias.html?borrada=si";

} else {
    $vuelve = "usuarios.html";
}

header("Location: Html/Administrativo/$vuelve");
