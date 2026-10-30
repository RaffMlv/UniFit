import { Router } from "express";
import { z } from "zod";
import { autenticar, autorizar } from "../middlewares/auth.js";
import {
    criarVinculo,
    listarVinculosDoMonitor,
    listarVinculosDoAluno,
    removerVinculo
} from '../services/vinculos.service.js'
const router = Router()

router.use(autenticar)

const vinculoSchema = z.object({
    aluno_id: z.coerce.number().int().positive(),
    monitor_id: z.coerce.number().int().positive(),
    especialidade: z.enum([
        'educacao_fisica',
        'nutricao',
        'fisioterapia'
    ])
})

router.post('/', autorizar('admin'), async (req, res) => {
    try {
        const dados = vinculoSchema.safeParse(req.body)

        if (!dados.success) {
            return res.status(400).json({
                erro: 'Requisição inválida. Informe aluno_id, monitor_id e uma especialidade válida: educacao_fisica, nutricao ou fisioterapia.'
            })
        }

        const { aluno_id, monitor_id, especialidade } = dados.data

        const vinculo = await criarVinculo(
            aluno_id,
            monitor_id,
            especialidade
        )

        return res.status(201).json({
            mensagem: 'Vínculo criado com sucesso',
            vinculo
        })

    } catch (erro){
        return res.status(erro.status || 500).json({
            erro: erro.message || 'Erro interno do servidor'
        })
    }
})

router.get('/meus', autorizar('monitor'), async (req, res) => {
    try {
        const vinculos = await listarVinculosDoMonitor(req.usuario.id)

        return res.status(200).json(vinculos)

    } catch (erro) {
        return res.status(erro.status || 500).json({
            erro: erro.message || 'Erro interno do servidor'
        })
    }
})

router.get('/aluno/:alunoId', autorizar('admin'), async (req, res) => {
    try {
        const alunoId = Number(req.params.alunoId)

        if (!Number.isInteger(alunoId) || alunoId <= 0) {
            return res.status(400).json({
                erro: 'ID do aluno inválido'
            })
        }

        const vinculos = await listarVinculosDoAluno(alunoId)

        return res.status(200).json(vinculos)

    } catch (erro) {
        return res.status(erro.status || 500).json({
            erro: erro.message || 'Erro interno do servidor'
        })
    }
})

router.delete('/:id', autorizar('admin'), async (req, res) => {
    try {
        const vinculoId = Number(req.params.id)

        if (!Number.isInteger(vinculoId) || vinculoId <= 0) {
            return res.status(400).json({
                erro: 'ID do vínculo inválido'
            })
        }

        const resultado = await removerVinculo(vinculoId)

        return res.status(200).json(resultado)

    } catch (erro) {
        return res.status(erro.status || 500).json({
            erro: erro.message || 'Erro interno do servidor'
        })
    }
})

export default router