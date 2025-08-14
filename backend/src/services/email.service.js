import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: ENV.EMAIL_USER,
            pass: ENV.EMAIL_PASS
        }
    });
};

// Generate secure random password
const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// Send staff account creation email
export const sendStaffAccountEmail = async (userData, verificationToken) => {
    try {
        const transporter = createTransporter();

        const verificationUrl = `${ENV.FRONTEND_URL}/verify?token=${verificationToken}`;

        const mailOptions = {
            from: ENV.SMTP_FROM,
            to: userData.email,
            subject: 'Your Staff Account Details - Cockpit Management System',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cockpit Management System - Staff Account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
                        <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px; width: 100%;">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 30px; text-align: center;">
                                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px; color: white;">🏆</span>
                                </div>
                                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Cockpit Management System</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Professional Cockfighting Event Management</p>
                            </div>

                            <!-- Content -->
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #1e3c72; margin: 0 0 30px; font-size: 24px; text-align: center;">Welcome to the Team! 🎉</h2>

                                <!-- Account Details Card -->
                                <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; border-left: 5px solid #1e3c72;">
                                    <h3 style="color: #1e3c72; margin: 0 0 20px; font-size: 20px; display: flex; align-items: center;">
                                        <span style="margin-right: 10px;">👤</span>
                                        Your Account Details
                                    </h3>
                                    <div style="display: grid; gap: 15px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Username:</span>
                                            <span style="font-family: 'Courier New', monospace; background: #f0f4ff; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${userData.username}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Password:</span>
                                            <span style="font-family: 'Courier New', monospace; background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: #856404;">${userData.password}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Role:</span>
                                            <span style="background: #e8f5e8; color: #2d5a2d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${userData.role.replace('_', ' ')}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Full Name:</span>
                                            <span style="font-weight: 600; color: #333;">${userData.firstName} ${userData.lastName}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Verification Section -->
                                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; text-align: center;">
                                    <div style="width: 60px; height: 60px; background: #1976d2; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 30px; color: white;">✓</span>
                                    </div>
                                    <h3 style="color: #1565c0; margin: 0 0 15px; font-size: 20px;">Verify Your Email Address</h3>
                                    <p style="color: #424242; margin: 0 0 25px; line-height: 1.6;">To activate your account and start managing cockpit events, please click the verification button below:</p>
                                    <a href="${verificationUrl}"
                                       style="display: inline-block; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3); transition: all 0.3s ease;">
                                        🔐 Verify Email Address
                                    </a>
                                    <p style="font-size: 12px; color: #666; margin: 20px 0 0; line-height: 1.4;">
                                        If the button doesn't work, copy and paste this link into your browser:<br>
                                        <span style="font-family: 'Courier New', monospace; color: #1976d2; word-break: break-all;">${verificationUrl}</span>
                                    </p>
                                </div>

                                <!-- Security Notice -->
                                <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border-radius: 15px; padding: 25px; border-left: 5px solid #ff9800;">
                                    <h4 style="color: #e65100; margin: 0 0 15px; font-size: 18px; display: flex; align-items: center;">
                                        <span style="margin-right: 10px;">🔒</span>
                                        Security Notice
                                    </h4>
                                    <ul style="color: #bf360c; margin: 0; padding-left: 20px; line-height: 1.8;">
                                        <li>Please change your password after your first login for security</li>
                                        <li>Keep your credentials secure and never share them with others</li>
                                        <li>Contact the administrator immediately if you notice any suspicious activity</li>
                                        <li>Log out from shared computers after each session</li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background: #f5f5f5; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
                                    This is an automated message from the Cockpit Management System.<br>
                                    Please do not reply to this email. For support, contact your administrator.
                                </p>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                    <p style="color: #999; margin: 0; font-size: 12px;">
                                        © 2024 Cockpit Management System. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Staff account email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending staff account email:', error);
        return false;
    }
};

// Send account status change notification
export const sendAccountStatusEmail = async (userData, isEnabled) => {
    try {
        const transporter = createTransporter();

        const status = isEnabled ? 'enabled' : 'disabled';
        const statusIcon = isEnabled ? '✅' : '❌';
        const statusColor = isEnabled ? '#2e7d32' : '#d32f2f';
        const statusBgColor = isEnabled ? '#e8f5e8' : '#ffebee';
        const statusGradient = isEnabled ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';

        const mailOptions = {
            from: ENV.SMTP_FROM,
            to: userData.email,
            subject: `Account ${status.charAt(0).toUpperCase() + status.slice(1)} - Cockpit Management System`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Account Status Update - Cockpit Management System</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
                        <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px; width: 100%;">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 30px; text-align: center;">
                                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px; color: white;">🏆</span>
                                </div>
                                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Cockpit Management System</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Professional Cockfighting Event Management</p>
                            </div>

                            <!-- Content -->
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #1e3c72; margin: 0 0 30px; font-size: 24px; text-align: center;">Account Status Update</h2>

                                <!-- Status Card -->
                                <div style="background: ${statusGradient}; border-radius: 15px; padding: 30px; margin-bottom: 30px; border-left: 5px solid ${statusColor}; text-align: center;">
                                    <div style="width: 80px; height: 80px; background: ${statusColor}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 40px; color: white;">${statusIcon}</span>
                                    </div>
                                    <h3 style="color: ${statusColor}; margin: 0 0 15px; font-size: 24px; font-weight: 600;">
                                        Account ${status.charAt(0).toUpperCase() + status.slice(1)}
                                    </h3>
                                    <p style="color: #424242; margin: 0; font-size: 16px; line-height: 1.6;">
                                        Your account has been <strong>${status}</strong> by the administrator.
                                    </p>
                                </div>

                                <!-- Account Details -->
                                <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; border-left: 5px solid #1e3c72;">
                                    <h3 style="color: #1e3c72; margin: 0 0 20px; font-size: 20px; display: flex; align-items: center;">
                                        <span style="margin-right: 10px;">👤</span>
                                        Account Information
                                    </h3>
                                    <div style="display: grid; gap: 15px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Username:</span>
                                            <span style="font-family: 'Courier New', monospace; background: #f0f4ff; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${userData.username}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Full Name:</span>
                                            <span style="font-weight: 600; color: #333;">${userData.firstName} ${userData.lastName}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Role:</span>
                                            <span style="background: #e8f5e8; color: #2d5a2d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${userData.role.replace('_', ' ')}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e1e8ff;">
                                            <span style="font-weight: 600; color: #1e3c72;">Status:</span>
                                            <span style="background: ${statusBgColor}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Section -->
                                ${isEnabled ? `
                                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; text-align: center;">
                                        <div style="width: 60px; height: 60px; background: #1976d2; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 30px; color: white;">🚀</span>
                                        </div>
                                        <h3 style="color: #1565c0; margin: 0 0 15px; font-size: 20px;">You Can Now Log In!</h3>
                                        <p style="color: #424242; margin: 0; line-height: 1.6;">
                                            Your account has been reactivated successfully. You can now log in to the Cockpit Management System using your existing credentials.
                                        </p>
                                    </div>
                                ` : `
                                    <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px; text-align: center;">
                                        <div style="width: 60px; height: 60px; background: #ff9800; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 30px; color: white;">⚠️</span>
                                        </div>
                                        <h3 style="color: #e65100; margin: 0 0 15px; font-size: 20px;">Account Temporarily Disabled</h3>
                                        <p style="color: #424242; margin: 0 0 15px; line-height: 1.6;">
                                            Your account has been disabled by the administrator. You will not be able to log in until it is reactivated.
                                        </p>
                                        <p style="color: #bf360c; margin: 0; font-weight: 600;">
                                            If you believe this is an error, please contact your administrator immediately.
                                        </p>
                                    </div>
                                `}

                                <!-- Contact Information -->
                                <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 15px; padding: 25px; border-left: 5px solid #9c27b0;">
                                    <h4 style="color: #7b1fa2; margin: 0 0 15px; font-size: 18px; display: flex; align-items: center;">
                                        <span style="margin-right: 10px;">📞</span>
                                        Need Help?
                                    </h4>
                                    <p style="color: #424242; margin: 0; line-height: 1.6;">
                                        If you have any questions or need assistance, please contact your system administrator.
                                        They will be happy to help you with any account-related issues.
                                    </p>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background: #f5f5f5; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
                                    This is an automated message from the Cockpit Management System.<br>
                                    Please do not reply to this email. For support, contact your administrator.
                                </p>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                    <p style="color: #999; margin: 0; font-size: 12px;">
                                        © 2024 Cockpit Management System. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Account status email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending account status email:', error);
        return false;
    }
};

// Generate secure password for staff accounts
export { generateSecurePassword };
