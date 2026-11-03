import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/auth.js";

import {
    consultarHorarios,
    agendar,
    listarMeusAgendamentos,
    cancelar
} from "../controllers/agendamentos.controller.js";

const router = Router();

router.use(autenticar, autorizar("aluno"));

router.get("/horarios", consultarHorarios);

router.post("/", agendar);

router.get("/meus", listarMeusAgendamentos);

router.delete("/:id", cancelar);

export default router;