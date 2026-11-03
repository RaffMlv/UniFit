import {
    buscarEventosDaAgenda,
    criarEventoAgenda,
    atualizarEventoAgenda,
    cancelarEventoAgenda,
    concluirEventoAgenda
} from "../services/agenda.service.js";

export async function listarAgenda(req, res, next) {
    try {
        const alunoId = req.usuario.id;
        const { inicio, fim } = req.query;

        if (!inicio || !fim) {
            return res.status(400).json({
                erro: "Informe as datas de início e fim."
            });
        }

        const eventos = await buscarEventosDaAgenda(
            alunoId,
            inicio,
            fim
        );

        return res.status(200).json({ eventos });

    } catch (error) {
        next(error);
    }
}

export async function criarEvento(req, res, next) {
    try {
        const evento = await criarEventoAgenda(req.body);

        return res.status(201).json({
            mensagem: "Evento criado com sucesso.",
            evento
        });

    } catch (error) {
        next(error);
    }
}

export async function atualizarEvento(req, res, next) {
    try {
        const { id } = req.params;

        const evento = await atualizarEventoAgenda(id, req.body);

        return res.status(200).json({
            mensagem: "Evento atualizado com sucesso.",
            evento
        });

    } catch (error) {
        next(error);
    }
}

export async function cancelarEvento(req, res, next) {
    try {
        const { id } = req.params;

        const evento = await cancelarEventoAgenda(id);

        return res.status(200).json({
            mensagem: "Evento cancelado com sucesso.",
            evento
        });

    } catch (error) {
        next(error);
    }
}

export async function concluirEvento(req, res, next) {
    try {
        const { id } = req.params;

        const evento = await concluirEventoAgenda(id);

        return res.status(200).json({
            mensagem: "Evento concluído com sucesso.",
            evento
        });

    } catch (error) {
        next(error);
    }
}