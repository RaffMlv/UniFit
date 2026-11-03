import { pool } from "../config/db.js";

function criarErro(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

export async function buscarMonitorVinculado(alunoId, especialidade) {
    const [rows] = await pool.query(
        `SELECT v.monitor_id
        FROM vinculos_acompanhamento v
        JOIN usuarios u ON u.id = v.monitor_id
        WHERE v.aluno_id = ?
            AND v.especialidade = ? 
            AND u.papel = 'monitor'
            AND u.ativo = TRUE`,
            [alunoId, especialidade]
    );

    if(rows.length === 0){
        throw new Error("Nenhum monitor vinculado encontrado para essa especialidade.");
    }
    return rows[0].monitor_id;
}

export async function buscarDisponibilidade(monitorId, diaSemana) {
    const [rows] = await pool.query(
        `SELECT id, hora_inicio, hora_fim,
                duracao_minutos, intervalo_minutos
         FROM disponibilidades_semanais
         WHERE monitor_id = ?
           AND dia_semana = ?
           AND ativo = TRUE
         ORDER BY hora_inicio`,
        [monitorId, diaSemana]
    );

    return rows;
}

export async function buscarAgendamentosDoMonitor(monitorId, data) {
    const [rows] = await pool.query(
        `SELECT hora_inicio, hora_fim
         FROM agendamentos
         WHERE monitor_id = ?
           AND data = ?
           AND status = 'agendado'`,
        [monitorId, data]
    );

    return rows;
}

function obterDiaSemana(data) {
    const [ano, mes, dia] = data.split("-").map(Number);

    const diaSemana = new Date(
        Date.UTC(ano, mes - 1, dia)
    ).getUTCDay();

    return diaSemana === 0 ? 7 : diaSemana;
}

function gerarHorarios(disponibilidades, agendamentos) {
    const horariosDisponiveis = [];

    for (const disponibilidade of disponibilidades) {
        const inicio = disponibilidade.hora_inicio;
        const fim = disponibilidade.hora_fim;

        const duracao = disponibilidade.duracao_minutos;
        const intervalo = disponibilidade.intervalo_minutos;

        let horarioAtual = inicio;

        while (true) {
            const horarioFim = somarMinutos(horarioAtual, duracao);

            if (horarioFim > fim) {
                break;
            }

            const conflito = agendamentos.some(agendamento =>
                horarioEmMinutos(horarioAtual) < horarioEmMinutos(agendamento.hora_fim) &&
                horarioEmMinutos(horarioFim) > horarioEmMinutos(agendamento.hora_inicio)
            );

            if (!conflito) {
                horariosDisponiveis.push({
                    hora_inicio: horarioAtual,
                    hora_fim: horarioFim
                });
            }

            horarioAtual = somarMinutos(horarioFim, intervalo);
        }
    }

    return horariosDisponiveis;
}

function somarMinutos(horario, minutos) {
    const [horas, mins] = horario.split(":").map(Number);

    const total = horas * 60 + mins + minutos;

    const novasHoras = Math.floor(total / 60);
    const novosMinutos = total % 60;

    return `${String(novasHoras).padStart(2, "0")}:${String(novosMinutos).padStart(2, "0")}:00`;
}

export async function listarHorariosDisponiveis(alunoId, data, especialidade) {
    validarData(data);
    const monitorId = await buscarMonitorVinculado(alunoId, especialidade);

    const diaSemana = obterDiaSemana(data);

    const disponibilidades = await buscarDisponibilidade(
        monitorId,
        diaSemana
    );

    const agendamentos = await buscarAgendamentosDoMonitor(
        monitorId,
        data
    );

    const horarios = gerarHorarios(disponibilidades, agendamentos);

    return horarios;
}

function horarioEmMinutos(horario) {
    const [horas, minutos] = horario.split(":").map(Number);

    return horas * 60 + minutos;
}

function validarData(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw criarErro("Formato de data inválido. Use YYYY-MM-DD.", 400);
    }

    const [ano, mes, dia] = data.split("-").map(Number);

    const dataInformada = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        dataInformada.getUTCFullYear() !== ano ||
        dataInformada.getUTCMonth() !== mes - 1 ||
        dataInformada.getUTCDate() !== dia
    ) {
        throw criarErro("Data inexistente.", 400);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataLocal = new Date(ano, mes - 1, dia);

    if (dataLocal < hoje) {
        throw criarErro("Não é possível agendar em uma data passada.", 400);
    }
}


function validarDadosAgendamento(data, horaInicio, especialidade) {
    validarData(data);

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!formatoHora.test(horaInicio)) {
        throw criarErro("Horário inválido.", 400);
    }

    const especialidadesPermitidas = [
        "educacao_fisica",
        "nutricao",
        "fisioterapia"
    ];

    if (!especialidadesPermitidas.includes(especialidade)) {
        throw criarErro("Especialidade inválida.", 400);
    }
}

function normalizarHora(horario) {
    return horario.length === 5 ? `${horario}:00` : horario;
}

export async function criarAgendamento(alunoId, data, horaInicio, especialidade) {
    validarDadosAgendamento(data, horaInicio, especialidade);

    horaInicio = normalizarHora(horaInicio);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Busca o monitor vinculado ao aluno
        const [vinculos] = await connection.query(
            `SELECT v.monitor_id
             FROM vinculos_acompanhamento v
             JOIN usuarios u ON u.id = v.monitor_id
             WHERE v.aluno_id = ?
               AND v.especialidade = ?
               AND u.papel = 'monitor'
               AND u.ativo = TRUE
             FOR UPDATE`,
            [alunoId, especialidade]
        );

        if (vinculos.length === 0) {
            throw criarErro("Monitor vinculado não encontrado.", 404);
        }

        const monitorId = vinculos[0].monitor_id;

        // Bloqueia a linha do aluno durante a operação
        await connection.query(
            "SELECT id FROM usuarios WHERE id = ? FOR UPDATE",
            [alunoId]
        );

        const diaSemana = obterDiaSemana(data);

        // Busca e bloqueia as disponibilidades do monitor
        const [disponibilidades] = await connection.query(
            `SELECT hora_inicio, hora_fim,
                    duracao_minutos, intervalo_minutos
             FROM disponibilidades_semanais
             WHERE monitor_id = ?
               AND dia_semana = ?
               AND ativo = TRUE
             ORDER BY hora_inicio
             FOR UPDATE`,
            [monitorId, diaSemana]
        );

        // Verifica se o horário solicitado pertence à escala
        let horaFim = null;

        for (const disponibilidade of disponibilidades) {
            let horarioAtual = disponibilidade.hora_inicio;
            const fim = disponibilidade.hora_fim;

            while (true) {
                const horarioFim = somarMinutos(
                    horarioAtual,
                    disponibilidade.duracao_minutos
                );

                if (horarioFim > fim) break;

                console.log("Horário solicitado:", horaInicio);
                console.log("Horário da escala:", disponibilidade.hora_inicio);
                console.log("Fim da escala:", disponibilidade.hora_fim);
                console.log("Horário atual:", horarioAtual);

                if (horarioAtual === horaInicio) {
                    horaFim = horarioFim;
                    break;
                }

                horarioAtual = somarMinutos(
                    horarioFim,
                    disponibilidade.intervalo_minutos
                );
            }

            if (horaFim) break;
        }

        if (!horaFim) {
            throw criarErro("Horário não disponível na escala do monitor.", 409);
        }

        // Verifica conflitos do monitor
        const [conflitosMonitor] = await connection.query(
            `SELECT id FROM agendamentos
             WHERE monitor_id = ?
               AND data = ?
               AND status = 'agendado'
               AND hora_inicio < ?
               AND hora_fim > ?
             FOR UPDATE`,
            [monitorId, data, horaFim, horaInicio]
        );

        if (conflitosMonitor.length > 0) {
            throw criarErro("Esse horário já foi reservado.", 409);
        }

        // Verifica conflitos do aluno
        const [conflitosAluno] = await connection.query(
            `SELECT id FROM agendamentos
             WHERE aluno_id = ?
               AND data = ?
               AND status = 'agendado'
               AND hora_inicio < ?
               AND hora_fim > ?
             FOR UPDATE`,
            [alunoId, data, horaFim, horaInicio]
        );

        if (conflitosAluno.length > 0) {
            throw criarErro("Você já possui um agendamento nesse horário.", 409);
        }

        // Insere o agendamento
        const [resultado] = await connection.query(
            `INSERT INTO agendamentos
                (aluno_id, monitor_id, especialidade,
                 data, hora_inicio, hora_fim)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [alunoId, monitorId, especialidade, data, horaInicio, horaFim]
        );

        await connection.commit();

        return {
            id: resultado.insertId,
            aluno_id: alunoId,
            monitor_id: monitorId,
            especialidade,
            data,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            status: "agendado"
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

export async function listarAgendamentosDoAluno(alunoId) {
    const [rows] = await pool.query(
        `SELECT
            a.id,
            a.data,
            a.hora_inicio,
            a.hora_fim,
            a.especialidade,
            a.status,
            a.criado_em,
            u.nome AS monitor_nome
         FROM agendamentos a
         JOIN usuarios u ON u.id = a.monitor_id
         WHERE a.aluno_id = ?
         ORDER BY a.data DESC, a.hora_inicio DESC`,
        [alunoId]
    );

    return rows;
}

export async function cancelarAgendamento(alunoId, agendamentoId) {
    const [resultado] = await pool.query(
        `UPDATE agendamentos
         SET status = 'cancelado'
         WHERE id = ?
           AND aluno_id = ?
           AND status = 'agendado'
           AND data >= CURDATE()`,
        [agendamentoId, alunoId]
    );

    if (resultado.affectedRows === 0) {
        throw criarErro(
            "Agendamento não encontrado, já cancelado ou não pode mais ser cancelado.",
            409
        );
    }

    return {
        mensagem: "Agendamento cancelado com sucesso."
    };
}