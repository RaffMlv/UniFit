import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

export async function autenticar(req, res, next) {
  const authorization = req.get('authorization')
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : null
  const token = req.cookies?.token || bearerToken
  if (!token) return res.status(401).json({ erro: 'Não autenticado' })

  let dados
  try {
    dados = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada' })
  }

  // Confere no banco: bloqueia desativados e usa o papel atual (não o do token).
  const [rows] = await pool.query(
    `SELECT papel, especialidade, registro_profissional
     FROM usuarios
     WHERE id = ? AND ativo = TRUE`,
    [dados.id]
  );

  if (!rows[0]) {
      return res.status(401).json({
          erro: 'Sessão inválida ou expirada'
      });
  }

  req.usuario = {
      id: dados.id,
      papel: rows[0].papel,
      especialidade: rows[0].especialidade,
      registro_profissional: rows[0].registro_profissional
  };

  next();
}

export const autorizar = (...papeis) => (req, res, next) => {
  if (!papeis.includes(req.usuario.papel)) {
    return res.status(403).json({ erro: 'Sem permissão para esta ação' })
  }
  next()
}

export const autorizarEspecialidade = (...especialidadesPermitidas) => (req, res, next) => {
    const { papel, especialidade } = req.usuario

    if (papel === 'admin') return next()

    if (papel !== 'monitor' || !especialidadesPermitidas.includes(especialidade)) {
        return res.status(403).json({ erro: 'Funcionalidade não autorizada: Sem permissão para esta ação' })
    }

    next()
}