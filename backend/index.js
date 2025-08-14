import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Config
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import staffRoutes from "./src/routes/staff.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const corsOptions = {
    origin: [ENV.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});


connectDB();

export default app;
