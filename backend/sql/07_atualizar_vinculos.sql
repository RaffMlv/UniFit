
USE academia_unifor;

-- 1. Adiciona a especialidade ao vínculo
ALTER TABLE vinculos_acompanhamento
ADD COLUMN especialidade ENUM(
    'educacao_fisica',
    'nutricao',
    'fisioterapia'
) NULL;

-- 2. Preenche a especialidade conforme o profissional
UPDATE vinculos_acompanhamento v
JOIN usuarios u ON u.id = v.monitor_id
SET v.especialidade = u.especialidade;

-- 3. Torna a especialidade obrigatória
ALTER TABLE vinculos_acompanhamento
MODIFY COLUMN especialidade ENUM(
    'educacao_fisica',
    'nutricao',
    'fisioterapia'
) NOT NULL;

-- 4. Cria índice auxiliar para a chave estrangeira
ALTER TABLE vinculos_acompanhamento
ADD INDEX idx_vinculo_aluno (aluno_id);

-- 5. Remove temporariamente a chave estrangeira do aluno
ALTER TABLE vinculos_acompanhamento
DROP FOREIGN KEY fk_vinculo_aluno;

-- 6. Remove a restrição UNIQUE antiga
ALTER TABLE vinculos_acompanhamento
DROP INDEX uq_vinculo;

-- 7. Recria a chave estrangeira do aluno
ALTER TABLE vinculos_acompanhamento
ADD CONSTRAINT fk_vinculo_aluno
FOREIGN KEY (aluno_id)
REFERENCES usuarios(id)
ON DELETE CASCADE;

-- 8. Cria a nova restrição UNIQUE
ALTER TABLE vinculos_acompanhamento
ADD CONSTRAINT uq_aluno_especialidade
UNIQUE (aluno_id, especialidade);

-- 9. Remove o índice auxiliar
ALTER TABLE vinculos_acompanhamento
DROP INDEX idx_vinculo_aluno;
