-- Guarda cosas sueltas de configuración que se pueden cambiar desde la página.
-- Por ahora, el enlace del formulario de la encuesta de satisfacción.

CREATE TABLE IF NOT EXISTS ajuste (
    clave VARCHAR(50) NOT NULL,
    valor TEXT NOT NULL,
    PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO ajuste (clave, valor) VALUES
('encuestaEnlace', 'https://docs.google.com/forms/d/e/1FAIpQLSdmh00onfw2tBriJkY4Epm5GIdWVRvgBngqscn9TeaJqU0TnA/viewform')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);
