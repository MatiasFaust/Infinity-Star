ALTER TABLE ruta
  ADD origen_lat  decimal(10,7),
  ADD origen_lng  decimal(10,7),
  ADD destino_lat decimal(10,7),
  ADD destino_lng decimal(10,7);

ALTER TABLE ruta
  MODIFY origen  varchar(255) NOT NULL,
  MODIFY destino varchar(255) NOT NULL;

CREATE TABLE posicion (
  id_posicion int NOT NULL AUTO_INCREMENT,
  id_traslado int NOT NULL,
  latitud     decimal(10,7) NOT NULL,
  longitud    decimal(10,7) NOT NULL,
  momento     datetime NOT NULL,
  PRIMARY KEY (id_posicion),
  FOREIGN KEY (id_traslado) REFERENCES traslado (id_traslado)
);
