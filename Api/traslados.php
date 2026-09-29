<?php

require_once '../conexion.php';

$tipo = $_GET['tipo'];


$ambulancias = "SELECT id_ambulancia AS idAmbulancia, matricula, movil FROM ambulancia";

$rutas = "SELECT ruta.id_ruta AS idRuta, ruta.origen, ruta.destino,
                 ambulancia.id_ambulancia AS idAmbulancia,
                 ambulancia.matricula, ambulancia.movil
          FROM ruta
          JOIN ambulancia ON ambulancia.id_ambulancia = ruta.id_ambulancia";

if ($tipo == "contadores") {
    responder(array(

        'ambulancias' => contar("ambulancia"),
        'rutas'       => contar("ruta")
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


responder(array());
