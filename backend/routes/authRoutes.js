import express from "express"
import { deleteUser, getAllUsers, login, register, sendVeriftyOtp, verifyEmail } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router()




authRouter.post("/register", register)

authRouter.post("/login", login)

authRouter.get("/users", getAllUsers)

authRouter.post("/verify-otp", userAuth, sendVeriftyOtp)

authRouter.post("/verify-account", userAuth, verifyEmail)

authRouter.post("/:id", deleteUser)

























export default authRouter;