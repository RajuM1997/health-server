import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import { MetaService } from "./meta.service";
import sendResponse from "../../../shared/sendResponse";

const fetchDashboardMetaData = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(
      user as IJWTPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Dashboard meta fetched successfully",
      data: result,
    });
  }
);

export const MetaController = {
  fetchDashboardMetaData,
};
