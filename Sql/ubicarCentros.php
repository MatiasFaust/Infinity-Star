<?php

// Le busca la ubicación a los centros que todavía no la tienen y la guarda.
// Se corre a mano desde la consola:   php Sql/ubicarCentros.php
//
// Va de a uno por segundo porque el servicio de mapas es gratuito y
// si le pedimos muchas cosas seguidas nos corta por un rato.

require_once __DIR__ . '/../conexion.php';

function limpiarDireccion($direccion) {
    $calle = $direccion;

    $calle = preg_replace('/\bBv(ar)?\.?\s/iu', 'Bulevar ', $calle);
    $calle = preg_replace('/\bAv\.\s/iu', 'Avenida ', $calle);
    $calle = preg_replace('/\s+entre\s.*$/iu', '', $calle);
    $calle = preg_replace('/\s+casi\s.*$/iu', '', $calle);
    $calle = preg_replace('/\s+esq\.?\s.*$/iu', '', $calle);
    $calle = preg_replace('/\bs\/n\b/iu', '', $calle);

    return trim(preg_replace('/\s+/u', ' ', $calle));
}

function buscarEnElMapa($texto) {
    $url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=uy&q=" . urlencode($texto);

    $pedido = curl_init($url);

    curl_setopt($pedido, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($pedido, CURLOPT_USERAGENT, 'HospitalClinicasMontevideo/1.0 (proyecto escolar UTU)');
    curl_setopt($pedido, CURLOPT_TIMEOUT, 20);

    $respuesta = curl_exec($pedido);
    $codigo = curl_getinfo($pedido, CURLINFO_HTTP_CODE);

    curl_close($pedido);

    if ($codigo != 200) {
        echo "   el servicio contestó $codigo\n";
        return null;
    }

    $datos = json_decode($respuesta, true);

    if (!$datos || count($datos) == 0) {
        return null;
    }

    return array("lat" => $datos[0]['lat'], "lng" => $datos[0]['lon']);
}

$faltan = comoLista($db->query("SELECT id_centro, referencia, direccion, localidad, departamento
                                FROM centro
                                WHERE lat IS NULL
                                ORDER BY referencia"));

echo "Centros sin ubicación: " . count($faltan) . "\n\n";

$puestos = 0;

foreach ($faltan as $c) {
    $donde = $c['localidad'];

    if ($c['localidad'] != $c['departamento']) {
        $donde = $c['localidad'] . ", " . $c['departamento'];
    }

    $lugar = buscarEnElMapa(limpiarDireccion($c['direccion']) . ", " . $donde . ", Uruguay");

    // Si no da con la puerta, al menos guardamos la localidad.
    if (!$lugar) {
        sleep(1);
        $lugar = buscarEnElMapa($donde . ", Uruguay");
    }

    if ($lugar) {
        $id = $c['id_centro'];
        $db->query("UPDATE centro SET lat = '" . $lugar['lat'] . "', lng = '" . $lugar['lng'] . "'
                    WHERE id_centro = $id");

        echo $c['referencia'] . " ubicado\n";
        $puestos = $puestos + 1;
    } else {
        echo $c['referencia'] . " NO se pudo ubicar\n";
    }

    sleep(1);
}

echo "\nListo: $puestos de " . count($faltan) . "\n";
