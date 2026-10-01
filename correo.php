<?php

require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';
require_once 'PHPMailer/src/Exception.php';

function mandarCorreo($para, $asunto, $mensaje) {
    if (CorreoCuenta == "" || CorreoClave == "") {
        return false;
    }

    $correo = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        $correo->isSMTP();
        $correo->Host       = 'smtp.gmail.com';
        $correo->SMTPAuth   = true;
        $correo->Username   = CorreoCuenta;
        $correo->Password   = CorreoClave;
        $correo->SMTPSecure = 'tls';
        $correo->Port       = 587;
        $correo->CharSet    = 'UTF-8';

        $correo->setFrom(CorreoCuenta, CorreoNombre);
        $correo->addAddress($para);

        $correo->isHTML(true);
        $correo->Subject = $asunto;
        $correo->Body    = $mensaje;

        $correo->send();

        return true;

    } catch (Exception $error) {
        return false;
    }
}
