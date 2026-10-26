<?php

require_once 'conexion.php';

session_start();

$paciente = "NULL";
$categoria = "pdf";
$vuelve = "Html/Administrativo/documentosQr.html";

if (isset($_POST["paciente"]) && $_POST["paciente"] != "") {
    $paciente = $_POST["paciente"];
    $categoria = "paciente";
    $vuelve = "Html/Administrativo/documentosPaciente.html";
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header("Location: Index.html");
    exit;
}

// Solo los administrativos y el superadmin pueden subir documentos.
if (!esAdministrativo()) {
    header("Location: Index.html");
    exit;
}


// ---- Sustituir el PDF de un documento que ya existe ----
// Cambiamos solo el archivo. El documento sigue siendo el mismo, asi que
// el QR que ya se imprimio y se repartio sigue andando.

if (isset($_GET['que']) && $_GET['que'] == "sustituir") {
    $id = $_POST['id'];
    $vuelve = "Html/Administrativo/documentosQr.html";

    $viejo = $db->query("SELECT archivo, titulo FROM documento WHERE id_documento = $id")->fetch_assoc();

    if (!$viejo) {
        header("Location: $vuelve?error=noSeGuardo");
        exit;
    }

    if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] != 0) {
        header("Location: $vuelve?error=archivoGrande");
        exit;
    }

    $extension = strtolower(pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION));

    if ($extension != "pdf" || mime_content_type($_FILES['archivo']['tmp_name']) != "application/pdf") {
        header("Location: $vuelve?error=noEsPdf");
        exit;
    }

    $nombreGuardado = "doc" . time() . rand(100, 999) . ".pdf";

    if (!move_uploaded_file($_FILES['archivo']['tmp_name'], "Archivos/" . $nombreGuardado)) {
        header("Location: $vuelve?error=noSeGuardo");
        exit;
    }

    $db->query("UPDATE documento SET archivo = '$nombreGuardado', fecha = NOW()
                WHERE id_documento = $id");

    // Recien ahora borramos el viejo, cuando el nuevo ya quedo guardado.
    if ($viejo['archivo'] != "" && file_exists("Archivos/" . $viejo['archivo'])) {
        unlink("Archivos/" . $viejo['archivo']);
    }

    $yo = 0;

    if (isset($_SESSION["id_persona"])) {
        $yo = $_SESSION["id_persona"];
    }

    anotar($yo, "Sustituyó el archivo del documento " . $viejo['titulo']);

    header("Location: $vuelve?sustituido=si");
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
$codigo = "";

if ($categoria == "paciente") {
    $codigo = md5(uniqid(rand(), true));
}
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

$db->query("INSERT INTO documento (titulo, categoria_tipo, id_funcionario, id_paciente, archivo, codigo, fecha)
            VALUES ('$titulo', '$categoria', $idFuncionario, $paciente, '$nombreGuardado', '$codigo', NOW())");

$idDocumento = $db->insert_id;

if ($categoria == "pdf") {
    $db->query("INSERT INTO qr (url, id_documento)
                VALUES ('documento.php?id=$idDocumento', $idDocumento)");
}

$yo = 0;

if (isset($_SESSION["id_persona"])) {
    $yo = $_SESSION["id_persona"];
}

anotar($yo, "Subió el documento " . $titulo);

header("Location: $vuelve?guardado=si");
