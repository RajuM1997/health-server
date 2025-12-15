import { UseController } from "./user.controller";
import { Router } from "express";

const router = Router();

router.post("/create-patient", UseController.createPatient);

export const userRoutes = router;
