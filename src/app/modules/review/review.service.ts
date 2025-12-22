import { Review } from "@prisma/client";
import { IJWTPayload } from "../../types/common";

const createReview = async (user: IJWTPayload, payload: Partial<Review>) => {};

export const ReviewService = {
  createReview,
};
