use academia_unifor;

ALTER TABLE usuarios
ADD COLUMN tipo_autorizacao ENUM('completo', 'restrito') NULL,
ADD COLUMN supervisor_id INT NULL,
ADD INDEX idx_monitor_supervisor (supervisor_id),
ADD CONSTRAINT fk_monitor_supervisor
	FOREIGN KEY (supervisor_id)
	REFERENCES usuarios(id)
	ON DELETE SET NULL;
CREATE TABLE permissoes_monitores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT NOT NULL,
    permissao ENUM(
        'alunos',
        'triagem',
        'treinos',
        'acompanhamento'
    ) NOT NULL,
    concedida_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_monitor_permissao
        UNIQUE (monitor_id, permissao),

    CONSTRAINT fk_permissao_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permissao_concedente
        FOREIGN KEY (concedida_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    INDEX idx_permissao_concedente (concedida_por)
);

CREATE TABLE historico_monitores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT NOT NULL,
    realizado_por INT NULL,
    acao VARCHAR(60) NOT NULL,
    descricao TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historico_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_historico_autor
        FOREIGN KEY (realizado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_historico_monitor (monitor_id, criado_em)
);