import {
    listarHorariosDisponiveis,
    criarAgendamento,
    listarAgendamentosDoAluno,
    cancelarAgendamento
} from "../services/agendamentos.service.js";

export async function consultarHorarios(req, res, next) {
    try {
        const alunoId = req.usuario.id;
        const { data, especialidade } = req.query;

        const horarios = await listarHorariosDisponiveis(
            alunoId,
            data,
            especialidade
        );

        return res.status(200).json(horarios);

    } catch (error) {
        next(error);
    }
}

export async function agendar(req, res, next) {
    try {
        const alunoId = req.usuario.id;
        const { data, hora_inicio, especialidade } = req.body;

        const agendamento = await criarAgendamento(
            alunoId,
            data,
            hora_inicio,
            especialidade
        );

        return res.status(201).json(agendamento);

    } catch (error) {
        next(error);
    }
}

export async function listarMeusAgendamentos(req, res, next) {
    try {
        const alunoId = req.usuario.id;

        const agendamentos = await listarAgendamentosDoAluno(alunoId);

        return res.status(200).json(agendamentos);

    } catch (error) {
        next(error);
    }
}

export async function cancelar(req, res, next) {
    try {
        const alunoId = req.usuario.id;
        const { id } = req.params;

        const resultado = await cancelarAgendamento(alunoId, id);

        return res.status(200).json(resultado);

    } catch (error) {
        next(error);
    }
}