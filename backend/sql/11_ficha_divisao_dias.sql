CREATE TABLE IF NOT EXISTS ficha_divisao_dias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    divisao_id INT NOT NULL,
    dia_semana TINYINT NOT NULL,

    CONSTRAINT fk_divisao_dias
        FOREIGN KEY (divisao_id)
        REFERENCES ficha_divisoes(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_divisao_dia
        UNIQUE (divisao_id, dia_semana),

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 0 AND 6)
);