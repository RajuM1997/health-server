import httpStatus from "http-status";
import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { doctorSortAndPaginationFields } from "../doctor/doctor.constant";
import pick from "../../../helpers/pick";

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
const patientPrescription = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const option = pick(req.query, doctorSortAndPaginationFields);
    const result = await PrescriptionService.patientPrescription(user, option);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Prescription fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
export const PrescriptionController = {
  createPrescription,
  getMyPrescription,
  patientPrescription,
};
