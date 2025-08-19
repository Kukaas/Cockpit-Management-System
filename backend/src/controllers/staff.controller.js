import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import { ENV } from '../config/env.js';
import { sendStaffAccountEmail, sendAccountStatusEmail, generateSecurePassword } from '../services/email.service.js';

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create staff account (Admin only)
export const createStaffAccount = async (req, res) => {
    try {
        const { email, firstName, lastName, role } = req.body;

        // Validate required fields
        if (!email || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, first name, last name, and role are required.'
            });
        }

        // Validate role
        const validRoles = ['entrance_staff', 'tangkal_staff', 'event_staff', 'registration_staff'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: entrance_staff, tangkal_staff, event_staff, registration_staff'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists.'
            });
        }

        // Generate username from email
        const username = email.split('@')[0];

        // Check if username exists, if so, add a number
        let finalUsername = username;
        let counter = 1;
        while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}${counter}`;
            counter++;
        }

        // Generate secure password
        const generatedPassword = generateSecurePassword();

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new staff user with default password
        // passwordChanged: false ensures the user must change their password on first login
        const staffUser = new User({
            username: finalUsername,
            email,
            password: generatedPassword, // Will be hashed by pre-save middleware
            firstName,
            lastName,
            role,
            isActive: true,
            emailVerified: false,
            verificationToken,
            verificationTokenExpires,
            passwordChanged: false // This prevents the pre-save middleware from setting it to true
        });

        await staffUser.save();

        // Send email with account details
        const emailSent = await sendStaffAccountEmail(
            {
                username: finalUsername,
                password: generatedPassword,
                email,
                firstName,
                lastName,
                role
            },
            verificationToken
        );

        if (!emailSent) {
            // If email fails, delete the user and return error
            await User.findByIdAndDelete(staffUser._id);
            return res.status(500).json({
                success: false,
                message: 'Failed to send account creation email. Please try again.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Staff account created successfully. Email sent with account details.',
            user: {
                id: staffUser._id,
                username: finalUsername,
                email: staffUser.email,
                firstName: staffUser.firstName,
                lastName: staffUser.lastName,
                role: staffUser.role,
                fullName: staffUser.fullName,
                isActive: staffUser.isActive,
                emailVerified: staffUser.emailVerified,
                passwordChanged: staffUser.passwordChanged
            }
        });

    } catch (error) {
        console.error('Create staff account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Verify email token
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required.'
            });
        }

        // Find user with this verification token
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token.'
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in to your account.'
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified.'
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        // Send new verification email
        const emailSent = await sendStaffAccountEmail(
            {
                username: user.username,
                password: 'Use your existing password',
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            verificationToken
        );

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully.'
        });

    } catch (error) {
        console.error('Resend verification email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Get all staff members (Admin only)
export const getAllStaff = async (req, res) => {
    try {
        const { search = '', role = '' } = req.query;

        const query = { role: { $ne: 'admin' } };

        // Add search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        // Add role filter
        if (role) {
            query.role = role;
        }

        const staff = await User.find(query)
            .select('-password -verificationToken -verificationTokenExpires')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: staff
        });

    } catch (error) {
        console.error('Get all staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Get staff by ID
export const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await User.findById(id).select('-password -verificationToken -verificationTokenExpires');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found.'
            });
        }

        if (staff.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot access admin account details.'
            });
        }

        res.status(200).json({
            success: true,
            data: staff
        });

    } catch (error) {
        console.error('Get staff by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Toggle staff account status (enable/disable)
export const toggleStaffStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await User.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found.'
            });
        }

        if (staff.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin account status.'
            });
        }

        // Toggle status
        staff.isActive = !staff.isActive;
        await staff.save();

        // Send email notification
        await sendAccountStatusEmail(staff, staff.isActive);

        res.status(200).json({
            success: true,
            message: `Staff account ${staff.isActive ? 'enabled' : 'disabled'} successfully.`,
            data: {
                id: staff._id,
                username: staff.username,
                email: staff.email,
                firstName: staff.firstName,
                lastName: staff.lastName,
                role: staff.role,
                isActive: staff.isActive,
                emailVerified: staff.emailVerified
            }
        });

    } catch (error) {
        console.error('Toggle staff status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Update staff account (Admin only)
export const updateStaffAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, role } = req.body;

        const staff = await User.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found.'
            });
        }

        if (staff.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin account.'
            });
        }

        // Update fields
        if (firstName) staff.firstName = firstName;
        if (lastName) staff.lastName = lastName;
        if (role) {
            const validRoles = ['entrance_staff', 'tangkal_staff', 'event_staff', 'registration_staff'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role.'
                });
            }
            staff.role = role;
        }

        await staff.save();

        res.status(200).json({
            success: true,
            message: 'Staff account updated successfully.',
            data: {
                id: staff._id,
                username: staff.username,
                email: staff.email,
                firstName: staff.firstName,
                lastName: staff.lastName,
                role: staff.role,
                isActive: staff.isActive,
                emailVerified: staff.emailVerified
            }
        });

    } catch (error) {
        console.error('Update staff account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Delete staff account (Admin only)
export const deleteStaffAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await User.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found.'
            });
        }

        if (staff.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin account.'
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Staff account deleted successfully.'
        });

    } catch (error) {
        console.error('Delete staff account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
