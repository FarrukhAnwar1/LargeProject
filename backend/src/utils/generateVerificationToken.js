import crypto from "crypto";

export const generateVerificationToken = () => {
  const token = crypto.randomBytes(4).toString("hex"); // 8-character hex
  //console.log("Generated verification token:", token);
  return token;
};