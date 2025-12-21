import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllFromDB);
router.get("/:id", DoctorController.getSingleDoctor);
router.patch("/:id", DoctorController.updateDoctor);
router.delete("/:id", DoctorController.deleteDoctor);

export const doctorRoutes = router;
