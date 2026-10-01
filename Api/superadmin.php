<?php

session_start();

require_once '../conexion.php';

if (!esSuperadmin()) {
    responder(array('permiso' => 0));
}

$tipo = $_GET['tipo'];

if ($tipo == "tokens") {
    responder(comoLista($db->query("SELECT id_token AS idToken, accion, codigo
                                    FROM token ORDER BY id_token")));
}

if ($tipo == "tokensViejos") {
    responder(comoLista($db->query("SELECT id_clave AS idClave, codigo, tipo
                                    FROM clave_acceso
                                    ORDER BY tipo, id_clave")));
}

if ($tipo == "funcionarios") {
    responder(comoLista($db->query("SELECT persona.id_persona   AS idPersona,
                                           persona.nombre, persona.apellido, persona.cedula,
                                           usuario.usuario, usuario.suspendido,
                                           GROUP_CONCAT(funcionario.tipo_funcion ORDER BY funcionario.tipo_funcion SEPARATOR ', ') AS roles,
                                           (SELECT COUNT(*) FROM actividad
                                            WHERE actividad.id_persona = persona.id_persona) AS movimientos,
                                           (SELECT MAX(momento) FROM actividad
                                            WHERE actividad.id_persona = persona.id_persona) AS ultimoMomento
                                    FROM funcionario
                                    JOIN persona ON persona.id_persona = funcionario.id_persona
                                    LEFT JOIN usuario ON usuario.id_persona = persona.id_persona
                                    GROUP BY persona.id_persona
                                    ORDER BY persona.apellido")));
}

if ($tipo == "actividad") {
    $donde = "";

    if (isset($_GET['id']) && $_GET['id'] != "") {
        $id = $_GET['id'];
        $donde = "WHERE actividad.id_persona = $id";
    }

    responder(comoLista($db->query("SELECT actividad.accion, actividad.momento,
                                           persona.nombre, persona.apellido
                                    FROM actividad
                                    LEFT JOIN persona ON persona.id_persona = actividad.id_persona
                                    $donde
                                    ORDER BY actividad.id_actividad DESC
                                    LIMIT 200")));
}

responder(array());
