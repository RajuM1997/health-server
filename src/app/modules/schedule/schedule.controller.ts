import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../../shared/sendResponse";

const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleService.createSchedule(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Schedule created successfully",
      data: result,
    });
  }
);

export const ScheduleController = {
  createSchedule,
};
