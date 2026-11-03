import { pool } from "../config/db.js";

export async function criarVinculo(alunoId, monitorId, especialidade) {
    const [alunos] = await pool.query(
    `SELECT id
     FROM usuarios
     WHERE id = ? AND papel = 'aluno' AND ativo = TRUE`,
    [alunoId]
    )

    if (!alunos[0]) {
        const erroAluno = new Error('Aluno não encontrado ou inativo')
        erroAluno.status = 404
        throw erroAluno
    }

    const [monitores] = await pool.query(
        `SELECT id, papel, especialidade
        FROM usuarios
        WHERE id = ? AND ativo = TRUE`,
        [monitorId]
    )

    if (!monitores[0] || monitores[0].papel !== 'monitor') {
        const erroMonitor = new Error('Monitor não encontrado, inativo ou usuário não é monitor')
        erroMonitor.status = 404
        throw erroMonitor
    }

    if(monitores[0].especialidade !== especialidade) {
        const erroEspecialidade = new Error('Especialidade do monitor incompatível')
        erroEspecialidade.status = 400
        throw erroEspecialidade
    }

    try {

        const [resultado] = await pool.query(
            `INSERT INTO vinculos_acompanhamento
            (aluno_id, monitor_id, especialidade)
            VALUES (?, ?, ?)`,
            [alunoId, monitorId, especialidade]
        )

        return {
            id: resultado.insertId,
            aluno_id: alunoId,
            monitor_id: monitorId,
            especialidade
        }
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            const erroDuplicado = new Error(
                'Este aluno já possui um monitor para essa especialidade'
            )

            erroDuplicado.status = 409
            throw erroDuplicado
        }
        
        throw erro
    }

}

export async function listarVinculosDoMonitor(monitorId) {
    const [vinculos] = await pool.query(
        `SELECT
            v.id,
            v.aluno_id,
            v.monitor_id,
            v.especialidade,
            v.criado_em,
            a.nome AS aluno_nome
         FROM vinculos_acompanhamento v
         INNER JOIN usuarios a ON a.id = v.aluno_id
         WHERE v.monitor_id = ?
         ORDER BY v.criado_em DESC`,
        [monitorId]
    )

    return vinculos
}

export async function listarVinculosDoAluno(alunoId) {
    const [vinculos] = await pool.query(
        `SELECT
            v.id,
            v.aluno_id,
            v.monitor_id,
            v.especialidade,
            v.criado_em,
            m.nome AS monitor_nome
         FROM vinculos_acompanhamento v
         INNER JOIN usuarios m ON m.id = v.monitor_id
         WHERE v.aluno_id = ?
         ORDER BY v.criado_em DESC`,
        [alunoId]
    )

    return vinculos
}

export async function removerVinculo(vinculoId) {
    const [resultado] = await pool.query(
        `DELETE FROM vinculos_acompanhamento
         WHERE id = ?`,
        [vinculoId]
    )

    if (resultado.affectedRows === 0) {
        const erro = new Error('Vínculo não encontrado')
        erro.status = 404
        throw erro
    }

    return { mensagem: 'Vínculo removido com sucesso' }
}

