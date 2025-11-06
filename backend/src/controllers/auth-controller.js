import User from "../../models/user.js";
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail} from "../../resend/email.js";
import crypto from "crypto";
import { buildPath } from "../utils/path.js";

// Get list of companies
export const getCompanies = async (req, res) => {
    try {
        // Find all users who are company admins and get their company names
        const companies = await User.find(
            { userType: 'company_admin' }, 
            { companyName: 1, _id: 0 }
        );
        const companyNames = companies.map(c => c.companyName);
        res.status(200).json({ success: true, companies: companyNames });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const signup = async (req, res) => {
    console.log("req.body", req.body);
    const { email, firstName, lastName, password, userType, companyName } = req.body;
    try {
        // Validate required fields
        if (!email || !firstName || !lastName || !password) {
            return res.status(400).json({ message: "Basic fields are required" });
        }

        // Validate company-related fields
        if (userType !== 'solo' && !companyName) {
            return res.status(400).json({ message: "Company name is required for company users" });
        }

        // Check if user exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // For company members, verify company exists and get admin's email
        let adminEmail = null;
        if (userType === 'company_member') {
            const companyAdmin = await User.findOne({ 
                userType: 'company_admin',
                companyName: companyName
            });
            if (!companyAdmin) {
                return res.status(400).json({ message: "Company does not exist" });
            }
            adminEmail = companyAdmin.email;
        }

        // For company admins, verify company doesn't exist
        if (userType === 'company_admin') {
            const existingCompany = await User.findOne({ 
                userType: 'company_admin',
                companyName: companyName
            });
            if (existingCompany) {
                return res.status(400).json({ message: "Company already exists" });
            }
        }

        console.log("Password from body:", password);


        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        
        // If this is a company member, generate the admin verification token at signup
        let adminVerificationToken = null;
        if (userType === 'company_member') {
            adminVerificationToken = generateVerificationToken();
        }

        const user = new User({
            email,
            firstName,
            lastName,
            companyName,
            userType,
            passwordHash: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours to verify
            isEmailVerified: false,
            isAdminVerified: userType !== 'company_member', // true for solo and admin users
            adminVerificationToken: adminVerificationToken,
            adminVerificationTokenExpiresAt: adminVerificationToken ? Date.now() + 7 * 24 * 60 * 60 * 1000 : undefined // 7 days if company member
        });
        
        await user.save();

        // Send email verification to the user
        await sendVerificationEmail(email, verificationToken, 'email', {
            userType: userType,
            companyName: companyName
        });

         try {
            generateJWTToken(res, user._id );
            console.log("Token successfully made");
            
        } catch(err) {
            console.error("JWT token generation failed:", err);
        }
        
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
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }

        // Check email verification
        if (!user.isEmailVerified) {
            return res.status(400).json({
                success: false, 
                message: "Please verify your email first"
            });
        }

        // Check admin verification for company members
        if (user.userType === 'company_member' && !user.isAdminVerified) {
            return res.status(400).json({
                success: false,
                message: "Please wait for company admin approval"
            });
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
    // Check if this is an OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log(`Verification request received - Type: ${req.query.type || 'email'}, Token: ${req.params.token}`);
    const { token } = req.params;
    const type = req.query.type || 'email';

    try {
        let user;
        if (type === 'admin') {
            console.log('Processing admin verification request');
            // Admin verifying a company member
            user = await User.findOne({
                adminVerificationToken: token,
                adminVerificationTokenExpiresAt: { $gt: Date.now() }
            });
            
            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid or expired admin verification code" 
                });
            }

            // Double-check that the user hasn't already been verified (race condition protection)
            if (user.isAdminVerified) {
                console.log('User was already admin verified');
                return res.status(200).json({
                    success: true,
                    message: "Company member was already verified"
                });
            }

            console.log('Admin verifying company member');
            
            // Update user status first
            user.isAdminVerified = true;
            user.adminVerificationToken = undefined;
            user.adminVerificationTokenExpiresAt = undefined;
            
            // Save changes before sending email to prevent race conditions
            await user.save();
            console.log('User admin verification status saved');

            // Send email to user that they've been approved
            try {
                await sendVerificationEmail(user.email, 'login', 'admin_approved', {
                    companyName: user.companyName,
                    useCustomUrl: true  // Flag to use custom URL instead of verification path
                });
                console.log('Admin approval email sent to user');
            } catch (emailError) {
                console.error('Error sending admin approval email:', emailError);
                // Don't throw error here - user is still verified even if email fails
            }

            return res.status(200).json({
                success: true,
                message: "Company member verified successfully"
            });
        } else {
            // Regular email verification
            user = await User.findOne({
                verificationToken: token,
                verificationTokenExpiresAt: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid or expired verification code" 
                });
            }

            // If email is already verified, prevent duplicate verification
            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already verified"
                });
            }

            user.isEmailVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpiresAt = undefined;

            // For company members who are awaiting admin approval
            if (user.userType === 'company_member' && !user.isAdminVerified) {
                console.log('Processing company member email verification');
                
                // Find company admin to send verification email
                const companyAdmin = await User.findOne({ 
                    userType: 'company_admin',
                    companyName: user.companyName
                });

                if (companyAdmin && user.adminVerificationToken) {
                    console.log('Sending admin verification email');
                    
                    // Mark that we're processing the admin notification to prevent duplicates
                    const processingKey = `admin_notified_${user._id}`;
                    if (user[processingKey]) {
                        console.log('Admin notification was already sent');
                        return res.status(200).json({
                            success: true,
                            message: "Email already verified, admin has been notified."
                        });
                    }

                    // Set processing flag and save before sending email
                    user[processingKey] = true;
                    await user.save();
                    
                    try {
                        // Send admin verification email using the token created during signup
                        await sendVerificationEmail(companyAdmin.email, user.adminVerificationToken, 'admin_verification', {
                            newMemberName: `${user.firstName} ${user.lastName}`,
                            newMemberEmail: user.email,
                            type: 'admin'
                        });
                        console.log('Admin verification email sent successfully');
                    } catch (emailError) {
                        console.error('Error sending admin verification email:', emailError);
                        // Remove processing flag if email fails
                        user[processingKey] = false;
                        await user.save();
                        throw emailError;
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Email verified successfully. Admin has been notified for approval."
                    });
                }
            }

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Email verified successfully"
            });
        }
    } catch(error) {
        console.log("error verifying email", error);
        res.status(400).json({ success: false, message: error.message });
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
