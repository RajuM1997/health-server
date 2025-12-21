import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";

const createAppointment = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(
      req.body,
      user as IJWTPayload
    );
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Appointment created successfully",
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
};
