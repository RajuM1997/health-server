import { Request, Response } from "express";
import { NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import pick from "../../../helpers/pick";
import {
  appointmentFilterableFields,
  appointmentSortAndPaginationFields,
} from "./appointment.constant";

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

const getAppointment = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const option = pick(req.query, appointmentSortAndPaginationFields);
    const filters = pick(req.query, appointmentFilterableFields);
    const user = req.user;
    const result = await AppointmentService.getAppointment(
      user as IJWTPayload,
      filters,
      option
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Appointment fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateAppointmentStatus = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const id = req.params.id;
    const { status } = req.body;
    const result = await AppointmentService.updateAppointmentStatus(
      id,
      status,
      user as IJWTPayload
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Appointment fetched successfully",
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
  getAppointment,
  updateAppointmentStatus,
};
