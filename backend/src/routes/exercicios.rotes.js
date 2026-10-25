import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { autenticar, autorizar } from '../middlewares/auth.js'

const router = Router()

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado']
const url = z.string().trim().max(500).refine((v) => v === '' || /^https?:\/\//i.test(v), { message: 'Link inválido' })

const exercicioSchema = z.object({
  nome: z.string().trim().min(3).max(150),
  musculo: z.string().trim().min(1).max(60),
  secundarios: z.string().trim().max(200).default(''),
  equipamento: z.string().trim().min(1).max(60),
  nivel: z.enum(NIVEIS),
  categoria: z.string().trim().min(1).max(40).default('Força'),
  instrucoes: z.string().trim().min(1).max(5000),
  observacoes: z.string().trim().max(2000).default(''),
  imagem: url.default(''),
  video: url.default(''),
  ativo: z.boolean().default(true),
})

const listaQuery = z.object({
  busca: z.string().trim().max(100).default(''),
  musculo: z.string().trim().max(60).optional(),
  equipamento: z.string().trim().max(60).optional(),
  nivel: z.enum(NIVEIS).optional(),
  categoria: z.string().trim().max(40).optional(),
  situacao: z.enum(['todos', 'ativos', 'inativos']).default('ativos'),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(50),
})

const COLUNAS = `id, nome, musculo, secundarios, equipamento, nivel, categoria,
  instrucoes, observacoes, imagem_url AS imagem, video_url AS video, ativo`

const paraBanco = (d) => [
  d.nome, d.musculo, d.secundarios, d.equipamento, d.nivel, d.categoria,
  d.instrucoes, d.observacoes || null, d.imagem || null, d.video || null, d.ativo,
]

const normalizar = (r) => ({ ...r, ativo: Boolean(r.ativo) })
const erroDuplicado = (err) => err?.code === 'ER_DUP_ENTRY'

// Listagem com busca e filtros. Qualquer usuário autenticado lê; só admin vê inativos.
router.get('/', autenticar, async (req, res) => {
  const parsed = listaQuery.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ erro: 'Filtros inválidos' })
  const q = parsed.data
  const ehAdmin = req.usuario.papel === 'admin'
  const situacao = ehAdmin ? q.situacao : 'ativos'

  const where = []
  const params = []
  if (situacao !== 'todos') { where.push('ativo = ?'); params.push(situacao === 'ativos') }
  if (q.busca) {
    const termo = `%${q.busca.replace(/[\\%_]/g, '\\$&')}%`
    where.push('(nome LIKE ? OR musculo LIKE ? OR equipamento LIKE ?)')
    params.push(termo, termo, termo)
  }
  for (const campo of ['musculo', 'equipamento', 'nivel', 'categoria']) {
    if (q[campo]) { where.push(`${campo} = ?`); params.push(q[campo]) }
  }
  const clausula = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM exercicios ${clausula}`, params)
  const [rows] = await pool.query(
    `SELECT ${COLUNAS} FROM exercicios ${clausula} ORDER BY nome LIMIT ? OFFSET ?`,
    [...params, q.limite, (q.pagina - 1) * q.limite])

  res.json({ total, pagina: q.pagina, limite: q.limite, itens: rows.map(normalizar) })
})

// Valores disponíveis para os selects de filtro.
router.get('/filtros', autenticar, async (req, res) => {
  const ativo = req.usuario.papel === 'admin' ? '' : 'WHERE ativo = TRUE'
  const distintos = async (campo) => {
    const [r] = await pool.query(`SELECT DISTINCT ${campo} AS v FROM exercicios ${ativo} ORDER BY ${campo}`)
    return r.map((x) => x.v)
  }
  const [musculos, equipamentos, categorias] = await Promise.all(
    ['musculo', 'equipamento', 'categoria'].map(distintos))
  res.json({ musculos, equipamentos, categorias, niveis: NIVEIS })
})

router.get('/:id', autenticar, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido' })
  const [rows] = await pool.query(`SELECT ${COLUNAS} FROM exercicios WHERE id = ?`, [id])
  const ex = rows[0]
  if (!ex || (!ex.ativo && req.usuario.papel !== 'admin')) {
    return res.status(404).json({ erro: 'Exercício não encontrado' })
  }
  res.json(normalizar(ex))
})

router.post('/', autenticar, autorizar('admin'), async (req, res) => {
  const parsed = exercicioSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ erro: parsed.error.issues.map((i) => i.message).join(', ') })
  try {
    const [r] = await pool.query(
      `INSERT INTO exercicios (nome, musculo, secundarios, equipamento, nivel, categoria,
         instrucoes, observacoes, imagem_url, video_url, ativo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`, paraBanco(parsed.data))
    const [rows] = await pool.query(`SELECT ${COLUNAS} FROM exercicios WHERE id = ?`, [r.insertId])
    res.status(201).json(normalizar(rows[0]))
  } catch (err) {
    if (erroDuplicado(err)) return res.status(409).json({ erro: 'Já existe um exercício com esse nome' })
    throw err
  }
})

router.put('/:id', autenticar, autorizar('admin'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido' })
  const parsed = exercicioSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ erro: parsed.error.issues.map((i) => i.message).join(', ') })
  try {
    const [r] = await pool.query(
      `UPDATE exercicios SET nome=?, musculo=?, secundarios=?, equipamento=?, nivel=?, categoria=?,
         instrucoes=?, observacoes=?, imagem_url=?, video_url=?, ativo=? WHERE id=?`,
      [...paraBanco(parsed.data), id])
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Exercício não encontrado' })
    const [rows] = await pool.query(`SELECT ${COLUNAS} FROM exercicios WHERE id = ?`, [id])
    res.json(normalizar(rows[0]))
  } catch (err) {
    if (erroDuplicado(err)) return res.status(409).json({ erro: 'Já existe um exercício com esse nome' })
    throw err
  }
})

// Em vez de exclusão permanente, ativa/desativa (preserva histórico das fichas).
router.patch('/:id/situacao', autenticar, autorizar('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const parsed = z.object({ ativo: z.boolean() }).safeParse(req.body)
  if (!Number.isInteger(id) || id < 1 || !parsed.success) return res.status(400).json({ erro: 'Requisição inválida' })
  const [r] = await pool.query('UPDATE exercicios SET ativo = ? WHERE id = ?', [parsed.data.ativo, id])
  if (r.affectedRows === 0) return res.status(404).json({ erro: 'Exercício não encontrado' })
  res.json({ id, ativo: parsed.data.ativo })
})

export default router