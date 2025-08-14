import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../config/env.js';

// Verify JWT token from cookies or Authorization header
export const verifyToken = async (req, res, next) => {
    try {
        // Check for token in Authorization header first, then cookies
        let accessToken = null;

        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }

        // If no token in header, check cookies
        if (!accessToken) {
            accessToken = req.cookies.accessToken;
        }

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Access token not found. Please login.'
            });
        }

        const decoded = jwt.verify(accessToken, ENV.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Please contact administrator.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired. Please refresh your session.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

// Check if user has required role(s)
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access this resource.'
            });
        }

        next();
    };
};

// Verify refresh token
export const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found.'
            });
        }

        const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token.'
        });
    }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (accessToken) {
            const decoded = jwt.verify(accessToken, ENV.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
