import { resend } from "./config.js";
import { verificationTokenEmailTemplate, getEmailContent, successResetTemplate, forgetPasswordTemplate } from "./email-template.js";
import { buildPath } from "../src/utils/path.js";

export const sendVerificationEmail = async (email, verificationToken, type = 'email', data = {}) => {
  
    if (!resend) throw new Error("Resend client not defined");

  try {
    const emailContent = getEmailContent(type, data);
    const { data: responseData, error } = await resend.emails.send({
      from: "CarStax <noreply@farrukhanwar.site>",
      to: [email],
      subject: `CarStax - ${emailContent.title}`,
      html: verificationTokenEmailTemplate(type, data).replaceAll("{verificationLink}", data.useCustomUrl ? buildPath(verificationToken) : buildPath(`verify/${verificationToken}${data.type === 'admin' ? '?type=admin' : ''}`)),
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
      throw error;
    }

    console.log("Verification email sent:", responseData);
    return responseData;
  } catch (err) {
    console.error("Error in sendVerificationEmail:", err);
    throw err;
  }
};


export const sendPasswordResetEmail = async(email, resetURL,name) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "CarStax <noreply@farrukhanwar.site>",
            to: [email],
            subject: "Reset your Password",
            html: forgetPasswordTemplate.replace("{{name}}", name).replace(/{{reset_link}}/g,resetURL),
    });

    }catch (error){
        console.log("error sending reset email", error);
    }
};

export const sendResetSuccessEmail = async(email, name) =>{
     try{
        const { data, error } = await resend.emails.send({
            from: "CarStax <noreply@farrukhanwar.site>",
            to: [email],
            subject: "Password Reset Successful",
            html: successResetTemplate.replace("{{name}}", name),
    });

    }catch (error){
        console.log("error sending reset email", error);
    }
};
