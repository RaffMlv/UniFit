import jwt from 'jsonwebtoken'

export function autenticar(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ erro: 'Não autenticado' })
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada' })
  }
}

export const autorizar = (...papeis) => (req, res, next) => {
  if (!papeis.includes(req.usuario.papel)) {
    return res.status(403).json({ erro: 'Sem permissão para esta ação' })
  }
  next()
}