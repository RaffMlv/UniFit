use academia_unifor;
ALTER TABLE usuarios
  ADD COLUMN especialidade ENUM('educacao_fisica','nutricao','fisioterapia') NULL,
  ADD COLUMN registro_profissional VARCHAR(30) NULL; -- CREF / CRN / CREFITO
-- regra: especialidade obrigatória quando papel = 'monitor'