import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../helpers/pick";
import {
  scheduleFilterAbleFields,
  scheduleSortAndPaginationFields,
} from "./schedule.constant";
import { IJWTPayload } from "../../types/common";

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

const scheduleForDoctor = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const filters = pick(req.query, scheduleFilterAbleFields);
    const options = pick(req.query, scheduleSortAndPaginationFields);
    const user = req.user;
    const result = await ScheduleService.scheduleForDoctor(
      filters,
      options,
      user as IJWTPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Schedule retrieved successfully",
      data: result,
    });
  }
);

const deleteScheduleFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await ScheduleService.deleteScheduleFromDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Schedule delete successfully",
      data: null,
    });
  }
);

export const ScheduleController = {
  createSchedule,
  scheduleForDoctor,
  deleteScheduleFromDB,
};
