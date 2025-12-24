import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../helpers/pick";
import {
  patientSearchableFields,
  patientSortAndPaginationFields,
} from "./patient.constant";
import { PatientService } from "./patient.service";
import { IJWTPayload } from "../../types/common";

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const option = pick(req.query, patientSortAndPaginationFields);
    const filters = pick(req.query, patientSearchableFields);
    const result = await PatientService.getAllFromDB(option, filters);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateIntoDB = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const result = await PatientService.updateIntoDB(user, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient updated successfully",
      data: result,
    });
  }
);

const deletePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PatientService.deletePatient(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient deleted successfully",
      data: result,
    });
  }
);

const getSinglePatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PatientService.getSinglePatient(
      req.params.id as string
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient get successfully",
      data: result,
    });
  }
);

export const PatientController = {
  getAllFromDB,
  updateIntoDB,
  deletePatient,
  getSinglePatient,
};
