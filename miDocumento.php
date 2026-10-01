<?php

require_once 'conexion.php';

$codigo = $_GET['codigo'];

if ($codigo == "") {
    header("Content-Type: text/html; charset=utf-8");
    echo "<p style='font-family:Arial'>Ese documento no está disponible.</p>";
    exit;
}

$doc = $db->query("SELECT titulo, archivo FROM documento
                   WHERE codigo = '$codigo' AND categoria_tipo = 'paciente'")->fetch_assoc();

if (!$doc || $doc['archivo'] == "") {
    header("Content-Type: text/html; charset=utf-8");
    echo "<p style='font-family:Arial'>Ese documento no está disponible.</p>";
    exit;
}

$ruta = "Archivos/" . $doc['archivo'];

if (!file_exists($ruta)) {
    header("Content-Type: text/html; charset=utf-8");
    echo "<p style='font-family:Arial'>Ese documento no está disponible.</p>";
    exit;
}

header("Content-Type: application/pdf");
header("Content-Disposition: inline; filename=\"" . $doc['titulo'] . ".pdf\"");
header("Content-Length: " . filesize($ruta));

readfile($ruta);
