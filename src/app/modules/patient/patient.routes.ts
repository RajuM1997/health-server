import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.get("/", PatientController.getAllFromDB);
router.get("/:id", PatientController.getSinglePatient);
router.patch("/:id", PatientController.updatePatient);
router.delete("/:id", PatientController.deletePatient);

export const patientRoutes = router;
