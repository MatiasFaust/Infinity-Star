CREATE TABLE recuperacion (
  id_recuperacion int NOT NULL AUTO_INCREMENT,
  id_persona      int NOT NULL,
  codigo          varchar(40) NOT NULL,
  momento         datetime NOT NULL,
  usado           tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_recuperacion)
);
