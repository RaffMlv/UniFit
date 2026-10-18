USE academia_unifor;

CREATE TABLE IF NOT EXISTS triagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  objetivo VARCHAR(100) NOT NULL,
  biotipo VARCHAR(200) NOT NULL,
  experiencia VARCHAR(100) NOT NULL,
  esportes JSON NOT NULL,
  outro_esporte VARCHAR(150) NOT NULL DEFAULT '',
  frequencia VARCHAR(50) NOT NULL,
  peso_kg DECIMAL(5,1) NULL,
  altura_cm DECIMAL(5,1) NULL,
  prefere_nao_informar BOOLEAN NOT NULL DEFAULT FALSE,
  possui_limitacao BOOLEAN NOT NULL DEFAULT FALSE,
  regioes JSON NOT NULL,
  descricao_limitacao TEXT NULL,
  condicoes JSON NOT NULL,
  outra_condicao VARCHAR(200) NOT NULL DEFAULT '',
  aceitou_termo BOOLEAN NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_triagem_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);