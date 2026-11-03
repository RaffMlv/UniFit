import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { autenticar, autorizar, autorizarEspecialidade } from '../middlewares/auth.js'

const router = Router()
router.use(autenticar)

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

const itemSchema = z.object({
  exercicioId: z.coerce.number().int().positive(),
  series: z.coerce.number().int().min(1).max(20),
  repeticoes: z.coerce.number().int().min(1).max(100),
  carga: z.union([z.string(), z.number()])
    .transform((v) => (v === '' ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 999.9)),
  descanso: z.coerce.number().int().min(0).max(600),
  observacoes: z.string().trim().max(500).default(''),
})

const fichaBase = z.object({
  nome: z.string().trim().min(3).max(120),
  objetivo: z.string().trim().min(2).max(100),
  status: z.enum(['rascunho', 'publicada']),
  divisoes: z.array(z.object({
    letra: z.enum(LETRAS),
    diasSemana: z.array(
    z.coerce.number().int().min(0).max(6)
    ).max(7).default([]),
    exercicios: z.array(itemSchema).max(30),
  })).min(1).max(6),
})

function erroDaFicha(d) {
  const letras = d.divisoes.map((x) => x.letra)
  if (new Set(letras).size !== letras.length) return 'Divisões repetidas'
  if (d.status === 'publicada' && d.divisoes.some((x) => x.exercicios.length === 0)) {
    return 'Adicione ao menos um exercício a cada divisão antes de publicar'
  }
  return null
}

const lerId = (req, nome = 'id') => {
  const n = Number(req.params[nome])
  return Number.isInteger(n) && n > 0 ? n : null
}

const SELECT_FICHA = `
  SELECT
    f.id,
    f.aluno_id,
    f.criada_por,
    f.nome,
    f.objetivo,
    f.status,
    f.atualizado_em,

    d.id AS divisao_id,
    d.letra,

    fe.id AS item_id,
    fe.ordem,
    fe.series,
    fe.repeticoes,
    fe.descanso_seg,

    e.id AS exercicio_id,
    e.nome AS exercicio_nome,

    fd.dia_semana,

    IF(fa.ficha_id IS NULL, 0, 1) AS atual

  FROM fichas f

  LEFT JOIN fichas_atuais fa
    ON fa.ficha_id = f.id
    AND fa.aluno_id = f.aluno_id
    AND fa.especialidade = 'educacao_fisica'

  JOIN ficha_divisoes d
    ON d.ficha_id = f.id

  LEFT JOIN ficha_exercicios fe
    ON fe.divisao_id = d.id

  LEFT JOIN exercicios e
    ON e.id = fe.exercicio_id

  LEFT JOIN ficha_divisao_dias fd
    ON fd.divisao_id = d.id
`;

const ORDEM = `ORDER BY f.atualizado_em DESC, f.id, d.letra, fe.ordem`;

function agrupar(rows) {
  const fichas = new Map()

  for (const r of rows) {
    if (!fichas.has(r.id)) {
      fichas.set(r.id, {
        id: r.id,
        alunoId: r.aluno_id,
        nome: r.nome,
        objetivo: r.objetivo,
        status: r.status,
        atual: Boolean(r.atual),
        atualizadaEm: r.atualizado_em,
        divisoes: new Map(),
      })
    }

    const f = fichas.get(r.id)

    if (!f.divisoes.has(r.letra)) {
      f.divisoes.set(r.letra, {
        letra: r.letra,
        diasSemana: [],
        exercicios: [],
        itensAdicionados: new Set(),
      })
    }

    const divisao = f.divisoes.get(r.letra)

    // Adiciona os dias da divisão sem duplicá-los
    if (
      r.dia_semana !== null &&
      !divisao.diasSemana.includes(r.dia_semana)
    ) {
      divisao.diasSemana.push(r.dia_semana)
    }

    // Adiciona cada exercício somente uma vez
    if (r.item_id && !divisao.itensAdicionados.has(r.item_id)) {
      divisao.itensAdicionados.add(r.item_id)

      divisao.exercicios.push({
        exercicioId: r.exercicio_id,
        nome: r.exercicio_nome,
        musculo: r.musculo,
        equipamento: r.equipamento,
        imagem: r.imagem_url || null,
        ativo: Boolean(r.exercicio_ativo),
        series: r.series,
        repeticoes: r.repeticoes,
        carga: r.carga_kg === null ? null : Number(r.carga_kg),
        descanso: r.descanso_seg,
        observacoes: r.observacoes,
      })
    }
  }

  return [...fichas.values()].map(f => ({
    ...f,
    divisoes: [...f.divisoes.values()].map(divisao => {
      const { itensAdicionados, ...dadosDivisao } = divisao
      return dadosDivisao
    }),
  }))
}
async function transacao(fn) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const r = await fn(conn)
    await conn.commit()
    return r
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

async function gravarEstrutura(conn, fichaId, divisoes) {
  for (const d of divisoes) {
    // Cria a divisão da ficha
    const [r] = await conn.query(
      'INSERT INTO ficha_divisoes (ficha_id, letra) VALUES (?, ?)',
      [fichaId, d.letra]
    )

    const divisaoId = r.insertId

    // Registra os dias da semana em que a divisão será realizada
    for (const dia of d.diasSemana) {
      await conn.query(
        `INSERT INTO ficha_divisao_dias
          (divisao_id, dia_semana)
         VALUES (?, ?)`,
        [divisaoId, dia]
      )
    }

    // Registra os exercícios da divisão
    for (let i = 0; i < d.exercicios.length; i++) {
      const x = d.exercicios[i]

      await conn.query(
        `INSERT INTO ficha_exercicios
          (divisao_id, exercicio_id, ordem, series, repeticoes, carga_kg, descanso_seg, observacoes)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          divisaoId,
          x.exercicioId,
          i,
          x.series,
          x.repeticoes,
          x.carga,
          x.descanso,
          x.observacoes
        ]
      )
    }
  }
}

function tratarErro(err, res) {
  if (err.errno === 1452) return res.status(400).json({ erro: 'Exercício inválido na ficha' })
  throw err
}

// --- Aluno: só lê as fichas publicadas dele -------------------------------
router.get('/minhas', autorizar('aluno'), async (req, res) => {
  const [rows] = await pool.query(
    `${SELECT_FICHA} WHERE f.aluno_id = ? AND f.status = 'publicada' ${ORDEM}`, [req.usuario.id])
  res.json({ fichas: agrupar(rows) })
})

router.get('/admin/todas', autorizar('admin'), async (req, res) => {
  try {
    // Busca todas as fichas
    const [rows] = await pool.query(
      `${SELECT_FICHA} ${ORDEM}`
    )

    const fichas = agrupar(rows)

    if (fichas.length === 0) {
      return res.json({ fichas: [] })
    }

    // Obtém os IDs dos alunos que possuem fichas
    const alunoIds = [...new Set(fichas.map(ficha => ficha.alunoId))]

    // Busca os alunos
    const [alunos] = await pool.query(
      `SELECT id, nome
       FROM usuarios
       WHERE id IN (?) AND papel = 'aluno'`,
      [alunoIds]
    )

    // Busca os monitores vinculados aos alunos em Educação Física
    const [vinculos] = await pool.query(
      `SELECT
         va.aluno_id,
         m.id AS monitor_id,
         m.nome AS monitor_nome
       FROM vinculos_acompanhamento va
       JOIN usuarios m ON m.id = va.monitor_id
       WHERE va.aluno_id IN (?)
         AND va.especialidade = 'educacao_fisica'
         AND m.papel = 'monitor'`,
      [alunoIds]
    )

    const alunosPorId = new Map(
      alunos.map(aluno => [aluno.id, aluno])
    )

    const monitoresPorAluno = new Map(
      vinculos.map(vinculo => [
        vinculo.aluno_id,
        {
          id: vinculo.monitor_id,
          nome: vinculo.monitor_nome
        }
      ])
    )

    // Monta o resultado que será enviado ao frontend
    const resultado = fichas.map(ficha => ({
      ...ficha,
      aluno: alunosPorId.get(ficha.alunoId) || null,
      monitor: monitoresPorAluno.get(ficha.alunoId) || null,
      situacao: ficha.status
    }))

    res.json({ fichas: resultado })

  } catch (err) {
    console.error('Erro ao listar fichas administrativas:', err)
    res.status(500).json({ erro: 'Erro ao buscar fichas' })
  }
})

// --- Monitor e admin -------------------------------------------------------
// ATENÇÃO: ainda não há vínculo monitor-aluno. Até existir, qualquer monitor ou admin
// altera a ficha de qualquer aluno. Fechar isso na Sprint 3 (RF23.7).

// Dados do aluno e todas as fichas dele (rascunhos inclusos)
router.get('/aluno/:alunoId', autorizar('monitor', 'admin'), autorizarEspecialidade('educacaofisica'), async (req, res) => {
  const alunoId = lerId(req, 'alunoId')
  if (!alunoId) return res.status(404).json({ erro: 'Aluno não encontrado' })
  const [alunos] = await pool.query(
    "SELECT id, nome FROM usuarios WHERE id = ? AND papel = 'aluno'", [alunoId])
  if (!alunos[0]) return res.status(404).json({ erro: 'Aluno não encontrado' })
  const [rows] = await pool.query(`${SELECT_FICHA} WHERE f.aluno_id = ? ${ORDEM}`, [alunoId])
  res.json({ aluno: alunos[0], fichas: agrupar(rows) })
})

router.get('/:id', autorizar('monitor', 'admin'), autorizarEspecialidade('educacao_fisica'), async (req, res) => {
  const id = lerId(req)
  if (!id) return res.status(404).json({ erro: 'Ficha não encontrada' })
  const [rows] = await pool.query(`${SELECT_FICHA} WHERE f.id = ? ${ORDEM}`, [id])
  const ficha = agrupar(rows)[0]
  if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' })
  const [[aluno]] = await pool.query('SELECT id, nome FROM usuarios WHERE id = ?', [ficha.alunoId])
  res.json({ aluno, ficha })
})

router.post('/', autorizar('monitor', 'admin'), autorizarEspecialidade('educacao_fisica'), async (req, res) => {
  const p = fichaBase.extend({ alunoId: z.coerce.number().int().positive() }).safeParse(req.body)
  if (!p.success) return res.status(400).json({ erro: 'Resposta inválida' })
  const erro = erroDaFicha(p.data)
  if (erro) return res.status(400).json({ erro })

  const [aluno] = await pool.query(
    "SELECT id FROM usuarios WHERE id = ? AND papel = 'aluno' AND ativo = TRUE", [p.data.alunoId])
  if (!aluno.length) return res.status(404).json({ erro: 'Aluno não encontrado' })

  try {
    const id = await transacao(async (conn) => {
      const [r] = await conn.query(
        'INSERT INTO fichas (aluno_id, criada_por, nome, objetivo, status) VALUES (?,?,?,?,?)',
        [p.data.alunoId, req.usuario.id, p.data.nome, p.data.objetivo, p.data.status])
      await gravarEstrutura(conn, r.insertId, p.data.divisoes)
      return r.insertId
    })
    res.status(201).json({ id })
  } catch (err) {
    tratarErro(err, res)
  }
})

// Substitui a estrutura inteira da ficha
router.put('/:id', autorizar('monitor', 'admin'), autorizarEspecialidade('educacao_fisica'), async (req, res) => {
  const id = lerId(req)
  if (!id) return res.status(404).json({ erro: 'Ficha não encontrada' })
  const p = fichaBase.safeParse(req.body)
  if (!p.success) return res.status(400).json({ erro: 'Resposta inválida' })
  const erro = erroDaFicha(p.data)
  if (erro) return res.status(400).json({ erro })

  const [existe] = await pool.query('SELECT id FROM fichas WHERE id = ?', [id])
  if (!existe.length) return res.status(404).json({ erro: 'Ficha não encontrada' })

  try {
    await transacao(async (conn) => {
      await conn.query(
        'UPDATE fichas SET nome = ?, objetivo = ?, status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
        [p.data.nome, p.data.objetivo, p.data.status, id])
      await conn.query('DELETE FROM ficha_divisoes WHERE ficha_id = ?', [id])
      await gravarEstrutura(conn, id, p.data.divisoes)
    })
    res.json({ id })
  } catch (err) {
    tratarErro(err, res)
  }
})

router.patch(
  '/:id/definir-atual',
  autorizar('aluno'),
  async (req, res) => {
    try {
      const fichaId = lerId(req)

      if (!fichaId) {
        return res.status(400).json({
          erro: 'ID da ficha inválido'
        })
      }

      const alunoId = req.usuario.id

      // Verifica se a ficha pertence ao aluno e está publicada
      const [fichas] = await pool.query(
        `SELECT id
         FROM fichas
         WHERE id = ?
           AND aluno_id = ?
           AND status = 'publicada'`,
        [fichaId, alunoId]
      )

      if (fichas.length === 0) {
        return res.status(404).json({
          erro: 'Ficha não encontrada ou não disponível'
        })
      }

      // Define a ficha como atual para Educação Física
      await pool.query(
        `INSERT INTO fichas_atuais (aluno_id, ficha_id, especialidade)
         VALUES (?, ?, 'educacao_fisica')
         ON DUPLICATE KEY UPDATE
           ficha_id = VALUES(ficha_id),
           selecionado_em = CURRENT_TIMESTAMP`,
        [alunoId, fichaId]
      )

      return res.json({
        mensagem: 'Ficha definida como atual com sucesso'
      })

    } catch (error) {
      console.error('Erro ao definir ficha atual:', error)

      return res.status(500).json({
        erro: 'Erro ao definir ficha atual'
      })
    }
  }
)

router.delete('/:id', autorizar('monitor', 'admin'), autorizarEspecialidade('educacao_fisica'), async (req, res) => {
  const id = lerId(req)
  if (!id) return res.status(404).json({ erro: 'Ficha não encontrada' })

  const [r] = await pool.query(
    'DELETE FROM fichas WHERE id = ?',
    [id]
  )

  if (!r.affectedRows) {
    return res.status(404).json({ erro: 'Ficha não encontrada' })
  }

  res.json({ mensagem: 'Ficha excluída' })
})

export default router