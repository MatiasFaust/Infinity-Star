<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "hospital_clinicas"; 
$username = "root";
$password = "";

// Conexión a la base de datos
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);   //PDO: PHP Data Objects, una interfaz para acceder a bases de datos en PHP
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Configuración de PDO para lanzar excepciones en caso de error
} catch(PDOException $exception) {
    echo json_encode(["error" => "Error de BD: " . $exception->getMessage()]);  // Manejo de errores de conexión a la base de datos
    exit();
}

$data = json_decode(file_get_contents("php://input")); 

if(!empty($data->username) && !empty($data->password) && !empty($data->role)) {
    $query = "SELECT id, password_hash FROM usuarios WHERE username = :user AND rol = :rol LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user', $data->username);
    $stmt->bindParam(':rol', $data->role);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificación en SHA256
        if(hash('sha256', $data->password) === $row['password_hash']) {
            $jwt = base64_encode(json_encode(['user_id' => $row['id'], 'role' => $data->role]));
            echo json_encode(["message" => "Login exitoso", "token" => $jwt, "role" => $data->role, "user_id" => $row['id']]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
}
?>