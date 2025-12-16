import jwt, { Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = jwt.sign({ email: payload.email, role: payload.role }, "abcd", {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);
  return token;
};
export const jwtHelper = {
  generateToken,
};
