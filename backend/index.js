import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Config
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const corsOptions = {
    origin: [ENV.FRONTEND_URL, "http://localhost:5173", "https://prc-phi-lake.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});


connectDB();

export default app;
