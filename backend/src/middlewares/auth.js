import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
    const token = req.cookies?.token;
    if(!token) return res.sendStatus(401).
    json({ message: 'Token não fornecido. Usuário não autenticado.' });
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).
        json({error: 'Sessão inválida ou expirada. Por favor, faça login novamente.'});
    }
}

export const autorizar = (roles) => {(req, res, next) => {
    if(!roles.includes(req.usuario.role)) {
        return res.status(403).
        json({error: 'Acesso negado. Você não tem permissão para acessar este recurso.'});
    }
    next();
    }
}