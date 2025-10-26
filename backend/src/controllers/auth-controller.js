import User from "../../models/user.js";
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail} from "../../resend/email.js";
import crypto from "crypto";
import { buildPath } from "../utils/path.js";

export const signup = async (req, res) => {
    console.log("req.body", req.body);
    const{email, firstName, lastName, companyName, password } = req.body;
    try{
        if(!email || !firstName || !lastName ||!companyName || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const userAlreadyExsits = await User.findOne({email});
        if(userAlreadyExsits){
            return res.status(400).json({message: "User already exists"});
        }
        
        console.log("Password from body:", password);


        const hashedPassword = await bcrypt.hash(password, 10);
        
        const verificationToken = generateVerificationToken();

        const user = new User({
            email,
            firstName,
            lastName,
            companyName,
            passwordHash: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 *1000 // 24 hours to verify
        })
        
        await user.save();

        try {
            generateJWTToken(res, user._id );
            console.log("Token successfully made");
            
        } catch(err) {
            console.error("JWT token generation failed:", err);
        }

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            user: {
                ...user._doc,
                passwordHash: undefined
            }
        });

    } catch (error){
        res.status(400).json({success: false, message: error.message });
    }
};



export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Credentials"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid Credentials"});
        }

        //check if verified
        const isVerified = user.isVerified;
        if(!isVerified){
            return res.status(400).json({success: false, message: "Email is not verified"});
        }

        generateJWTToken(res, user._id);

        res.status(200).json({
            success:true,
            message: "Login successfully",
        })
    }catch (error){
        console.log("error logging in", error);
        res.status(400).json({success: false, message: error.message});
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out successfully!"});
};

export const verifyEmail = async (req, res) => {
    const{code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now() },

        })
        if(!user){
            return res.status(400).json({ success: false, message: "Invalid or expired verification code"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({success: true, message: "Email verified successfully"});
    }catch(error){
        console.log("error verifying email", error);
        res. status(400).json({ success: false, message: error.message});
    }
}

export const forgotPassword = async (req, res) => {
    //Provide email
    const{email} = req.body;

    try{
        const user  = await User.findOne({email});
        if(!user){
            return res.status(400).json({ success: false, message: "User not found"});
        }
        const resetPasswordToken = crypto.randomBytes(32).toString("hex"); //string of random values
        const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;

        await user.save();
        await sendPasswordResetEmail(user.email, buildPath(`/reset-password/${resetPasswordToken}`));//need to change this link in env to our reset password frontend

            res.status(200).json({success: true, message: "Password reset email sent successfully"});
    }catch (error){
        console.log("error sending password reset email", error);
        res.status(400).json({success: false, message: error.message});
    }
};


export const resetPassword = async (req, res) => {
    try{
        const {token} = req.params;
        const {password} = req.body;

        if(!password){
            return res.status(400).json({success: false, message: "Password is required."});
        }
        const user = await User.findOne({
            resetPasswordToken: token, //user that matches the reset password token
            resetPasswordExpiresAt: {$gt: Date.now()},
        })
        if(!user){
            return res.status(400).json({success:false, message: "Invalid or expired reset token"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.passwordHash = hashedPassword;
        user.resetPasswordExpiresAt = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        
        res.status(200).json({success: true, message: "Password reset successful"});
    }catch (error){
        console.log("error resetting password", error);
        res.status(400).json({success: false, message: error.message});

    }
}
