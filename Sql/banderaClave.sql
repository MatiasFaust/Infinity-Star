-- Bandera para saber si la persona ya se puso su propia contraseña.
-- 0 = la contraseña se la puso otro (el superadmin) y tiene que cambiarla.
-- 1 = ya la cambió ella misma.

ALTER TABLE usuario ADD COLUMN clave_propia TINYINT(1) NOT NULL DEFAULT 0;

-- A las cuentas que ya existen las dejamos en 0, así la primera vez
-- que entren se les pide que elijan una contraseña suya.
UPDATE usuario SET clave_propia = 0;
