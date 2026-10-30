import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../config/db.js'
import { autenticar } from '../middlewares/auth.js'

const router = Router()

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 horas
}

const somenteDigitos = (v) => String(v ?? '').replace(/\D/g, '')

function validarCPF(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false
  const digito = (tam) => {
    let soma = 0
    for (let i = 0; i < tam; i++) soma += Number(cpf[i]) * (tam + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10])
}

const cadastroSchema = z.object({
  nome: z.string().trim().min(3, 'Nome muito curto'),
  cpf: z.string().transform(somenteDigitos).refine(validarCPF, { message: 'CPF inválido' }),
  email: z.string().trim().email('E-mail inválido'),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
})

router.post('/cadastro', async (req, res) => {
  const parsed = cadastroSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({ erro: parsed.error.issues.map((e) => e.message).join(', ') })
  }
  const { nome, cpf, email, senha } = parsed.data

  const [existente] = await pool.query(
    'SELECT id FROM usuarios WHERE cpf = ? OR email = ?', [cpf, email])
  if (existente.length > 0) return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' })

  const senha_hash = await bcrypt.hash(senha, 10)
  await pool.query(
    'INSERT INTO usuarios (nome, cpf, email, senha_hash) VALUES (?, ?, ?, ?)',
    [nome, cpf, email, senha_hash])
  res.status(201).json({ message: 'Usuário cadastrado com sucesso.' })
})

router.post('/login', async (req, res) => {
  const { login, senha } = req.body ?? {}
  if (!login || !senha) return res.status(400).json({ erro: 'Resposta inválida' })

  // Aceita CPF com ou sem pontuação, ou e-mail. Só entra quem está ativo.
  const [rows] = await pool.query(
    `SELECT id, nome, senha_hash, papel FROM usuarios
     WHERE (cpf = ? OR email = ?) AND ativo = TRUE`,
    [somenteDigitos(login), String(login).trim()])
  const usuario = rows[0]
  const senhaValida = usuario ? await bcrypt.compare(String(senha), usuario.senha_hash) : false
  if (!usuario || !senhaValida) return res.status(401).json({ erro: 'E-mail, CPF ou senha inválidos.' })

  const token = jwt.sign(
    { id: usuario.id, papel: usuario.papel }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.cookie('token', token, cookieOptions)
  res.json({
    message: 'Login realizado com sucesso.',
    usuario: { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
  })
})

// Sem "autenticar" de propósito: sempre apaga o cookie, mesmo com a sessão expirada.
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions)
  res.json({ message: 'Logout realizado com sucesso.' })
})

router.get('/perfil', autenticar, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nome, u.cpf, u.email, u.papel,
            t.objetivo AS objetivo,
            t.usuario_id IS NOT NULL AS triagemConcluida
     FROM usuarios u
     LEFT JOIN triagens t ON t.usuario_id = u.id
     WHERE u.id = ?`, [req.usuario.id])
  if (!rows[0]) return res.status(401).json({ erro: 'Sessão inválida' })
  res.json({ ...rows[0], triagemConcluida: Boolean(rows[0].triagemConcluida) })
})

const esqueciSchema = z.object({ email: z.string().email() })

router.post('/esqueci-senha', async (req, res) => {
  const parsed = esqueciSchema.safeParse(req.body ?? {})
  if (!parsed.success) return res.status(400).json({ erro: 'Resposta inválida' })

  // TODO: gerar o código de recuperação e enviar por e-mail.
  // A resposta é a mesma exista o e-mail ou não, para não revelar quem está cadastrado.
  res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.' })
})

export default router