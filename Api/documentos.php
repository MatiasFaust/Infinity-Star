<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

if ($tipo == "contadores") {
    responder(array(
        'pacientes'  => contar("paciente"),
        'encuestas'  => contar("encuesta"),
        'documentos' => contar("documento", "categoria_tipo = 'pdf'")
    ));
}

if ($tipo == "encuestas") {
    responder(comoLista($db->query("SELECT encuesta.id_encuesta AS idEncuesta,
                                           documento.titulo,
                                           encuesta.fecha,
                                           (SELECT COUNT(*) FROM pregunta
                                            WHERE pregunta.id_encuesta = encuesta.id_encuesta) AS preguntas,
                                           (SELECT COUNT(*) FROM encuesta_paciente_entra
                                            WHERE encuesta_paciente_entra.id_encuesta = encuesta.id_encuesta) AS respondieron
                                    FROM encuesta
                                    JOIN documento ON documento.id_documento = encuesta.id_documento
                                    ORDER BY encuesta.id_encuesta DESC")));
}

if ($tipo == "encuesta") {
    $id = $_GET['id'];

    $datos = $db->query("SELECT encuesta.id_encuesta AS idEncuesta, documento.titulo
                         FROM encuesta
                         JOIN documento ON documento.id_documento = encuesta.id_documento
                         WHERE encuesta.id_encuesta = $id")->fetch_assoc();

    if (!$datos) {
        responder(array());
    }

    $datos['preguntas'] = comoLista($db->query("SELECT id_pregunta AS idPregunta, texto
                                                FROM pregunta
                                                WHERE id_encuesta = $id
                                                ORDER BY id_pregunta"));

    responder($datos);
}

if ($tipo == "documentos") {
    $base = direccionPublica();

    $lista = comoLista($db->query("SELECT id_documento AS idDocumento, titulo, archivo, fecha
                                    FROM documento
                                    WHERE categoria_tipo = 'pdf'
                                    ORDER BY id_documento DESC"));

    for ($i = 0; $i < count($lista); $i++) {
        $lista[$i]['enlace'] = enlaceDelDocumento($lista[$i]['idDocumento'], $lista[$i]['archivo']);
    }

    responder(array("base" => $base, "lista" => $lista));
}

if ($tipo == "documento") {
    $base = direccionPublica();
    $id = $_GET['id'];

    $fila = $db->query("SELECT id_documento AS idDocumento, titulo, archivo, fecha
                        FROM documento
                        WHERE id_documento = $id AND categoria_tipo = 'pdf'")->fetch_assoc();

    if (!$fila) {
        responder(array());
    }

    $fila["base"] = $base;
    $fila["enlace"] = enlaceDelDocumento($fila["idDocumento"], $fila["archivo"]);

    responder($fila);
}

responder(array());
