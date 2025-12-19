import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { IJWTPayload } from "../../types/common";

const insertIntoDB = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const result = await doctorScheduleService.insertIntoDB(
      req.body,
      user as IJWTPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Doctor Schedule created successfully",
      data: result,
    });
  }
);

export const doctorScheduleController = {
  insertIntoDB,
};
