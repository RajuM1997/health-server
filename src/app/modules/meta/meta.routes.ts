import { Router } from "express";
import { MetaController } from "./meta.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(...Object.keys(UserRole)),
  MetaController.fetchDashboardMetaData
);

export const metaRoutes = router;
