CREATE TABLE IF NOT EXISTS agenda_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    aluno_id INT NOT NULL,

    categoria ENUM(
        'treino',
        'aula',
        'avaliacao'
    ) NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,

    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,

    responsavel_id INT NULL,
    local VARCHAR(180),

    status ENUM(
        'agendado',
        'cancelado',
        'concluido'
    ) DEFAULT 'agendado',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (aluno_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (responsavel_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_agenda_aluno_data (aluno_id, data)
);