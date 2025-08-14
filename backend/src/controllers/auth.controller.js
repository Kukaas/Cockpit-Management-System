import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../config/env.js';

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId },
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
};

// Set cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie - accessible to JavaScript for client-side token management
    res.cookie('accessToken', accessToken, {
        httpOnly: false, // Allow JavaScript access
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Refresh token cookie - httpOnly for security
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// Clear cookies
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};

// Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Please contact administrator.'
            });
        }

        // Check if email is verified (for staff accounts)
        if (user.role !== 'admin' && !user.emailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Update login history
        user.loginHistory.push({
            ipAddress: req.ip || req.connection.remoteAddress,
            device: req.headers['user-agent'] || 'Unknown'
        });

        // Keep only last 10 login records
        if (user.loginHistory.length > 10) {
            user.loginHistory = user.loginHistory.slice(-10);
        }

        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Register (Admin only)
export const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Validate role
        const validRoles = ['admin', 'entrance_staff', 'tangkal_staff', 'event_staff', 'registration_staff'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role.'
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists.'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            emailVerified: role === 'admin' ? true : false // Admin doesn't need email verification
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Refresh token
export const refreshToken = async (req, res) => {
    try {
        const { accessToken, refreshToken } = generateTokens(req.user._id);

        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.'
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        clearAuthCookies(res);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
