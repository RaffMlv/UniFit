import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { autenticar, autorizar } from '../middlewares/auth.js'

const router = Router()

const lista = z.array(z.string().max(100)).max(20)
const medida = (max) =>
  z.union([z.string(), z.number()])
    .transform((v) => (v === '' ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0 && v <= max))

const triagemSchema = z.object({
  objetivo: z.string().min(1).max(100),
  biotipo: z.string().min(1).max(200),
  experiencia: z.string().min(1).max(100),
  esportes: lista,
  outroEsporte: z.string().max(150).default(''),
  frequencia: z.string().min(1).max(50),
  peso: medida(500),
  altura: medida(300),
  prefiroNaoInformar: z.boolean(),
  possuiLimitacao: z.enum(['Sim', 'Não']),
  regioes: lista,
  descricaoLimitacao: z.string().max(2000).default(''),
  condicoes: lista.min(1),
  outraCondicao: z.string().max(200).default(''),
  aceitouTermo: z.boolean(),
})

router.post('/', autenticar, autorizar('aluno'), async (req, res) => {
  const parsed = triagemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ erro: 'Resposta inválida' })
  const d = parsed.data

  if (!d.aceitouTermo) return res.status(400).json({ erro: 'Confirme o termo de responsabilidade' })
  if (!d.prefiroNaoInformar && (d.peso === null || d.altura === null)) {
    return res.status(400).json({ erro: 'Informe peso e altura' })
  }
  const limitacao = d.possuiLimitacao === 'Sim'
  if (limitacao && !d.descricaoLimitacao.trim()) {
    return res.status(400).json({ erro: 'Descreva a limitação' })
  }

  await pool.query(
    `INSERT INTO triagens
      (usuario_id, objetivo, biotipo, experiencia, esportes, outro_esporte, frequencia,
       peso_kg, altura_cm, prefere_nao_informar, possui_limitacao, regioes,
       descricao_limitacao, condicoes, outra_condicao, aceitou_termo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       objetivo = VALUES(objetivo), biotipo = VALUES(biotipo),
       experiencia = VALUES(experiencia), esportes = VALUES(esportes),
       outro_esporte = VALUES(outro_esporte), frequencia = VALUES(frequencia),
       peso_kg = VALUES(peso_kg), altura_cm = VALUES(altura_cm),
       prefere_nao_informar = VALUES(prefere_nao_informar),
       possui_limitacao = VALUES(possui_limitacao), regioes = VALUES(regioes),
       descricao_limitacao = VALUES(descricao_limitacao), condicoes = VALUES(condicoes),
       outra_condicao = VALUES(outra_condicao), aceitou_termo = VALUES(aceitou_termo)`,
    [
      req.usuario.id, d.objetivo, d.biotipo, d.experiencia,
      JSON.stringify(d.esportes), d.outroEsporte, d.frequencia,
      d.prefiroNaoInformar ? null : d.peso, d.prefiroNaoInformar ? null : d.altura,
      d.prefiroNaoInformar, limitacao, JSON.stringify(limitacao ? d.regioes : []),
      limitacao ? d.descricaoLimitacao : null, JSON.stringify(d.condicoes),
      d.outraCondicao, d.aceitouTermo,
    ])

  res.status(201).json({ mensagem: 'Triagem salva' })
})

export default router