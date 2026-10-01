<?php

require_once 'config.php';

$db = new mysqli(BDhost, BDuser, BDpass, BDnombre, BDpuerto);

function comoLista($resultado) {
    $datos = array();

    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }

    return $datos;
}

function contar($tabla, $condicion = "") {
    global $db;

    $sql = "SELECT COUNT(*) AS cuantos FROM $tabla";

    if ($condicion != "") {
        $sql = $sql . " WHERE " . $condicion;
    }

    $fila = $db->query($sql)->fetch_assoc();

    return $fila['cuantos'];
}

function responder($datos) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function direccionPublica() {
    if (SitioPublico != "") {
        return SitioPublico;
    }

    $host = $_SERVER['HTTP_HOST'];

    $esLocal = ($host == "localhost" || substr($host, 0, 10) == "localhost:" ||
                substr($host, 0, 4) == "127." || $host == "[::1]");

    if ($esLocal) {
        $ip = gethostbyname(gethostname());

        if ($ip != "" && substr($ip, 0, 4) != "127." && strpos($ip, ":") === false) {
            $host = $ip;
        }
    }

    $esquema = "http";

    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != "" && $_SERVER['HTTPS'] != "off") {
        $esquema = "https";
    }

    $carpeta = dirname(dirname($_SERVER['SCRIPT_NAME']));

    if ($carpeta == "\\" || $carpeta == "/" || $carpeta == ".") {
        $carpeta = "";
    }

    return $esquema . "://" . $host . str_replace("\\", "/", $carpeta);
}

function enlaceDelDocumento($idDocumento, $archivo) {
    if (SitioDocumentos != "" && $archivo != "") {
        return SitioDocumentos . "/Archivos/" . $archivo;
    }

    return direccionPublica() . "/documento.php?id=" . $idDocumento;
}

function anotar($idPersona, $accion) {
    global $db;

    $accion = $db->real_escape_string($accion);

    if ($idPersona == "" || $idPersona == null) {
        $idPersona = "NULL";
    }

    $db->query("INSERT INTO actividad (id_persona, accion, momento)
                VALUES ($idPersona, '$accion', NOW())");
}

function esSuperadmin() {
    if (!isset($_SESSION['id_persona'])) {
        return false;
    }

    $quien = $_SESSION['id_persona'];

    return contar("funcionario", "id_persona = $quien AND tipo_funcion = 'superadmin'") > 0;
}

function tokenCorrecto($accion, $codigo) {
    global $db;

    $accion = $db->real_escape_string($accion);
    $codigo = $db->real_escape_string(trim($codigo));

    if ($codigo == "") {
        return false;
    }

    return contar("token", "accion = '$accion' AND codigo = '$codigo'") > 0;
}
