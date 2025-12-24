import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../helpers/pick";
import {
  userFilterAbleFields,
  userSortAndPaginationFields,
} from "./user.constant";
import { IJWTPayload } from "../../types/common";

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

const getAllUsersFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = pick(req.query, userFilterAbleFields);
    const options = pick(req.query, userSortAndPaginationFields);

    const result = await UserService.getAllUsersFromDB(filters, options);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All users retrieve successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getMeProfile = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as IJWTPayload;
    const result = await UserService.getMeProfile(user);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User profile retrieve successfully",

      data: result,
    });
  }
);

const changeProfileStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UserService.changeProfileStatus(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User profile updated successfully",

      data: result,
    });
  }
);

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUsersFromDB,
  getMeProfile,
  changeProfileStatus,
};
