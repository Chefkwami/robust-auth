import express from "express"
import { deleteUser, getAllUsers, login, register } from "../controllers/authController.js";

const authRouter = express.Router()




authRouter.post("/register", register)

authRouter.post("/login", login)

authRouter.get("/users", getAllUsers)

authRouter.post("/:id", deleteUser)

























export default authRouter;