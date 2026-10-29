import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import ratelimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'
import triagemRoutes from './routes/triagem.routes.js'
import exerciciosRoutes from './routes/exercicios.rotes.js'
import adminAlunosRoutes from './routes/admin.alunos.routes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/saude', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', ratelimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes)
app.use('/api/triagem', triagemRoutes)
app.use('/api/exercicios', exerciciosRoutes)
app.use('/api/admin/alunos', adminAlunosRoutes)

// Deve ficar depois de todas as rotas.
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
})

export default app