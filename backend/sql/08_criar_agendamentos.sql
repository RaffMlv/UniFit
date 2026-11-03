CREATE TABLE disponibilidades_semanais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT NOT NULL,
    dia_semana TINYINT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    duracao_minutos INT NOT NULL,
    intervalo_minutos INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_disponibilidade_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES usuarios(id),

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 1 AND 7),

    CONSTRAINT chk_horarios
        CHECK (hora_inicio < hora_fim),

    CONSTRAINT chk_duracao
        CHECK (duracao_minutos > 0),

    CONSTRAINT chk_intervalo
        CHECK (intervalo_minutos >= 0),

    INDEX idx_disponibilidade_monitor (monitor_id, dia_semana)
);

CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    monitor_id INT NOT NULL,
    especialidade ENUM(
        'educacao_fisica',
        'nutricao',
        'fisioterapia'
    ) NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM(
        'agendado',
        'cancelado',
        'concluido'
    ) NOT NULL DEFAULT 'agendado',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_agendamento_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_agendamento_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES usuarios(id),

    CONSTRAINT chk_agendamento_horarios
        CHECK (hora_inicio < hora_fim),

    INDEX idx_agendamento_aluno (aluno_id, data),
    INDEX idx_agendamento_monitor (monitor_id, data)
);