import { Router } from "express";
import { ReviewController } from "./review.controller";

const router = Router();

router.post("/", ReviewController.createReview);
export const reviewRoutes = router;
