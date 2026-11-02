import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

router.use(autenticar);

const permissoesValidas = [
    'alunos',
    'triagem',
    'treinos',
    'acompanhamento'
];

const especialidadesValidas = [
    'educacao_fisica',
    'nutricao',
    'fisioterapia'
];

// --------------------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------------------

function ehAdmin(usuario) {
    return usuario.papel === 'admin';
}

function ehMonitorCompleto(usuario) {
    return (
        usuario.papel === 'monitor' &&
        usuario.tipo_autorizacao === 'completo'
    );
}

function validarPermissoes(permissoes) {
    return (
        Array.isArray(permissoes) &&
        permissoes.every(permissao =>
            permissoesValidas.includes(permissao)
        ) &&
        new Set(permissoes).size === permissoes.length
    );
}

async function buscarMonitor(id, conexao = pool) {
    const [rows] = await conexao.query(
        `SELECT
            id,
            nome,
            cpf,
            email,
            especialidade,
            registro_profissional,
            ativo,
            tipo_autorizacao,
            supervisor_id
         FROM usuarios
         WHERE id = ? AND papel = 'monitor'`,
        [id]
    );

    return rows[0] || null;
}

async function verificarSupervisor(supervisorId, conexao = pool) {
    const [rows] = await conexao.query(
        `SELECT id
         FROM usuarios
         WHERE id = ?
           AND papel = 'monitor'
           AND tipo_autorizacao = 'completo'
           AND ativo = TRUE`,
        [supervisorId]
    );

    return rows.length > 0;
}

// Admin pode gerenciar todos.
// Monitor completo só pode gerenciar seus próprios supervisionados.
async function autorizarGerenciamento(req, res, id) {
    const monitor = await buscarMonitor(id);

    if (!monitor) {
        res.status(404).json({ erro: 'Monitor não encontrado' });
        return null;
    }

    if (ehAdmin(req.usuario)) {
        return monitor;
    }

    const podeGerenciar =
        ehMonitorCompleto(req.usuario) &&
        monitor.tipo_autorizacao === 'restrito' &&
        monitor.supervisor_id === req.usuario.id;

    if (!podeGerenciar) {
        res.status(403).json({
            erro: 'Você não tem permissão para gerenciar este monitor'
        });
        return null;
    }

    return monitor;
}

async function registrarHistorico(
    conexao,
    monitorId,
    autorId,
    acao,
    descricao
) {
    await conexao.query(
        `INSERT INTO historico_monitores
         (monitor_id, realizado_por, acao, descricao)
         VALUES (?, ?, ?, ?)`,
        [monitorId, autorId, acao, descricao]
    );
}

async function substituirPermissoes(
    conexao,
    monitorId,
    permissoes,
    concedenteId
) {
    await conexao.query(
        'DELETE FROM permissoes_monitores WHERE monitor_id = ?',
        [monitorId]
    );

    for (const permissao of permissoes) {
        await conexao.query(
            `INSERT INTO permissoes_monitores
             (monitor_id, permissao, concedida_por)
             VALUES (?, ?, ?)`,
            [monitorId, permissao, concedenteId]
        );
    }
}

async function consultarPermissoes(monitorIds, conexao = pool) {
    if (!monitorIds.length) return {};

    const [rows] = await conexao.query(
        `SELECT monitor_id, permissao
         FROM permissoes_monitores
         WHERE monitor_id IN (?)`,
        [monitorIds]
    );

    const resultado = {};

    for (const id of monitorIds) {
        resultado[id] = [];
    }

    for (const row of rows) {
        resultado[row.monitor_id].push(row.permissao);
    }

    return resultado;
}

// --------------------------------------------------
// POST /api/admin/monitores
// Cadastrar monitor
// --------------------------------------------------

router.post('/', async (req, res) => {
    const conexao = await pool.getConnection();

    try {
        const {
            nome,
            cpf,
            email,
            senha,
            especialidade,
            registro_profissional,
            tipo_autorizacao,
            supervisor_id,
            permissoes = []
        } = req.body;

        const usuario = req.usuario;

        if (!nome || !cpf || !email || !senha) {
            return res.status(400).json({
                erro: 'Nome, CPF, email e senha são obrigatórios'
            });
        }

        if (
            especialidade &&
            !especialidadesValidas.includes(especialidade)
        ) {
            return res.status(400).json({
                erro: 'Especialidade inválida'
            });
        }

        if (!ehAdmin(usuario) && !ehMonitorCompleto(usuario)) {
            return res.status(403).json({
                erro: 'Apenas administradores e monitores completos podem cadastrar monitores'
            });
        }

        const tipo = ehAdmin(usuario)
            ? tipo_autorizacao
            : 'restrito';

        if (!['completo', 'restrito'].includes(tipo)) {
            return res.status(400).json({
                erro: 'Tipo de autorização inválido'
            });
        }

        if (tipo === 'completo' && !ehAdmin(usuario)) {
            return res.status(403).json({
                erro: 'Somente o administrador pode cadastrar monitores completos'
            });
        }

        if (!validarPermissoes(permissoes)) {
            return res.status(400).json({
                erro: 'Lista de permissões inválida'
            });
        }

        let supervisorFinal = null;

        if (tipo === 'restrito') {
            supervisorFinal = ehAdmin(usuario)
                ? supervisor_id
                : usuario.id;

            if (!supervisorFinal) {
                return res.status(400).json({
                    erro: 'Monitor restrito precisa de um supervisor'
                });
            }

            const supervisorValido = await verificarSupervisor(
                supervisorFinal
            );

            if (!supervisorValido) {
                return res.status(400).json({
                    erro: 'Supervisor inexistente, inativo ou sem autorização completa'
                });
            }
        }

        if (tipo === 'completo' && supervisor_id) {
            return res.status(400).json({
                erro: 'Monitor completo não precisa de supervisor'
            });
        }

        if (tipo === 'completo' && permissoes.length > 0) {
            return res.status(400).json({
                erro: 'Monitores completos não precisam de permissões individuais'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        await conexao.beginTransaction();

        const [resultado] = await conexao.query(
            `INSERT INTO usuarios
             (
                nome,
                cpf,
                email,
                senha_hash,
                papel,
                especialidade,
                registro_profissional,
                ativo,
                tipo_autorizacao,
                supervisor_id
             )
             VALUES (?, ?, ?, ?, 'monitor', ?, ?, TRUE, ?, ?)`,
            [
                nome,
                cpf,
                email,
                senhaHash,
                especialidade || null,
                registro_profissional || null,
                tipo,
                supervisorFinal
            ]
        );

        const monitorId = resultado.insertId;

        if (tipo === 'restrito' && permissoes.length > 0) {
            await substituirPermissoes(
                conexao,
                monitorId,
                permissoes,
                usuario.id
            );
        }

        await registrarHistorico(
            conexao,
            monitorId,
            usuario.id,
            'cadastro',
            `Monitor cadastrado com autorização ${tipo}`
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Monitor cadastrado com sucesso',
            monitor_id: monitorId,
            tipo_autorizacao: tipo,
            supervisor_id: supervisorFinal,
            permissoes
        });

    } catch (erro) {
        await conexao.rollback();

        console.error(erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                erro: 'CPF ou email já cadastrado'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao cadastrar monitor'
        });

    } finally {
        conexao.release();
    }
});

// --------------------------------------------------
// GET /api/admin/monitores
// Listar monitores
// --------------------------------------------------

router.get('/', async (req, res) => {
    try {
        const usuario = req.usuario;

        if (!ehAdmin(usuario) && !ehMonitorCompleto(usuario)) {
            return res.status(403).json({
                erro: 'Você não tem permissão para consultar monitores'
            });
        }

        let sql = `
            SELECT
                m.id,
                m.nome,
                m.cpf,
                m.email,
                m.especialidade,
                m.registro_profissional,
                m.ativo,
                m.tipo_autorizacao,
                m.supervisor_id,
                s.nome AS supervisor_nome
            FROM usuarios m
            LEFT JOIN usuarios s ON s.id = m.supervisor_id
            WHERE m.papel = 'monitor'
        `;

        const parametros = [];

        if (ehMonitorCompleto(usuario)) {
            sql += `
                AND m.tipo_autorizacao = 'restrito'
                AND m.supervisor_id = ?
            `;
            parametros.push(usuario.id);
        }

        sql += ' ORDER BY m.nome';

        const [monitores] = await pool.query(sql, parametros);

        const permissoes = await consultarPermissoes(
            monitores.map(monitor => monitor.id)
        );

        const resultado = monitores.map(monitor => ({
            ...monitor,
            permissoes: permissoes[monitor.id] || []
        }));

        return res.json(resultado);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao listar monitores'
        });
    }
});

// --------------------------------------------------
// GET /api/admin/monitores/:id
// Consultar detalhes
// --------------------------------------------------

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const monitor = await autorizarGerenciamento(
            req,
            res,
            id
        );

        if (!monitor) return;

        const permissoes = await consultarPermissoes([id]);

        return res.json({
            ...monitor,
            permissoes: permissoes[id] || []
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao consultar monitor'
        });
    }
});

// --------------------------------------------------
// PUT /api/admin/monitores/:id
// Editar dados cadastrais
// --------------------------------------------------

router.put('/:id', async (req, res) => {
    const conexao = await pool.getConnection();

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const monitor = await autorizarGerenciamento(
            req,
            res,
            id
        );

        if (!monitor) return;

        const {
            nome,
            email,
            especialidade,
            registro_profissional
        } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                erro: 'Nome e email são obrigatórios'
            });
        }

        if (
            especialidade &&
            !especialidadesValidas.includes(especialidade)
        ) {
            return res.status(400).json({
                erro: 'Especialidade inválida'
            });
        }

        await conexao.beginTransaction();

        await conexao.query(
            `UPDATE usuarios
             SET nome = ?,
                 email = ?,
                 especialidade = ?,
                 registro_profissional = ?
             WHERE id = ? AND papel = 'monitor'`,
            [
                nome,
                email,
                especialidade || null,
                registro_profissional || null,
                id
            ]
        );

        await registrarHistorico(
            conexao,
            id,
            req.usuario.id,
            'edicao',
            'Dados cadastrais do monitor atualizados'
        );

        await conexao.commit();

        return res.json({
            mensagem: 'Monitor atualizado com sucesso'
        });

    } catch (erro) {
        await conexao.rollback();

        console.error(erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                erro: 'Email já cadastrado'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao atualizar monitor'
        });

    } finally {
        conexao.release();
    }
});

// --------------------------------------------------
// PATCH /api/admin/monitores/:id/status
// Ativar ou desativar monitor
// --------------------------------------------------

router.patch('/:id/status', async (req, res) => {
    const conexao = await pool.getConnection();
    let transacaoIniciada = false;

    try {
        const id = Number(req.params.id);
        const { ativo } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        if (typeof ativo !== 'boolean') {
            return res.status(400).json({
                erro: 'O campo ativo deve ser true ou false'
            });
        }

        const monitor = await autorizarGerenciamento(
            req,
            res,
            id
        );

        if (!monitor) return;

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // Bloqueia o registro durante a operação.
        const [rows] = await conexao.query(
            `SELECT id, ativo, tipo_autorizacao
             FROM usuarios
             WHERE id = ? AND papel = 'monitor'
             FOR UPDATE`,
            [id]
        );

        if (!rows.length) {
            await conexao.rollback();
            transacaoIniciada = false;

            return res.status(404).json({
                erro: 'Monitor não encontrado'
            });
        }

        const monitorAtual = rows[0];

        // Impede desativar um supervisor que ainda possui
        // monitores restritos vinculados.
        if (
            !ativo &&
            monitorAtual.tipo_autorizacao === 'completo'
        ) {
            const [supervisionados] = await conexao.query(
                `SELECT id
                 FROM usuarios
                 WHERE papel = 'monitor'
                   AND tipo_autorizacao = 'restrito'
                   AND supervisor_id = ?
                 LIMIT 1
                 FOR UPDATE`,
                [id]
            );

            if (supervisionados.length > 0) {
                await conexao.rollback();
                transacaoIniciada = false;

                return res.status(409).json({
                    erro: 'Reatribua os monitores supervisionados antes de desativar este monitor'
                });
            }
        }

        // Evita registrar alterações desnecessárias no histórico.
        if (Boolean(monitorAtual.ativo) === ativo) {
            await conexao.commit();
            transacaoIniciada = false;

            return res.json({
                mensagem: 'O monitor já possui esse status',
                ativo
            });
        }

        await conexao.query(
            `UPDATE usuarios
             SET ativo = ?
             WHERE id = ? AND papel = 'monitor'`,
            [ativo, id]
        );

        await registrarHistorico(
            conexao,
            id,
            req.usuario.id,
            ativo ? 'ativacao' : 'desativacao',
            ativo
                ? 'Monitor ativado'
                : 'Monitor desativado'
        );

        await conexao.commit();
        transacaoIniciada = false;

        return res.json({
            mensagem: ativo
                ? 'Monitor ativado com sucesso'
                : 'Monitor desativado com sucesso',
            ativo
        });

    } catch (erro) {
        if (transacaoIniciada) {
            await conexao.rollback();
        }

        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao alterar status do monitor'
        });

    } finally {
        conexao.release();
    }
});

// --------------------------------------------------
// PUT /api/admin/monitores/:id/permissoes
// Conceder ou substituir permissões
// --------------------------------------------------

router.put('/:id/permissoes', async (req, res) => {
    const conexao = await pool.getConnection();

    try {
        const id = Number(req.params.id);
        const { permissoes } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        if (!validarPermissoes(permissoes)) {
            return res.status(400).json({
                erro: 'Lista de permissões inválida'
            });
        }

        const monitor = await autorizarGerenciamento(
            req,
            res,
            id
        );

        if (!monitor) return;

        if (monitor.tipo_autorizacao !== 'restrito') {
            return res.status(400).json({
                erro: 'Monitores completos não utilizam permissões individuais'
            });
        }

        await conexao.beginTransaction();

        await substituirPermissoes(
            conexao,
            id,
            permissoes,
            req.usuario.id
        );

        await registrarHistorico(
            conexao,
            id,
            req.usuario.id,
            'permissoes',
            `Permissões atualizadas: ${permissoes.join(', ') || 'nenhuma'}`
        );

        await conexao.commit();

        return res.json({
            mensagem: 'Permissões atualizadas com sucesso',
            permissoes
        });

    } catch (erro) {
        await conexao.rollback();

        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao atualizar permissões'
        });

    } finally {
        conexao.release();
    }
});

// --------------------------------------------------
// PATCH /api/admin/monitores/:id/autorizacao
// Alterar autorização (somente administrador)
// --------------------------------------------------

router.patch('/:id/autorizacao', async (req, res) => {
    const conexao = await pool.getConnection();
    let transacaoIniciada = false;

    try {
        // Somente administrador pode alterar o nível de autorização.
        if (!ehAdmin(req.usuario)) {
            return res.status(403).json({
                erro: 'Somente o administrador pode alterar o nível de autorização'
            });
        }

        const id = Number(req.params.id);

        const {
            tipo_autorizacao,
            supervisor_id,
            permissoes = []
        } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        if (!['completo', 'restrito'].includes(tipo_autorizacao)) {
            return res.status(400).json({
                erro: 'Tipo de autorização inválido'
            });
        }

        if (!validarPermissoes(permissoes)) {
            return res.status(400).json({
                erro: 'Lista de permissões inválida'
            });
        }

        if (
            tipo_autorizacao === 'completo' &&
            (supervisor_id != null || permissoes.length > 0)
        ) {
            return res.status(400).json({
                erro: 'Monitores completos não precisam de supervisor ou permissões individuais'
            });
        }

        if (
            tipo_autorizacao === 'restrito' &&
            (supervisor_id == null || supervisor_id === '')
        ) {
            return res.status(400).json({
                erro: 'Monitor restrito precisa de um supervisor'
            });
        }

        const monitor = await buscarMonitor(id);

        if (!monitor) {
            return res.status(404).json({
                erro: 'Monitor não encontrado'
            });
        }

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // Bloqueia o monitor que terá sua autorização alterada.
        const [monitorRows] = await conexao.query(
            `SELECT id, tipo_autorizacao
             FROM usuarios
             WHERE id = ? AND papel = 'monitor'
             FOR UPDATE`,
            [id]
        );

        if (!monitorRows.length) {
            await conexao.rollback();
            transacaoIniciada = false;

            return res.status(404).json({
                erro: 'Monitor não encontrado'
            });
        }

        const monitorAtual = monitorRows[0];

        // Não permite rebaixar um supervisor que ainda possui
        // monitores restritos sob sua responsabilidade.
        if (
            monitorAtual.tipo_autorizacao === 'completo' &&
            tipo_autorizacao === 'restrito'
        ) {
            const [supervisionados] = await conexao.query(
                `SELECT id
                 FROM usuarios
                 WHERE papel = 'monitor'
                   AND tipo_autorizacao = 'restrito'
                   AND supervisor_id = ?
                 LIMIT 1
                 FOR UPDATE`,
                [id]
            );

            if (supervisionados.length > 0) {
                await conexao.rollback();
                transacaoIniciada = false;

                return res.status(409).json({
                    erro: 'Reatribua os monitores supervisionados antes de alterar a autorização'
                });
            }
        }

        let supervisorFinal = null;

        if (tipo_autorizacao === 'restrito') {
            supervisorFinal = Number(supervisor_id);

            if (
                !Number.isInteger(supervisorFinal) ||
                supervisorFinal <= 0
            ) {
                await conexao.rollback();
                transacaoIniciada = false;

                return res.status(400).json({
                    erro: 'ID do supervisor inválido'
                });
            }

            if (supervisorFinal === id) {
                await conexao.rollback();
                transacaoIniciada = false;

                return res.status(400).json({
                    erro: 'Um monitor não pode supervisionar a si mesmo'
                });
            }

            // Verifica o supervisor diretamente na transação.
            const [supervisorRows] = await conexao.query(
                `SELECT id
                 FROM usuarios
                 WHERE id = ?
                   AND papel = 'monitor'
                   AND tipo_autorizacao = 'completo'
                   AND ativo = TRUE
                 FOR UPDATE`,
                [supervisorFinal]
            );

            if (!supervisorRows.length) {
                await conexao.rollback();
                transacaoIniciada = false;

                return res.status(400).json({
                    erro: 'Supervisor inexistente, inativo ou sem autorização completa'
                });
            }
        }

        // Atualiza autorização e supervisor.
        await conexao.query(
            `UPDATE usuarios
             SET tipo_autorizacao = ?,
                 supervisor_id = ?
             WHERE id = ? AND papel = 'monitor'`,
            [
                tipo_autorizacao,
                supervisorFinal,
                id
            ]
        );

        // Substitui as permissões anteriores.
        // Para monitores completos, a lista será vazia.
        await substituirPermissoes(
            conexao,
            id,
            tipo_autorizacao === 'restrito' ? permissoes : [],
            req.usuario.id
        );

        await registrarHistorico(
            conexao,
            id,
            req.usuario.id,
            'autorizacao',
            `Autorização alterada para ${tipo_autorizacao}. ` +
            (
                tipo_autorizacao === 'restrito'
                    ? `Supervisor: ${supervisorFinal}. Permissões: ${permissoes.join(', ') || 'nenhuma'}`
                    : 'Supervisor removido e permissões individuais removidas.'
            )
        );

        await conexao.commit();
        transacaoIniciada = false;

        return res.json({
            mensagem: 'Autorização atualizada com sucesso',
            tipo_autorizacao,
            supervisor_id: supervisorFinal,
            permissoes: tipo_autorizacao === 'restrito'
                ? permissoes
                : []
        });

    } catch (erro) {
        if (transacaoIniciada) {
            await conexao.rollback();
        }

        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao alterar autorização do monitor'
        });

    } finally {
        conexao.release();
    }
});

// --------------------------------------------------
// GET /api/admin/monitores/:id/historico
// Consultar histórico de alterações
// --------------------------------------------------

router.get('/:id/historico', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const monitor = await autorizarGerenciamento(
            req,
            res,
            id
        );

        if (!monitor) return;

        const [historico] = await pool.query(
            `SELECT
                h.id,
                h.acao,
                h.descricao,
                h.criado_em,
                h.realizado_por,
                u.nome AS autor_nome
             FROM historico_monitores h
             LEFT JOIN usuarios u ON u.id = h.realizado_por
             WHERE h.monitor_id = ?
             ORDER BY h.criado_em DESC`,
            [id]
        );

        return res.json(historico);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao consultar histórico'
        });
    }
});

export default router;