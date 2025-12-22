import httpStatus from "http-status";
import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";

const createPrescription = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const result = await PrescriptionService.createPrescription(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Prescription created successfully",
      data: result,
    });
  }
);

const getMyPrescription = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const result = await PrescriptionService.getMyPrescription(user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Prescription fetched successfully",
      data: result,
    });
  }
);
export const PrescriptionController = {
  createPrescription,
  getMyPrescription,
};
