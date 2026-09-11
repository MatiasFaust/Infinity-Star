<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

$columnas = "traslado.id_traslado          AS idTraslado,
             traslado.tipo_elemento         AS tipo,
             traslado.descripcion_elemento  AS descripcion,
             traslado.punto_origen          AS origen,
             traslado.destino,
             traslado.estado,
             traslado.tiempo_salida         AS salida,
             traslado.tiempo_llegada        AS llegada,
             traslado.inicio_real           AS inicio,
             TIMESTAMPDIFF(SECOND, traslado.inicio_real, traslado.fin_real) AS duracion,
             paci.nombre                    AS nombrePaciente,
             paci.apellido                  AS apellidoPaciente,
             ambulancia.matricula";

$tablas = "FROM traslado
           LEFT JOIN paciente ON paciente.id_paciente = traslado.id_paciente
           LEFT JOIN persona AS paci ON paci.id_persona = paciente.id_persona
           LEFT JOIN ambulancia ON ambulancia.id_ambulancia = traslado.id_ambulancia";

$ambulancias = "SELECT id_ambulancia AS idAmbulancia, matricula, movil FROM ambulancia";

if ($tipo == "contadores") {
    responder(array(
        'total'       => contar("traslado"),
        'curso'       => contar("traslado", "estado = 'En curso'"),
        'retorno'     => contar("traslado", "estado = 'En retorno'"),
        'finalizados' => contar("traslado", "estado = 'Finalizado'"),
        'ambulancias' => contar("ambulancia")
    ));
}

if ($tipo == "ambulancias") {
    responder(comoLista($db->query("$ambulancias ORDER BY matricula")));
}

if ($tipo == "ambulancia") {
    $id = $_GET['id'];
    responder($db->query("$ambulancias WHERE id_ambulancia = $id")->fetch_assoc());
}

if ($tipo == "lista") {
    responder(comoLista($db->query("SELECT $columnas,
                                           chof.nombre AS nombreChofer, chof.apellido AS apellidoChofer
                                    $tablas
                                    LEFT JOIN funcionario_traslado_maneja ON funcionario_traslado_maneja.id_traslado = traslado.id_traslado
                                    LEFT JOIN funcionario ON funcionario.id_funcionario = funcionario_traslado_maneja.id_funcionario
                                    LEFT JOIN persona AS chof ON chof.id_persona = funcionario.id_persona
                                    ORDER BY traslado.tiempo_salida DESC")));
}

responder(array());
