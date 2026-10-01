<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];

if ($tipo == "contadores") {
    responder(array(
        'pacientes'  => contar("paciente"),
        'pacientesConCorreo' => contar("paciente JOIN persona ON persona.id_persona = paciente.id_persona", "persona.correo <> ''"),
        'documentos' => contar("documento", "categoria_tipo = 'pdf'")
    ));
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

if ($tipo == "documentosPaciente") {
    $base = direccionPublica();

    $lista = comoLista($db->query("SELECT documento.id_documento AS idDocumento,
                                          documento.titulo, documento.fecha, documento.codigo,
                                          persona.nombre, persona.apellido, persona.cedula,
                                          persona.telefono
                                   FROM documento
                                   JOIN paciente ON paciente.id_paciente = documento.id_paciente
                                   JOIN persona ON persona.id_persona = paciente.id_persona
                                   WHERE documento.categoria_tipo = 'paciente'
                                   ORDER BY documento.id_documento DESC"));

    for ($i = 0; $i < count($lista); $i++) {
        $lista[$i]['enlace'] = $base . "/miDocumento.php?codigo=" . $lista[$i]['codigo'];
    }

    responder(array("base" => $base, "lista" => $lista));
}



responder(array());
