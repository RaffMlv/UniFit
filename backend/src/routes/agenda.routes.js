import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/auth.js";
import {
    listarAgenda,
    criarEvento,
    atualizarEvento,
    cancelarEvento,
    concluirEvento
} from "../controllers/agenda.controller.js";

const router = Router();
router.use(autenticar);

// Consulta: somente alunos
router.get("/", autorizar("aluno"), listarAgenda);

// Criação: somente administradores
router.post("/eventos", autorizar("admin"), criarEvento);

// Atualização: somente administradores
router.put("/eventos/:id", autorizar("admin"), atualizarEvento);

// Cancelamento: somente administradores
router.patch("/eventos/:id/cancelar", autorizar("admin"), cancelarEvento);

// Conclusão: somente administradores
router.patch("/eventos/:id/concluir", autorizar("admin"), concluirEvento);

export default router;