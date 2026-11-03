CREATE TABLE fichas_atuais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    ficha_id INT NOT NULL,
    especialidade VARCHAR(30) NOT NULL,
    selecionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_ficha_atual_aluno_especialidade
        UNIQUE (aluno_id, especialidade),

    CONSTRAINT uq_ficha_atual_ficha
        UNIQUE (ficha_id),

    CONSTRAINT fk_ficha_atual_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ficha_atual_ficha
        FOREIGN KEY (ficha_id)
        REFERENCES fichas(id)
        ON DELETE CASCADE
);