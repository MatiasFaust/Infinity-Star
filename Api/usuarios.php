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

    // los roles salen de dos tablas; como puede tener varios, van separados por coma
    $roles = $db->query("SELECT GROUP_CONCAT(rol ORDER BY rol SEPARATOR ', ') AS roles
                         FROM (SELECT 'paciente' AS rol FROM paciente WHERE id_persona = $id
                               UNION ALL
                               SELECT tipo_funcion FROM funcionario WHERE id_persona = $id) AS r");

    $fila['rol'] = $roles->fetch_assoc()['roles'];

    responder($fila);
}

// cada lista sale de su propia tabla de rol,
// asi una persona que es paciente y chofer aparece en las dos

$rol = isset($_GET['rol']) ? $_GET['rol'] : "";

if ($rol == "paciente") {

    $tablas = "FROM paciente JOIN persona ON persona.id_persona = paciente.id_persona $cuenta";

} else if ($rol != "") {

    $tablas = "FROM funcionario JOIN persona ON persona.id_persona = funcionario.id_persona $cuenta
               WHERE funcionario.tipo_funcion = '$rol'";

} else {

    $tablas = "FROM persona $cuenta";
}

responder(comoLista($db->query("SELECT $columnas $tablas ORDER BY persona.apellido")));
