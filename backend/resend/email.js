import { resend } from "./config.js";
import { verificationTokenEmailTemplate, WELCOME_EMAIL_TEMPLATE } from "./email-template.js";
import { buildPath } from "../src/utils/path.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  
    if (!resend) throw new Error("Resend client not defined");

  try {
    const { data, error } = await resend.emails.send({
      from: "CarStax <noreply@farrukhanwar.site>",
      to: [email],
      subject: "CarStax Email Verification",
      html: verificationTokenEmailTemplate.replaceAll("{verificationLink}", buildPath(`verify/${verificationToken}`)),
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
      throw error;
    }

    console.log("Verification email sent:", data);
    return data;
  } catch (err) {
    console.error("Error in sendVerificationEmail:", err);
    throw err;
  }
};


export const sendWelcomeEmail = async(email,name)=> {
    try{
        const { data, error } = await resend.emails.send({
            from: "CarStax <noreply@farrukhanwar.site>",
            to: [email],
            subject: "Welcome to CarStax",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    });

    }catch (error){

    }
}

export const sendPasswordResetEmail = async(email, resetURL) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "CarStax <noreply@farrukhanwar.site>",
            to: [email],
            subject: "Reset your Password",
            html: `Click <a href="${resetURL}">here</a> to reset your password`,
    });

    }catch (error){
        console.log("error sending reset email", error);
    }
}

export const sendResetSuccessEmail = async(email) =>{
     try{
        const { data, error } = await resend.emails.send({
            from: "CarStax <noreply@farrukhanwar.site>",
            to: [email],
            subject: "Password Reset Successful",
            html: `Your password was reset successfully`,
    });

    }catch (error){
        console.log("error sending reset email", error);
    }
}