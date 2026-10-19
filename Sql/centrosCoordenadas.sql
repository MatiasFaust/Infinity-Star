-- Guardamos la ubicación de cada centro en la base.
-- Así, al elegir un hospital de la lista, el mapa lo ubica al instante y no
-- hay que preguntarle cada vez al servicio de mapas, que limita las consultas.

ALTER TABLE centro ADD COLUMN lat DECIMAL(10,7) NULL;
ALTER TABLE centro ADD COLUMN lng DECIMAL(10,7) NULL;
