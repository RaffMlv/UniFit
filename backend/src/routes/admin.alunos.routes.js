import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { autenticar, autorizar } from '../middlewares/auth.js'

const router = Router()
router.use(autenticar, autorizar('admin')) // tudo aqui é exclusivo do admin

const consultaSchema = z.object({
  busca: z.string().trim().max(100).default(''),
  situacao: z.enum(['todos', 'ativos', 'inativos']).default('todos'),
  triagem: z.enum(['todas', 'concluida', 'pendente']).default('todas'),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
})

const mascararCpf = (cpf) => `***.***.***-${String(cpf).slice(9)}`
const escaparLike = (v) => v.replace(/[\\%_]/g, '\\$&')
const lerId = (req) => {
  const id = Number(req.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

const paraApi = (r) => ({
  id: r.id,
  nome: r.nome,
  cpf: mascararCpf(r.cpf),
  email: r.email,
  ativo: Boolean(r.ativo),
  triagemConcluida: Boolean(r.triagem_concluida),
  criadoEm: r.criado_em,
})

const JUNCAO = 'FROM usuarios u LEFT JOIN triagens t ON t.usuario_id = u.id'

// Lista paginada, com busca e filtros
router.get('/', async (req, res) => {
  const q = consultaSchema.safeParse(req.query)
  if (!q.success) return res.status(400).json({ erro: 'Filtros inválidos' })
  const f = q.data

  const where = ["u.papel = 'aluno'"]
  const params = []

  if (f.situacao !== 'todos') {
    where.push('u.ativo = ?')
    params.push(f.situacao === 'ativos')
  }
  if (f.triagem === 'concluida') where.push('t.usuario_id IS NOT NULL')
  if (f.triagem === 'pendente') where.push('t.usuario_id IS NULL')

  if (f.busca) {
    const termo = `%${escaparLike(f.busca)}%`
    const digitos = f.busca.replace(/\D/g, '')
    if (digitos.length >= 3) { // permite buscar por parte do CPF
      where.push('(u.nome LIKE ? OR u.email LIKE ? OR u.cpf LIKE ?)')
      params.push(termo, termo, `%${digitos}%`)
    } else {
      where.push('(u.nome LIKE ? OR u.email LIKE ?)')
      params.push(termo, termo)
    }
  }
  const clausula = `WHERE ${where.join(' AND ')}`

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${JUNCAO} ${clausula}`, params)
  const [rows] = await pool.query(
    `SELECT u.id, u.nome, u.cpf, u.email, u.ativo, u.criado_em,
            t.usuario_id IS NOT NULL AS triagem_concluida
     ${JUNCAO} ${clausula} ORDER BY u.nome LIMIT ? OFFSET ?`,
    [...params, f.limite, (f.pagina - 1) * f.limite])

  res.json({ total, pagina: f.pagina, limite: f.limite, itens: rows.map(paraApi) })
})

// Página administrativa do aluno. Não devolve as respostas de saúde da triagem:
// elas ficam restritas ao monitor vinculado (RNF38).
router.get('/:id', async (req, res) => {
  const id = lerId(req)
  if (!id) return res.status(404).json({ erro: 'Aluno não encontrado' })

  const [rows] = await pool.query(
    `SELECT u.id, u.nome, u.cpf, u.email, u.ativo, u.criado_em,
            t.usuario_id IS NOT NULL AS triagem_concluida,
            t.objetivo, t.frequencia, t.atualizado_em AS triagem_em
     ${JUNCAO} WHERE u.id = ? AND u.papel = 'aluno'`, [id])
  const r = rows[0]
  if (!r) return res.status(404).json({ erro: 'Aluno não encontrado' })

  res.json({
    ...paraApi(r),
    triagem: {
      concluida: Boolean(r.triagem_concluida),
      objetivo: r.objetivo ?? null,
      frequencia: r.frequencia ?? null,
      atualizadaEm: r.triagem_em ?? null,
    },
  })
})

// Ativar ou desativar o acesso do aluno
router.patch('/:id/situacao', async (req, res) => {
  const id = lerId(req)
  const p = z.object({ ativo: z.boolean() }).safeParse(req.body)
  if (!id || !p.success) return res.status(400).json({ erro: 'Requisição inválida' })

  const [existe] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND papel = 'aluno'", [id])
  if (!existe.length) return res.status(404).json({ erro: 'Aluno não encontrado' })

  await pool.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [p.data.ativo, id])
  res.json({ id, ativo: p.data.ativo })
})

export default router