<?php

require_once 'conexion.php';

session_start();

$vuelve = "Html/Administrativo/documentosQr.html";

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

$titulo = $_POST['titulo'];

if (isset($_POST['otroTitulo']) && trim($_POST['otroTitulo']) != "") {
    $titulo = trim($_POST['otroTitulo']);
}

if (trim($titulo) == "") {
    header("Location: $vuelve?error=sinTitulo");
    exit;
}

if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] != 0) {
    header("Location: $vuelve?error=archivoGrande");
    exit;
}

$nombreOriginal = $_FILES['archivo']['name'];
$extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

if ($extension != "pdf") {
    header("Location: $vuelve?error=noEsPdf");
    exit;
}

$tipo = mime_content_type($_FILES['archivo']['tmp_name']);

if ($tipo != "application/pdf") {
    header("Location: $vuelve?error=noEsPdf");
    exit;
}

$nombreGuardado = "doc" . time() . rand(100, 999) . ".pdf";
$destino = "Archivos/" . $nombreGuardado;

if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $destino)) {
    header("Location: $vuelve?error=noSeGuardo");
    exit;
}

$idFuncionario = "NULL";

if (isset($_SESSION['id_persona'])) {
    $quien = $_SESSION['id_persona'];
    $f = $db->query("SELECT id_funcionario FROM funcionario WHERE id_persona = $quien")->fetch_assoc();

    if ($f) {
        $idFuncionario = $f['id_funcionario'];
    }
}

$db->query("INSERT INTO documento (titulo, categoria_tipo, id_funcionario, archivo, fecha)
            VALUES ('$titulo', 'pdf', $idFuncionario, '$nombreGuardado', NOW())");

$idDocumento = $db->insert_id;

$db->query("INSERT INTO qr (url, id_documento)
            VALUES ('documento.php?id=$idDocumento', $idDocumento)");

header("Location: $vuelve?guardado=si");
