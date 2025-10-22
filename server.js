import "dotenv/config";
import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
import connectToDB from "./backend/config/db.js";
import authRouter from "./backend/routes/authRoutes.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

connectToDB();

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on localhost://${PORT}`);
});