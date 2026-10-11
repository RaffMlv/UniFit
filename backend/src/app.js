import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import ratelimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/saude', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', ratelimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes)

//Erro genérico não exposto para o usuário, mas logado no console para depuração
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Erro interno do servidor.' })
})

export default app