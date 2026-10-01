<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];


$ambulancias = "SELECT id_ambulancia AS idAmbulancia, matricula, movil FROM ambulancia";

$rutas = "SELECT ruta.id_ruta AS idRuta, ruta.origen, ruta.destino,
                 ruta.origen_lat AS origenLat, ruta.origen_lng AS origenLng,
                 ruta.destino_lat AS destinoLat, ruta.destino_lng AS destinoLng,
                 ambulancia.id_ambulancia AS idAmbulancia,
                 ambulancia.matricula, ambulancia.movil
          FROM ruta
          JOIN ambulancia ON ambulancia.id_ambulancia = ruta.id_ambulancia";

if ($tipo == "contadores") {
    responder(array(

        'ambulancias' => contar("ambulancia"),
        'traslados'   => contar("traslado"),
        'pendientes'  => contar("traslado", "estado = 'Pendiente'"),
        'confirmados' => contar("traslado", "estado = 'Confirmado'"),
        'curso'       => contar("traslado", "estado = 'En curso'"),
        'retorno'     => contar("traslado", "estado = 'En retorno'"),
        'finalizados' => contar("traslado", "estado = 'Finalizado'")
    ));
}

if ($tipo == "ambulancias") {
    responder(comoLista($db->query("$ambulancias ORDER BY matricula")));
}

if ($tipo == "ambulancia") {
    $id = $_GET['id'];
    responder($db->query("$ambulancias WHERE id_ambulancia = $id")->fetch_assoc());
}

if ($tipo == "rutas") {
    responder(comoLista($db->query("$rutas ORDER BY ruta.origen, ruta.destino")));
}


if ($tipo == "ruta") {
    $id = $_GET['id'];
    responder($db->query("$rutas WHERE ruta.id_ruta = $id")->fetch_assoc());
}

if ($tipo == "choferes") {
    responder(comoLista($db->query("SELECT funcionario.id_funcionario AS idFuncionario,
                                           persona.nombre, persona.apellido, persona.cedula
                                    FROM funcionario
                                    JOIN persona ON persona.id_persona = funcionario.id_persona
                                    WHERE funcionario.tipo_funcion = 'chofer'
                                    ORDER BY persona.apellido")));
}

if ($tipo == "pacientes") {
    responder(comoLista($db->query("SELECT paciente.id_paciente AS idPaciente,
                                           persona.nombre, persona.apellido, persona.cedula
                                    FROM paciente
                                    JOIN persona ON persona.id_persona = paciente.id_persona
                                    ORDER BY persona.apellido")));
}

if ($tipo == "mis") {
    session_start();

    if (!isset($_SESSION['id_persona'])) {
        responder(array());
    }

    $quien = $_SESSION['id_persona'];

    responder(comoLista($db->query("SELECT traslado.id_traslado        AS idTraslado,
                                           traslado.punto_origen       AS origen,
                                           traslado.destino,
                                           traslado.tipo_elemento      AS tipo,
                                           traslado.descripcion_elemento AS descripcion,
                                           traslado.estado,
                                           traslado.minutos_estimados  AS minutos,
                                           traslado.tiempo_salida      AS salida,
                                           traslado.tiempo_llegada     AS llegada,
                                           traslado.llegada_real       AS llegadaReal,
                                           traslado.copiloto_nombre    AS copilotoNombre,
                                           traslado.copiloto_apellido  AS copilotoApellido,
                                           ruta.origen_lat AS origenLat, ruta.origen_lng AS origenLng,
                                           ruta.destino_lat AS destinoLat, ruta.destino_lng AS destinoLng,
                                           ambulancia.matricula, ambulancia.movil,
                                           paci.nombre AS nombrePaciente, paci.apellido AS apellidoPaciente
                                    FROM traslado
                                    JOIN funcionario_traslado_maneja ON funcionario_traslado_maneja.id_traslado = traslado.id_traslado
                                    JOIN funcionario ON funcionario.id_funcionario = funcionario_traslado_maneja.id_funcionario
                                    LEFT JOIN ruta ON ruta.id_ruta = traslado.id_ruta
                                    LEFT JOIN ambulancia ON ambulancia.id_ambulancia = traslado.id_ambulancia
                                    LEFT JOIN paciente ON paciente.id_paciente = traslado.id_paciente
                                    LEFT JOIN persona AS paci ON paci.id_persona = paciente.id_persona
                                    WHERE funcionario.id_persona = $quien
                                    ORDER BY traslado.id_traslado DESC")));
}

if ($tipo == "lista") {
    responder(comoLista($db->query("SELECT traslado.id_traslado          AS idTraslado,
                                           traslado.punto_origen         AS origen,
                                           traslado.destino,
                                           traslado.tipo_elemento        AS tipo,
                                           traslado.descripcion_elemento AS descripcion,
                                           traslado.estado,
                                           traslado.minutos_estimados    AS minutos,
                                           traslado.tiempo_salida        AS salida,
                                           traslado.tiempo_llegada       AS llegada,
                                           traslado.llegada_real         AS llegadaReal,
                                           traslado.copiloto_nombre      AS copilotoNombre,
                                           traslado.copiloto_apellido    AS copilotoApellido,
                                           ambulancia.matricula, ambulancia.movil,
                                           paci.nombre AS nombrePaciente, paci.apellido AS apellidoPaciente,
                                           chof.nombre AS nombreChofer,  chof.apellido AS apellidoChofer,
                                           admi.nombre AS nombreAdmin,   admi.apellido AS apellidoAdmin
                                    FROM traslado
                                    LEFT JOIN ambulancia ON ambulancia.id_ambulancia = traslado.id_ambulancia
                                    LEFT JOIN paciente ON paciente.id_paciente = traslado.id_paciente
                                    LEFT JOIN persona AS paci ON paci.id_persona = paciente.id_persona
                                    LEFT JOIN funcionario_traslado_maneja ON funcionario_traslado_maneja.id_traslado = traslado.id_traslado
                                    LEFT JOIN funcionario AS fchof ON fchof.id_funcionario = funcionario_traslado_maneja.id_funcionario
                                    LEFT JOIN persona AS chof ON chof.id_persona = fchof.id_persona
                                    LEFT JOIN funcionario_traslado_administra ON funcionario_traslado_administra.id_traslado = traslado.id_traslado
                                    LEFT JOIN funcionario AS fadmi ON fadmi.id_funcionario = funcionario_traslado_administra.id_funcionario
                                    LEFT JOIN persona AS admi ON admi.id_persona = fadmi.id_persona
                                    ORDER BY traslado.id_traslado DESC")));
}

responder(array());
