import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../helpers/pick";
import {
  doctorFilterAbleFields,
  doctorSortAndPaginationFields,
} from "./doctor.constant";

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const option = pick(req.query, doctorSortAndPaginationFields);
    const filters = pick(req.query, doctorFilterAbleFields);
    const result = await DoctorService.getAllFromDB(option, filters);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
export const DoctorController = {
  getAllFromDB,
};
