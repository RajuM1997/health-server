import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { prisma } from "../../../shared/prisma";
import { Request } from "express";
import { UserStatus } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import { jwtHelper } from "../../../helpers/jwtHelper";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import emailSender from "./emailSender";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password us incorrect");
  }
  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt_access_secret as Secret,
    "1h"
  );
  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt_refresh_secret as Secret,
    "90d"
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decoded;
  try {
    decoded = jwtHelper.verifyToken(token, config.jwt_refresh_secret as Secret);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorize");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decoded.email,
      status: UserStatus.ACTIVE,
    },
  });
  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt_access_secret as Secret,
    "30D"
  );
  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password incorrect");
  }
  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt)
  );
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password change successfully",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPasswordToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt_access_secret as Secret,
    "30d"
  );
  const resetLink =
    config.rest_pass_link +
    `?userId=${userData.id}&token=${resetPasswordToken}`;
  await emailSender(
    userData.email,
    `
    <div>
    <p>Dear User,</p>
    <p>Your password rest link</p>
    <a href=${resetLink}>
    <button>Reset Password</button>
    </a>
    </div>
    `
  );
};
const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {};

const getMe = async (session: any) => {};

export const AuthService = {
  login,
  changePassword,
  forgotPassword,
  refreshToken,
  resetPassword,
  getMe,
};
