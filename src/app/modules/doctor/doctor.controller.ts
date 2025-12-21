import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../helpers/pick";
import {
  doctorFilterableFields,
  doctorSortAndPaginationFields,
} from "./doctor.constant";

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const option = pick(req.query, doctorSortAndPaginationFields);
    const filters = pick(req.query, doctorFilterableFields);
    console.log(filters);

    const result = await DoctorService.getAllFromDB(filters, option);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const updateDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.updateDoctor(
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor updated successfully",
      data: result,
    });
  }
);

const deleteDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.deleteDoctor(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor deleted successfully",
      data: result,
    });
  }
);

const getSingleDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.getSingleDoctor(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor get successfully",
      data: result,
    });
  }
);

export const DoctorController = {
  getAllFromDB,
  updateDoctor,
  getSingleDoctor,
  deleteDoctor,
};
