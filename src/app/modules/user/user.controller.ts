import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";

const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createPatient(req);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Patient created successfully",
      data: result,
    });
  }
);

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createAdmin(req);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Admin created successfully",
      data: result,
    });
  }
);

const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createDoctor(req);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Doctor created successfully",
      data: result,
    });
  }
);

export const UseController = {
  createPatient,
  createAdmin,
  createDoctor,
};
