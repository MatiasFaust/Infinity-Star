<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "hospital_clinicas";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["error" => "Error de BD"]); exit();
}

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
$role = isset($_GET['role']) ? $_GET['role'] : '';

if($role === 'paciente') {
    $query = "SELECT fecha, especialidad, estado, qr_hash FROM historia_clinica WHERE paciente_id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["historial" => $historial]);
} else if ($role === 'funcionario') {
    $query = "SELECT ambulancias_activas, alertas FROM logistica_ambulancias ORDER BY id DESC LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $logistica = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($logistica);
}
?>