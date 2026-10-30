import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = express.Router();

router.use(autenticar, autorizar('admin'));

const especialidadesValidas = [
    'educacao_fisica',
    'nutricao',
    'fisioterapia'
];

router.post('/', async (req, res) => {
    try {
        const {
            nome,
            cpf,
            email,
            senha,
            especialidade,
            registro_profissional
        } = req.body;

        if (
            !nome ||
            !cpf ||
            !email ||
            !senha ||
            !especialidade ||
            !registro_profissional
        ) {
            return res.status(400).json({
                erro: 'Preencha todos os campos obrigatórios'
            });
        }

        if (!especialidadesValidas.includes(especialidade)) {
            return res.status(400).json({
                erro: 'Especialidade inválida'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        await pool.query(
            `INSERT INTO usuarios
             (nome, cpf, email, senha_hash, papel,
              especialidade, registro_profissional, ativo)
             VALUES (?, ?, ?, ?, 'monitor', ?, ?, TRUE)`,
            [
                nome,
                cpf,
                email,
                senhaHash,
                especialidade,
                registro_profissional
            ]
        );

        return res.status(201).json({
            mensagem: 'Profissional cadastrado com sucesso'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao cadastrar profissional'
        });
    }
});

export default router;