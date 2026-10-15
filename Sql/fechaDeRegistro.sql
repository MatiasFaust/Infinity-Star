-- Guarda cuando se registro cada traslado, para poder filtrar los de hoy.

ALTER TABLE traslado ADD COLUMN creado DATETIME NULL;

-- A los que ya estaban les ponemos la hora de salida como fecha de registro,
-- que es lo mas parecido que tenemos. Si no tienen, quedan con la de hoy.
UPDATE traslado SET creado = IFNULL(tiempo_salida, NOW()) WHERE creado IS NULL;
