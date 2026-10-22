import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {z} from 'zod'
import {pool} from '../config/db.js'
import {autenticar, autorizar} from '../middlewares/auth.js'

const router = Router()

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000 // 8 horas
}

const somenteDigitos = (v) => String(v).replace(/\D/g, '')

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
    nome: z.string().min(3),
    cpf: z.string().transform(somenteDigitos).refine(validarCPF, {message: 'CPF inválido'}),
    email: z.string().email(),
    senha: z.string().min(8),
})

router.post('/cadastro', async (req, res) => {
    const parsedData = cadastroSchema.safeParse(req.body)
    if(!parsedData.success) return res.status(400).
    json({error: parsedData.error.issues.map(e => e.message).join(', ')})
    const {nome, cpf, email, senha} = parsedData.data

    const[usuarioExistente] = await pool.query
    ('SELECT id FROM usuarios WHERE cpf = ? OR email = ?', [cpf, email])
    if(usuarioExistente.length > 0) return res.status(409).
    json({error: 'CPF ou email já cadastrado.'})

    const senha_hash = await bcrypt.hash(senha, 10)
    await pool.query
    ('INSERT INTO usuarios (nome, cpf, email, senha_hash) VALUES (?, ?, ?, ?)', 
        [nome, cpf, email, senha_hash])
    res.status(201).json({message: 'Usuário cadastrado com sucesso.'})
})

router.post('/login', async (req, res) => {
    const {login, senha} = req.body
      if (!login || !senha) return res.status(400).json({ erro: 'Resposta inválida' })

    const [rows] = await pool.query
    ('SELECT id, nome, cpf, email, senha_hash, papel FROM usuarios WHERE cpf = ? OR email = ?', 
        [login, login])
    const usuario = rows[0]
    const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false
    if(!usuario || !senhaValida) return res.status(401).
    json({error: 'Email/CPF ou senha inválidos.'})

    const token = jwt.sign({id: usuario.id, nome: usuario.nome, papel: usuario.papel}, process.env.JWT_SECRET, {expiresIn: '8h'})
    res.cookie('token', token, cookieOptions)
    res.json({message: 'Login realizado com sucesso.', usuario: {id: usuario.id, nome: usuario.nome, papel: usuario.papel}})
})

router.post('/logout', autenticar, (req, res) => {
    res.clearCookie('token', cookieOptions)
    res.json({message: 'Logout realizado com sucesso.'})
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
  const parsed = esqueciSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ erro: 'Resposta inválida' })

  res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.' })
})

export default router