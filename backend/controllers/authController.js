import User from "../models/authModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodeMailer.js";






export const register = async(req, res) => {

    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing fields"
        })
    }

    try {

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exist"
            })
        }


        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = User({ firstname, lastname, email, password: hashedPassword })
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        //sending welcome email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Lyte",
            text: `Your account has been successfuly created`

        }

        await transporter.sendMail(mailOptions)


        return res.status(201).json({
            success: true,
            message: "Account successfully created"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: ('Server error', error)
        })
    }
}



export const login = async(req, res) => {

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing fields, kindly input your details correctly"
            })
        }


        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Invalid email"
            })
        }

        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            return res.status(404).json({
                success: false,
                message: "Invalid password"
            })
        }
        const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending login email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Account Login",
            text: `Account login successful, if you were not the one. Kindly call customer care.`

        }

        await transporter.sendMail(mailOptions)

        return res.status(200).json({
            success: true,
            message: "Login successful"
        })

    } catch (error) {
        console.log("Server error", error)
        return res.status(500).json({
            success: false,
            message: "Server error"

        })
    }


}


export const getAllUsers = async(req, res) => {
    try {
        const allUsers = await User.find();
        if (allUsers.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Users successfuly fetched",
                data: allUsers
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No user in the database"
            });
        }
    } catch (error) {
        console.log("Server error", error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}


export const deleteUser = async(req, res) => {


    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"

            });

        } else {
            return res.status(200).json({
                success: true,
                message: "User successfully deleted",
                data: deletedUser
            });
        }



    } catch (error) {
        console.log("Server Error", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"

        });
    }
}


export const logout = async(req, res) => {
    res.cookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });
    return res.status(200).json({
        success: true,
        message: "Logged Out"
    })
}