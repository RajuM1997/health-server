import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import { ReviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";

const createReview = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const payload = req.body;
    const result = await ReviewService.createReview(user, payload);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Review create successfully",
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
};
