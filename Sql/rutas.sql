ALTER TABLE traslado
  ADD copiloto_nombre   varchar(100),
  ADD copiloto_apellido varchar(100),
  ADD copiloto_cedula   varchar(20),
  ADD id_ruta           int;

CREATE TABLE ruta (
  id_ruta       int NOT NULL AUTO_INCREMENT,
  origen        varchar(100) NOT NULL,
  destino       varchar(100) NOT NULL,
  id_ambulancia int NOT NULL,
  PRIMARY KEY (id_ruta),
  UNIQUE (origen, destino, id_ambulancia),
  FOREIGN KEY (id_ambulancia) REFERENCES ambulancia (id_ambulancia)
);

ALTER TABLE traslado
  ADD FOREIGN KEY (id_ruta) REFERENCES ruta (id_ruta);
