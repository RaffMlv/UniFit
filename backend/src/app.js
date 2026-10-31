import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import ratelimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'
import triagemRoutes from './routes/triagem.routes.js'
import exerciciosRoutes from './routes/exercicios.rotes.js'
import adminAlunosRoutes from './routes/admin.alunos.routes.js'
import fichasRoutes from './routes/fichas.routes.js'
import adminProfissionaisRoutes from './routes/admin.profissionais.routes.js';
import vinculosRoutes from './routes/vinculos.routes.js';
import agendamentosRoutes from './routes/agendamentos.routes.js';

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
app.use('/api/fichas', fichasRoutes)
app.use('/api/admin/profissionais', adminProfissionaisRoutes)
app.use('/api/vinculos', vinculosRoutes)
app.use('/api/agendamentos', agendamentosRoutes)

// Deve ficar depois de todas as rotas.
app.use((err, req, res, next) => {
    console.error("ERRO:", err);

    res.status(500).json({
        erro: "Erro interno do servidor.",
        detalhe: err.message
    });
});

export default app