import { pool } from "../config/db.js";

function validarData(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const dataObj = new Date(`${data}T00:00:00Z`);

    return !Number.isNaN(dataObj.getTime()) &&
        dataObj.toISOString().slice(0, 10) === data;
}

export async function buscarEventosDaAgenda(alunoId, inicio, fim) {
    if (!validarData(inicio) || !validarData(fim)) {
        const erro = new Error("Datas inválidas. Utilize o formato YYYY-MM-DD.");
        erro.status = 400;
        throw erro;
    }

    if (inicio > fim) {
        const erro = new Error("A data inicial não pode ser posterior à data final.");
        erro.status = 400;
        throw erro;
    }

    const sql = `
        SELECT
            CONCAT('consulta-', a.id) AS id,
            'consulta' AS categoria,
            CASE a.especialidade
                WHEN 'educacao_fisica' THEN 'Consulta de Educação Física'
                WHEN 'fisioterapia' THEN 'Consulta de Fisioterapia'
                WHEN 'nutricao' THEN 'Consulta de Nutrição'
            END AS titulo,
            DATE_FORMAT(a.data, '%Y-%m-%d') AS data,
            TIME_FORMAT(a.hora_inicio, '%H:%i') AS inicio,
            TIME_FORMAT(a.hora_fim, '%H:%i') AS fim,
            m.nome AS responsavel,
            NULL AS local,
            a.status,
            NULL AS descricao
        FROM agendamentos a
        INNER JOIN usuarios m ON m.id = a.monitor_id
        WHERE a.aluno_id = ?
          AND a.data BETWEEN ? AND ?

        UNION ALL

        SELECT
            CONCAT('evento-', e.id) AS id,
            e.categoria,
            e.titulo,
            DATE_FORMAT(e.data, '%Y-%m-%d') AS data,
            TIME_FORMAT(e.hora_inicio, '%H:%i') AS inicio,
            TIME_FORMAT(e.hora_fim, '%H:%i') AS fim,
            COALESCE(u.nome, 'A definir') AS responsavel,
            e.local,
            e.status,
            e.descricao
        FROM agenda_eventos e
        LEFT JOIN usuarios u ON u.id = e.responsavel_id
        WHERE e.aluno_id = ?
          AND e.data BETWEEN ? AND ?

        ORDER BY data ASC, inicio ASC
    `;

    const [eventos] = await pool.query(sql, [
        alunoId, inicio, fim,
        alunoId, inicio, fim
    ]);

    const sqlTreinos = `
        SELECT
            f.id AS ficha_id,
            f.nome AS ficha_nome,
            d.id AS divisao_id,
            d.letra,
            fd.dia_semana
        FROM fichas f
        INNER JOIN ficha_divisoes d
            ON d.ficha_id = f.id
        INNER JOIN ficha_divisao_dias fd
            ON fd.divisao_id = d.id
        WHERE f.id = (
            SELECT f2.id
            FROM fichas f2
            WHERE f2.aluno_id = ?
            AND f2.status = 'publicada'
            ORDER BY f2.atualizado_em DESC, f2.id DESC
            LIMIT 1
        )
        ORDER BY d.letra, fd.dia_semana
    `;

    const [divisoes] = await pool.query(sqlTreinos, [alunoId]);

    const eventosTreino = [];

    const dataAtual = new Date(`${inicio}T00:00:00Z`);
    const dataFinal = new Date(`${fim}T00:00:00Z`);

    while (dataAtual <= dataFinal) {
        const data = dataAtual.toISOString().slice(0, 10);
        const diaSemana = dataAtual.getUTCDay();

        const divisoesDoDia = divisoes.filter(
            divisao => Number(divisao.dia_semana) === diaSemana
        );

        for (const divisao of divisoesDoDia) {
            eventosTreino.push({
                id: `treino-${divisao.ficha_id}-${divisao.divisao_id}-${data}`,
                categoria: 'treino',
                titulo: `Treino ${divisao.letra}`,
                data,
                inicio: null,
                fim: null,
                responsavel: null,
                local: null,
                status: 'agendado',
                descricao: `${divisao.ficha_nome} - Divisão ${divisao.letra}`
            });
        }

        dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
    }

    return [...eventos, ...eventosTreino].sort((a, b) => {
        const comparacaoData = a.data.localeCompare(b.data);

        if (comparacaoData !== 0) {
            return comparacaoData;
        }

        // Eventos sem horário aparecem primeiro no dia.
        if (!a.inicio) return -1;
        if (!b.inicio) return 1;

        return a.inicio.localeCompare(b.inicio);
    });
}

function validarHora(hora) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

function converterParaMinutos(hora) {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
}

function validarIntervalo(hora_inicio, hora_fim) {
    if (!validarHora(hora_inicio) || !validarHora(hora_fim)) {
        return false;
    }

    return converterParaMinutos(hora_inicio) <
           converterParaMinutos(hora_fim);
}

export async function criarEventoAgenda(dados) {

    const {
        aluno_id,
        categoria,
        titulo,
        descricao,
        data,
        hora_inicio,
        hora_fim,
        responsavel_id,
        local
    } = dados;

    // 1. Validar os dados obrigatórios
    if (!aluno_id || !categoria || !titulo || !data ||
        !hora_inicio || !hora_fim) {
        const erro = new Error("Preencha todos os campos obrigatórios.");
        erro.status = 400;
        throw erro;
    }

    if (!Number.isInteger(aluno_id) || aluno_id <= 0) {
        const erro = new Error("ID do aluno inválido.");
        erro.status = 400;
        throw erro;
    }

    if (typeof titulo !== "string" || !titulo.trim() || titulo.length > 150) {
        const erro = new Error("Título inválido. Utilize até 150 caracteres.");
        erro.status = 400;
        throw erro;
    }

    // 2. Validar a categoria
    const categoriasPermitidas = ["treino", "aula", "avaliacao"];

    if (!categoriasPermitidas.includes(categoria)) {
        const erro = new Error("Categoria inválida.");
        erro.status = 400;
        throw erro;
    }

    // 3. Validar data e intervalo de horários
    if (!validarData(data)) {
        const erro = new Error("Data inválida. Utilize YYYY-MM-DD.");
        erro.status = 400;
        throw erro;
    }

    if (!validarIntervalo(hora_inicio, hora_fim)) {
        const erro = new Error("Intervalo de horários inválido.");
        erro.status = 400;
        throw erro;
    }

    // 4. Verificar se o aluno existe e está ativo
    const [alunos] = await pool.query(
        `SELECT id
         FROM usuarios
         WHERE id = ?
           AND papel = 'aluno'
           AND ativo = TRUE`,
        [aluno_id]
    );

    if (alunos.length === 0) {
        const erro = new Error("Aluno não encontrado ou inativo.");
        erro.status = 404;
        throw erro;
    }

    // 5. Verificar o responsável, caso informado
    if (responsavel_id !== undefined && responsavel_id !== null) {

        if (!Number.isInteger(responsavel_id) || responsavel_id <= 0) {
            const erro = new Error("ID do responsável inválido.");
            erro.status = 400;
            throw erro;
        }

        const [monitores] = await pool.query(
            `SELECT id
             FROM usuarios
             WHERE id = ?
               AND papel = 'monitor'
               AND ativo = TRUE`,
            [responsavel_id]
        );

        if (monitores.length === 0) {
            const erro = new Error("Monitor não encontrado ou inativo.");
            erro.status = 404;
            throw erro;
        }

        // Verificar vínculo entre aluno e monitor
        const [vinculos] = await pool.query(
            `SELECT id
             FROM vinculos_acompanhamento
             WHERE aluno_id = ?
               AND monitor_id = ?`,
            [aluno_id, responsavel_id]
        );

        if (vinculos.length === 0) {
            const erro = new Error("O monitor não possui vínculo com este aluno.");
            erro.status = 409;
            throw erro;
        }
    }

    // 6. Inserir o evento na tabela agenda_eventos
    const sql = `
        INSERT INTO agenda_eventos (
            aluno_id,
            categoria,
            titulo,
            descricao,
            data,
            hora_inicio,
            hora_fim,
            responsavel_id,
            local
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.query(sql, [
        aluno_id,
        categoria,
        titulo.trim(),
        descricao ?? null,
        data,
        hora_inicio,
        hora_fim,
        responsavel_id ?? null,
        local ?? null
    ]);

    // 7. Retornar os dados do evento criado
    return {
        id: resultado.insertId,
        aluno_id,
        categoria,
        titulo: titulo.trim(),
        descricao: descricao ?? null,
        data,
        hora_inicio,
        hora_fim,
        responsavel_id: responsavel_id ?? null,
        local: local ?? null,
        status: "agendado"
    };
}

export async function atualizarEventoAgenda(id, dados) {

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        const erro = new Error("ID do evento inválido.");
        erro.status = 400;
        throw erro;
    }

    const {
        aluno_id,
        categoria,
        titulo,
        descricao,
        data,
        hora_inicio,
        hora_fim,
        responsavel_id,
        local
    } = dados;

    // Validar campos obrigatórios
    if (!aluno_id || !categoria || !titulo || !data ||
        !hora_inicio || !hora_fim) {
        const erro = new Error("Preencha todos os campos obrigatórios.");
        erro.status = 400;
        throw erro;
    }

    if (!Number.isInteger(aluno_id) || aluno_id <= 0) {
        const erro = new Error("ID do aluno inválido.");
        erro.status = 400;
        throw erro;
    }

    const categoriasPermitidas = ["treino", "aula", "avaliacao"];

    if (!categoriasPermitidas.includes(categoria)) {
        const erro = new Error("Categoria inválida.");
        erro.status = 400;
        throw erro;
    }

    if (typeof titulo !== "string" || !titulo.trim() || titulo.length > 150) {
        const erro = new Error("Título inválido.");
        erro.status = 400;
        throw erro;
    }

    if (!validarData(data)) {
        const erro = new Error("Data inválida.");
        erro.status = 400;
        throw erro;
    }

    if (!validarIntervalo(hora_inicio, hora_fim)) {
        const erro = new Error("Intervalo de horários inválido.");
        erro.status = 400;
        throw erro;
    }

    // Verificar aluno
    const [alunos] = await pool.query(
        `SELECT id FROM usuarios
         WHERE id = ? AND papel = 'aluno' AND ativo = TRUE`,
        [aluno_id]
    );

    if (alunos.length === 0) {
        const erro = new Error("Aluno não encontrado ou inativo.");
        erro.status = 404;
        throw erro;
    }

    // Verificar responsável, se informado
    if (responsavel_id !== undefined && responsavel_id !== null) {

        if (!Number.isInteger(responsavel_id) || responsavel_id <= 0) {
            const erro = new Error("ID do responsável inválido.");
            erro.status = 400;
            throw erro;
        }

        const [monitores] = await pool.query(
            `SELECT id FROM usuarios
             WHERE id = ? AND papel = 'monitor' AND ativo = TRUE`,
            [responsavel_id]
        );

        if (monitores.length === 0) {
            const erro = new Error("Monitor não encontrado ou inativo.");
            erro.status = 404;
            throw erro;
        }

        const [vinculos] = await pool.query(
            `SELECT id FROM vinculos_acompanhamento
             WHERE aluno_id = ? AND monitor_id = ?`,
            [aluno_id, responsavel_id]
        );

        if (vinculos.length === 0) {
            const erro = new Error("Monitor não possui vínculo com este aluno.");
            erro.status = 409;
            throw erro;
        }
    }

    // Atualizar somente se o evento ainda estiver agendado
    const [resultado] = await pool.query(
        `UPDATE agenda_eventos
         SET aluno_id = ?,
             categoria = ?,
             titulo = ?,
             descricao = ?,
             data = ?,
             hora_inicio = ?,
             hora_fim = ?,
             responsavel_id = ?,
             local = ?
         WHERE id = ? AND status = 'agendado'`,
        [
            aluno_id,
            categoria,
            titulo.trim(),
            descricao ?? null,
            data,
            hora_inicio,
            hora_fim,
            responsavel_id ?? null,
            local ?? null,
            Number(id)
        ]
    );

    if (resultado.affectedRows === 0) {
        const [eventos] = await pool.query(
            `SELECT id, status FROM agenda_eventos WHERE id = ?`,
            [id]
        );

        if (eventos.length === 0) {
            const erro = new Error("Evento não encontrado.");
            erro.status = 404;
            throw erro;
        }

        const erro = new Error("Não é possível editar um evento que não esteja agendado.");
        erro.status = 409;
        throw erro;
    }

    return {
        id: Number(id),
        aluno_id,
        categoria,
        titulo: titulo.trim(),
        descricao: descricao ?? null,
        data,
        hora_inicio,
        hora_fim,
        responsavel_id: responsavel_id ?? null,
        local: local ?? null,
        status: "agendado"
    };
}

async function alterarStatusEvento(id, novoStatus) {

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        const erro = new Error("ID do evento inválido.");
        erro.status = 400;
        throw erro;
    }

    const [resultado] = await pool.query(
        `UPDATE agenda_eventos
         SET status = ?
         WHERE id = ? AND status = 'agendado'`,
        [novoStatus, Number(id)]
    );

    if (resultado.affectedRows === 0) {

        const [eventos] = await pool.query(
            `SELECT id, status FROM agenda_eventos WHERE id = ?`,
            [Number(id)]
        );

        if (eventos.length === 0) {
            const erro = new Error("Evento não encontrado.");
            erro.status = 404;
            throw erro;
        }

        const erro = new Error(
            "Somente eventos agendados podem ter seu status alterado."
        );
        erro.status = 409;
        throw erro;
    }

    return {
        id: Number(id),
        status: novoStatus
    };
}

export async function cancelarEventoAgenda(id) {
    return await alterarStatusEvento(id, "cancelado");
}

export async function concluirEventoAgenda(id) {
    return await alterarStatusEvento(id, "concluido");
}