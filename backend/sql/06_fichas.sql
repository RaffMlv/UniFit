USE academia_unifor;

CREATE TABLE IF NOT EXISTS fichas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  criada_por INT NOT NULL,
  nome VARCHAR(120) NOT NULL,
  objetivo VARCHAR(100) NOT NULL,
  status ENUM('rascunho','publicada') NOT NULL DEFAULT 'rascunho',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fichas_aluno_status (aluno_id, status),
  CONSTRAINT fk_ficha_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_ficha_autor FOREIGN KEY (criada_por) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS ficha_divisoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ficha_id INT NOT NULL,
  letra CHAR(1) NOT NULL,
  UNIQUE KEY uq_ficha_letra (ficha_id, letra),
  CONSTRAINT fk_divisao_ficha FOREIGN KEY (ficha_id) REFERENCES fichas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ficha_exercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  divisao_id INT NOT NULL,
  exercicio_id INT NOT NULL,
  ordem INT NOT NULL,
  series INT NOT NULL,
  repeticoes INT NOT NULL,
  carga_kg DECIMAL(5,1) NULL,
  descanso_seg INT NOT NULL DEFAULT 60,
  observacoes VARCHAR(500) NOT NULL DEFAULT '',
  INDEX idx_fe_divisao_ordem (divisao_id, ordem),
  CONSTRAINT fk_fe_divisao FOREIGN KEY (divisao_id) REFERENCES ficha_divisoes(id) ON DELETE CASCADE,
  CONSTRAINT fk_fe_exercicio FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE RESTRICT
);