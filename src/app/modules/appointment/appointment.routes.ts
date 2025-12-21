import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getAppointment
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment
);
router.patch(
  "/status/:id",
  auth(UserRole.DOCTOR, UserRole.ADMIN),
  AppointmentController.updateAppointmentStatus
);

export const appointmentRoutes = router;
