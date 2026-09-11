<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

$columnas = "persona.id_persona AS idPersona, persona.nombre, persona.apellido,
             persona.cedula, persona.correo, persona.direccion,
             usuario.usuario";

$cuenta = "LEFT JOIN usuario ON usuario.id_persona = persona.id_persona";

if ($tipo == "uno") {
    $id = $_GET['id'];

    $fila = $db->query("SELECT $columnas FROM persona $cuenta
                        WHERE persona.id_persona = $id")->fetch_assoc();

    $roles = array();

    if (contar("paciente", "id_persona = $id") > 0) {
        $roles[] = "paciente";
    }

    $funciones = $db->query("SELECT tipo_funcion FROM funcionario WHERE id_persona = $id");

    while ($funcion = $funciones->fetch_assoc()) {
        $roles[] = $funcion['tipo_funcion'];
    }

    sort($roles);

    $fila['rol'] = implode(", ", $roles);

    responder($fila);
}

$rol = "";

if (isset($_GET['rol'])) {
    $rol = $_GET['rol'];
}

if ($rol == "paciente") {
    $tablas = "FROM paciente JOIN persona ON persona.id_persona = paciente.id_persona $cuenta";

} else if ($rol != "") {
    $tablas = "FROM funcionario JOIN persona ON persona.id_persona = funcionario.id_persona $cuenta
               WHERE funcionario.tipo_funcion = '$rol'";

} else {
    $tablas = "FROM persona $cuenta";
}

responder(comoLista($db->query("SELECT $columnas $tablas ORDER BY persona.apellido")));
