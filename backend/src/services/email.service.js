import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
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
                    <title>Staff Account Created</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 650px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                            color: white;
                            padding: 40px 32px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            letter-spacing: -0.025em;
                        }
                        .content {
                            padding: 40px 32px;
                        }
                        .welcome-text {
                            font-size: 18px;
                            margin-bottom: 32px;
                            color: #475569;
                            line-height: 1.7;
                        }
                        .account-details {
                            background-color: #f1f5f9;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 16px;
                            margin-right: 4px;
                        }
                        .detail-value {
                            color: #475569;
                            font-size: 16px;
                            font-weight: 500;
                        }
                        .password-section {
                            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                            border: 2px solid #f59e0b;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .password-title {
                            color: #92400e;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .password-text {
                            color: #92400e;
                            margin: 0 0 20px 0;
                            font-size: 16px;
                        }
                        .password-display {
                            background-color: #ffffff;
                            border: 2px solid #f59e0b;
                            border-radius: 8px;
                            padding: 16px 24px;
                            margin: 20px 0;
                            font-family: 'Courier New', monospace;
                            font-size: 18px;
                            font-weight: 700;
                            color: #92400e;
                            letter-spacing: 2px;
                            text-align: center;
                        }
                        .verification-section {
                            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                            border: 2px solid #3b82f6;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .verification-title {
                            color: #1e40af;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .verification-text {
                            color: #1e40af;
                            margin: 0 0 24px 0;
                            font-size: 16px;
                        }
                        .verification-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                            color: white !important;
                            text-decoration: none;
                            padding: 16px 32px;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            margin-top: 20px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
                        }
                        .verification-button:hover {
                            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                            transform: translateY(-2px);
                            box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 0;
                            line-height: 1.6;
                        }
                        .highlight {
                            color: #059669;
                            font-weight: 600;
                        }
                        .warning {
                            background-color: #fef2f2;
                            border: 2px solid #fecaca;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 24px 0;
                        }
                        .warning-text {
                            color: #dc2626;
                            font-weight: 600;
                            margin: 0;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cockpit Management System</h1>
                        </div>

                        <div class="content">
                            <p class="welcome-text">
                                Hello <strong>${userData.firstName} ${userData.lastName}</strong>,
                            </p>

                            <p class="welcome-text">
                                Your staff account has been successfully created in the Cockpit Management System.
                                Below are your account details and login credentials:
                            </p>

                            <div class="account-details">
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${userData.firstName} ${userData.lastName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${userData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Role:</span>
                                    <span class="detail-value">${userData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value highlight">Active</span>
                                </div>
                            </div>

                            <div class="password-section">
                                <p class="password-title">🔐 Your Login Credentials</p>
                                <p class="password-text">
                                    Please save these credentials securely. You can change your password after your first login.
                                </p>
                                <div class="password-display">
                                    ${userData.password}
                                </div>
                                <p class="password-text" style="font-size: 14px; margin: 0;">
                                    <strong>Username:</strong> ${userData.username}<br>
                                    <strong>Password:</strong> (shown above)
                                </p>
                            </div>

                            <div class="verification-section">
                                <p class="verification-title">✅ Next Step: Verify Your Email</p>
                                <p class="verification-text">
                                    To complete your account setup and activate your account, please verify your email address by clicking the button below:
                                </p>
                                <a href="${verificationUrl}" class="verification-button">
                                    Verify Email Address
                                </a>
                            </div>

                            <div class="warning">
                                <p class="warning-text">
                                    ⚠️ Important: Keep your password secure and do not share it with anyone.
                                </p>
                            </div>

                            <p style="margin: 32px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                If you have any questions or need assistance, please contact your system administrator.
                            </p>
                        </div>

                        <div class="footer">
                            <p class="footer-text">
                                This is an automated message from the Cockpit Management System.<br>
                                Please do not reply to this email.
                            </p>
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
        const statusColor = isEnabled ? '#059669' : '#dc2626';
        const statusBgColor = isEnabled ? '#ecfdf5' : '#fef2f2';
        const statusBorderColor = isEnabled ? '#a7f3d0' : '#fecaca';

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
                    <title>Account Status Update</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 650px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                            color: white;
                            padding: 40px 32px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            letter-spacing: -0.025em;
                        }
                        .content {
                            padding: 40px 32px;
                        }
                        .status-banner {
                            background: ${isEnabled ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'};
                            border: 3px solid ${statusBorderColor};
                            border-radius: 12px;
                            padding: 32px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .status-icon {
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .status-text {
                            font-size: 24px;
                            font-weight: 700;
                            color: ${statusColor};
                            margin: 0;
                        }
                        .account-info {
                            background-color: #f1f5f9;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .info-label {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 16px;
                        }
                        .info-value {
                            color: #475569;
                            font-size: 16px;
                            font-weight: 500;
                        }
                        .action-section {
                            background: ${isEnabled ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'};
                            border: 2px solid ${isEnabled ? '#f59e0b' : '#f87171'};
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .action-title {
                            color: ${isEnabled ? '#92400e' : '#dc2626'};
                            font-weight: 700;
                            margin: 0 0 16px 0;
                            font-size: 20px;
                        }
                        .action-text {
                            color: ${isEnabled ? '#92400e' : '#dc2626'};
                            margin: 0;
                            font-size: 16px;
                            line-height: 1.6;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 0;
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cockpit Management System</h1>
                        </div>

                        <div class="content">
                            <p style="margin: 0 0 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                Hello <strong>${userData.firstName} ${userData.lastName}</strong>,
                            </p>

                            <div class="status-banner">
                                <div class="status-icon">${statusIcon}</div>
                                <p class="status-text">
                                    Your account has been ${status}
                                </p>
                            </div>

                            <p style="margin: 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                This is to inform you that your account status in the Cockpit Management System has been updated.
                            </p>

                            <div class="account-info">
                                <div class="info-row">
                                    <span class="info-label">Full Name:</span>
                                    <span class="info-value">${userData.firstName} ${userData.lastName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Email:</span>
                                    <span class="info-value">${userData.email}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Role:</span>
                                    <span class="info-value">${userData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Current Status:</span>
                                    <span class="info-value" style="color: ${statusColor}; font-weight: 600; font-size: 18px;">
                                        ${isEnabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            ${isEnabled ? `
                                <div class="action-section">
                                    <p class="action-title">🎉 Account Reactivated!</p>
                                    <p class="action-text">
                                        Your account is now active and you can access the system.
                                        If you experience any issues logging in, please contact your administrator.
                                    </p>
                                </div>
                            ` : `
                                <div class="action-section">
                                    <p class="action-title">⚠️ Account Deactivated</p>
                                    <p class="action-text">
                                        Your account access has been temporarily suspended.
                                        Please contact your administrator for more information.
                                    </p>
                                </div>
                            `}

                            <p style="margin: 32px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                If you have any questions about this status change, please contact your system administrator.
                            </p>
                        </div>

                        <div class="footer">
                            <p class="footer-text">
                                This is an automated message from the Cockpit Management System.<br>
                                Please do not reply to this email.
                            </p>
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

// Send participant registration confirmation email
export const sendParticipantRegistrationEmail = async (participantData, eventData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: ENV.SMTP_FROM,
            to: participantData.email,
            subject: `Registration Confirmed - ${eventData.eventName}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Registration Confirmed</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 650px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: white;
                            padding: 40px 32px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            letter-spacing: -0.025em;
                        }
                        .content {
                            padding: 40px 32px;
                        }
                        .welcome-text {
                            font-size: 18px;
                            margin-bottom: 32px;
                            color: #475569;
                            line-height: 1.7;
                        }
                        .success-banner {
                            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                            border: 3px solid #a7f3d0;
                            border-radius: 12px;
                            padding: 32px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .success-icon {
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .success-text {
                            font-size: 24px;
                            font-weight: 700;
                            color: #059669;
                            margin: 0;
                        }
                        .event-details {
                            background-color: #f1f5f9;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 16px;
                            margin-right: 4px;
                        }
                        .detail-value {
                            color: #475569;
                            font-size: 16px;
                            font-weight: 500;
                        }
                        .participant-info {
                            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                            border: 2px solid #3b82f6;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .participant-title {
                            color: #1e40af;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .important-section {
                            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                            border: 2px solid #f59e0b;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .important-title {
                            color: #92400e;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .important-text {
                            color: #92400e;
                            margin: 0;
                            font-size: 16px;
                            line-height: 1.6;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 0;
                            line-height: 1.6;
                        }
                        .highlight {
                            color: #059669;
                            font-weight: 600;
                        }
                        .currency {
                            color: #dc2626;
                            font-weight: 700;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cockpit Management System</h1>
                        </div>

                        <div class="content">
                            <p class="welcome-text">
                                Dear <strong>${participantData.participantName}</strong>,
                            </p>

                            <div class="success-banner">
                                <div class="success-icon">🎉</div>
                                <p class="success-text">
                                    Registration Successful!
                                </p>
                            </div>

                            <p class="welcome-text">
                                Congratulations! Your registration for the cockfighting event has been successfully confirmed.
                                Below are your registration details:
                            </p>

                            <div class="participant-info">
                                <p class="participant-title">👤 Participant Information</p>
                                <div class="detail-row">
                                    <span class="detail-label">Full Name:</span>
                                    <span class="detail-value">${participantData.participantName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Contact Number:</span>
                                    <span class="detail-value">${participantData.contactNumber}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${participantData.email}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Address:</span>
                                    <span class="detail-value">${participantData.address}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Registration Status:</span>
                                    <span class="detail-value highlight">Confirmed</span>
                                </div>
                            </div>

                            <div class="event-details">
                                <p style="font-weight: 700; color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">🏆 Event Details</p>
                                <div class="detail-row">
                                    <span class="detail-label">Event Name:</span>
                                    <span class="detail-value">${eventData.eventName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date & Time:</span>
                                    <span class="detail-value">${new Date(eventData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value">${eventData.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Event Type:</span>
                                    <span class="detail-value">${participantData.eventType === 'fastest_kill' ? 'Fastest Kill' : participantData.eventType.charAt(0).toUpperCase() + participantData.eventType.slice(1)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Entry Fee:</span>
                                    <span class="detail-value currency">₱${participantData.entryFee.toLocaleString('en-PH')}</span>
                                </div>
                            </div>

                            ${participantData.notes ? `
                                <div style="background-color: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
                                    <p style="font-weight: 600; color: #1e293b; margin: 0 0 12px 0;">📝 Additional Notes:</p>
                                    <p style="color: #475569; margin: 0; font-style: italic;">${participantData.notes}</p>
                                </div>
                            ` : ''}

                            <p style="margin: 32px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Thank you for your registration! We look forward to seeing you at the event.
                                If you have any questions or need to make changes to your registration, please contact us immediately.
                            </p>
                        </div>

                        <div class="footer">
                            <p class="footer-text">
                                This is an automated confirmation from the Cockpit Management System.<br>
                                Please save this email for your records.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Participant registration email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending participant registration email:', error);
        return false;
    }
};

// Generate secure password for staff accounts
export { generateSecurePassword };

// Send cage rental payment reminder email
export const sendCageRentalReminderEmail = async (cageRentalData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: ENV.SMTP_FROM,
            to: cageRentalData.email,
            subject: `Payment Reminder - Cage Rental ${cageRentalData.cageNo}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Reminder</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 650px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                            color: white;
                            padding: 40px 32px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            letter-spacing: -0.025em;
                        }
                        .content {
                            padding: 40px 32px;
                        }
                        .reminder-banner {
                            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                            border: 3px solid #fecaca;
                            border-radius: 12px;
                            padding: 32px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .reminder-icon {
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .reminder-text {
                            font-size: 24px;
                            font-weight: 700;
                            color: #dc2626;
                            margin: 0;
                        }
                        .rental-details {
                            background-color: #f1f5f9;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 16px;
                            margin-right: 4px;
                        }
                        .detail-value {
                            color: #475569;
                            font-size: 16px;
                            font-weight: 500;
                        }
                        .payment-section {
                            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                            border: 2px solid #f59e0b;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .payment-title {
                            color: #92400e;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .payment-text {
                            color: #92400e;
                            margin: 0;
                            font-size: 16px;
                            line-height: 1.6;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 0;
                            line-height: 1.6;
                        }
                        .currency {
                            color: #dc2626;
                            font-weight: 700;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cockpit Management System - Cage Rental Payment Reminder</h1>
                        </div>

                        <div class="content">
                            <p style="margin: 0 0 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                Dear <strong>${cageRentalData.nameOfRenter}</strong>,
                            </p>

                            <div class="reminder-banner">
                                <div class="reminder-icon">⚠️</div>
                                <p class="reminder-text">
                                    Payment Reminder
                                </p>
                            </div>

                            <p style="margin: 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                This is a friendly reminder that your cage rental payment is still pending. Please complete your payment to secure your reservation.
                            </p>

                            <div class="rental-details">
                                <p style="font-weight: 700; color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">📋 Rental Details</p>
                                <div class="detail-row">
                                    <span class="detail-label">Cage Number:</span>
                                    <span class="detail-value">${cageRentalData.cageNo?.cageNumber || cageRentalData.cageNo}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Rental Date:</span>
                                    <span class="detail-value">${new Date(cageRentalData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Rental Price:</span>
                                    <span class="detail-value currency">₱${cageRentalData.price.toLocaleString('en-PH')}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Payment Status:</span>
                                    <span class="detail-value" style="color: #dc2626; font-weight: 600;">Unpaid</span>
                                </div>
                            </div>

                            <div class="payment-section">
                                <p class="payment-title">💳 Payment Information</p>
                                <div class="payment-text">
                                    <p style="margin: 0 0 12px 0;"><strong>Amount Due:</strong> ₱${cageRentalData.price.toLocaleString('en-PH')}</p>
                                    <p style="margin: 0 0 12px 0;"><strong>Due Date:</strong> ${new Date(cageRentalData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>
                                    <p style="margin: 0;"><strong>Contact:</strong> Please contact the arena management for payment instructions</p>
                                </div>
                            </div>

                            <p style="margin: 32px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Please complete your payment as soon as possible to avoid any cancellation of your reservation. If you have any questions, please contact us immediately.
                            </p>
                        </div>

                        <div class="footer">
                            <p class="footer-text">
                                This is an automated reminder from the Cockpit Management System.<br>
                                Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Cage rental reminder email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending cage rental reminder email:', error);
        return false;
    }
};

// Send cage rental payment confirmation email
export const sendCageRentalPaymentConfirmationEmail = async (cageRentalData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: ENV.SMTP_FROM,
            to: cageRentalData.email,
            subject: `Payment Confirmed - Cage Rental ${cageRentalData.cageNo?.cageNumber || cageRentalData.cageNo}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Confirmed</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 650px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: white;
                            padding: 40px 32px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            letter-spacing: -0.025em;
                        }
                        .content {
                            padding: 40px 32px;
                        }
                        .success-banner {
                            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                            border: 3px solid #a7f3d0;
                            border-radius: 12px;
                            padding: 32px;
                            margin: 32px 0;
                            text-align: center;
                        }
                        .success-icon {
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .success-text {
                            font-size: 24px;
                            font-weight: 700;
                            color: #059669;
                            margin: 0;
                        }
                        .rental-details {
                            background-color: #f1f5f9;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 16px;
                            margin-right: 4px;
                        }
                        .detail-value {
                            color: #475569;
                            font-size: 16px;
                            font-weight: 500;
                        }
                        .confirmation-section {
                            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                            border: 2px solid #3b82f6;
                            border-radius: 10px;
                            padding: 28px;
                            margin: 32px 0;
                        }
                        .confirmation-title {
                            color: #1e40af;
                            font-weight: 700;
                            font-size: 20px;
                            margin: 0 0 16px 0;
                        }
                        .confirmation-text {
                            color: #1e40af;
                            margin: 0;
                            font-size: 16px;
                            line-height: 1.6;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 32px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 0;
                            line-height: 1.6;
                        }
                        .currency {
                            color: #059669;
                            font-weight: 700;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cage Rental Payment Confirmed</h1>
                        </div>

                        <div class="content">
                            <p style="margin: 0 0 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                Dear <strong>${cageRentalData.nameOfRenter}</strong>,
                            </p>

                            <div class="success-banner">
                                <div class="success-icon">✅</div>
                                <p class="success-text">
                                    Payment Confirmed!
                                </p>
                            </div>

                            <p style="margin: 32px 0; color: #475569; font-size: 18px; line-height: 1.7;">
                                Thank you! Your cage rental payment has been successfully processed and confirmed.
                            </p>

                            <div class="rental-details">
                                <p style="font-weight: 700; color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">📋 Rental Details</p>
                                <div class="detail-row">
                                    <span class="detail-label">Cage Number:</span>
                                    <span class="detail-value">${cageRentalData.cageNo?.cageNumber || cageRentalData.cageNo}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Rental Date:</span>
                                    <span class="detail-value">${new Date(cageRentalData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount Paid:</span>
                                    <span class="detail-value currency">₱${cageRentalData.price.toLocaleString('en-PH')}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Payment Status:</span>
                                    <span class="detail-value" style="color: #059669; font-weight: 600;">Paid</span>
                                </div>
                            </div>

                            <p style="margin: 32px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Thank you for choosing our arena. If you have any questions or need to make changes to your reservation, please contact us immediately.
                            </p>
                        </div>

                        <div class="footer">
                            <p class="footer-text">
                                This is an automated confirmation from the Cockpit Management System.<br>
                                Please save this email for your records.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Cage rental payment confirmation email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending cage rental payment confirmation email:', error);
        return false;
    }
};
