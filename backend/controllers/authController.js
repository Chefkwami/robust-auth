import User from "../models/authModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodeMailer.js";

export const register = async(req, res) => {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing fields",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exist",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const theUser = User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });
        await theUser.save();

        const token = jwt.sign({ id: theUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //sending welcome email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Lyte",
            text: `Your account has been successfuly created`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "Account successfully created",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async(req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing fields, kindly input your details correctly",
            });
        }

        const theUser = await User.findOne({ email });
        if (!theUser) {
            return res.status(404).json({
                success: false,
                message: "Invalid email",
            });
        }

        const isMatch = await bcrypt.compare(password, theUser.password);
        if (!isMatch) {
            return res.status(404).json({
                success: false,
                message: "Invalid password",
            });
        }
        const token = jwt.sign({ id: theUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //sending login email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Login Alert",
            text: `Account login successful, if you were not the one. Kindly call customer care.`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllUsers = async(req, res) => {
    try {
        const allUsers = await User.find();
        if (allUsers.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Users successfuly fetched",
                data: allUsers,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No user in the database",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteUser = async(req, res) => {
    try {
        const theUserId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(theUserId);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "User successfully deleted",
                data: deletedUser,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const logout = async(req, res) => {
    res.cookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({
        success: true,
        message: "Logged Out",
    });
};

export const sendVeriftyOtp = async(req, res) => {
    try {
        const { userId } = req.body;
        const theUser = await User.findById(userId);
        if (theUser.isAccountVerified === "true") {
            return res.status(403).json({
                success: false,
                message: "Account already verified",
            });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        theUser.verifyOtp = otp;

        theUser.verifyOtpExpireAt = Date.now() + 7 * 24 * 60 * 60 * 100;

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: theUser.email,
            subject: "OTP VERIFICATION",
            text: `Here is your ${otp} to verify your account`,
        };

        await transporter.sendMail(mailOptions);

        await theUser.save();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyEmail = async(req, res) => {
    const { userId, otp } = req.body;
    try {
        if (!userId || !otp) {
            return res.status(401).json({
                success: false,
                message: "Missing fields",
            });
        }

        const theUser = await User.findById(userId);
        if (!theUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (theUser.verifyOtp === "" || theUser.verifyOtp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (theUser.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        theUser.isAccountVerified = true;
        theUser.verifyOtp = "";
        theUser.verifyOtpExpireAt = 0;
        await theUser.save();
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const sendResetOtp = async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    try {
        const theUser = await User.findOne({ email });
        if (!theUser) {
            return res.status(404).json({
                success: false,
                message: "User no found",
            });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        theUser.resetOtp = otp;

        theUser.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: theUser.email,
            subject: "RESET OTP VERIFICATION",
            text: `Here is your ${otp} to reset your password`,
        };

        await transporter.sendMail(mailOptions);

        await theUser.save();

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            succcess: false,
            message: error.message,
        });
    }
};


export const resetPassword = async(req, res) => {
    const { email, otp, newPassword } = req.body
    if (!otp || !newPassword || !email) {
        return res.status(401).json({
            success: false,
            message: "Missing fields"
        });
    }
    try {

        const theUser = await User.findOne({ email })
        if (!theUser) {
            return res.status(404).json({
                success: false,
                message: "Invalid email"
            });

        }

        if (theUser.otp === "" || theUser.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            });

        }

        if (theUser.resetOtpExpiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Otp expired"
            });

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        theUser.password = hashedPassword;
        theUser.resetOtp = "";
        theUser.resetOtpExpiresAt = 0;
        await theUser.save();

        return res.status(200).json({
            success: true,
            message: "Password successfully changed"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }


}