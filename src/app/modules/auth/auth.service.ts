import bcrypt from "bcryptjs";
import { prisma } from "../../../shared/prisma";
import { Request } from "express";
import { UserStatus } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import { jwtHelper } from "../../../helpers/jwtHelper";
import config from "../../../config";

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
    throw new Error("Password us incorrect");
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

export const AuthService = {
  login,
};
