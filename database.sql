-- Ejecutar este script en phpMyAdmin (MySQL)

CREATE DATABASE IF NOT EXISTS hospital_clinicas;
USE hospital_clinicas;

-- Tabla de Usuarios (Autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('paciente', 'funcionario') NOT NULL
);

-- Tabla de Historia Clínica (Módulo Documental)
CREATE TABLE IF NOT EXISTS historia_clinica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    fecha DATE NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    qr_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id)
);

-- Tabla de Logística (Ambulancias)
CREATE TABLE IF NOT EXISTS logistica_ambulancias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambulancias_activas INT NOT NULL,
    alertas VARCHAR(255) DEFAULT 'Ninguna',
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- INSERTAR DATOS DE PRUEBA
-- Contraseña para ambos usuarios es: 123456 (Hasheada en SHA256)
INSERT INTO usuarios (username, password_hash, rol) VALUES 
('paciente1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'paciente'),
('admin1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'funcionario');

-- Insertar datos clínicos para el paciente (ID 1)
INSERT INTO historia_clinica (paciente_id, fecha, especialidad, estado, qr_hash) VALUES 
(1, '2026-08-01', 'Medicina General', 'Completado', 'HC-PAC-001-VALID'),
(1, '2026-08-05', 'Laboratorio', 'Resultados Pendientes', 'HC-PAC-001-VALID');

-- Insertar estado de ambulancias
INSERT INTO logistica_ambulancias (ambulancias_activas, alertas) VALUES 
(4, 'Unidad 2 en mantenimiento');
