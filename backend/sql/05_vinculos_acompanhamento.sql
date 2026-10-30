USE academia_unifor;

CREATE TABLE IF NOT EXISTS vinculos_acompanhamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL UNIQUE,
  monitor_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vinculo_monitor (monitor_id),
  CONSTRAINT fk_vinculo_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_vinculo_monitor FOREIGN KEY (monitor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);