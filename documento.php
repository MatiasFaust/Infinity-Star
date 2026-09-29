<?php

require_once 'conexion.php';

$id = $_GET['id'];

$doc = $db->query("SELECT titulo, archivo FROM documento
                   WHERE id_documento = $id AND categoria_tipo = 'pdf'")->fetch_assoc();

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
