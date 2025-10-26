import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, "Please enter a valid email address"]

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, "Password must be at least 6 Characters"]
    },
    verifyOtp: {
        type: String,
        default: "",
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: String,
        default: "",
    },
    resetOtpExpiresAt: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });


const User = mongoose.model("User", userSchema)
export default User;