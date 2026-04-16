import nodemailer from 'nodemailer';

/**
 * Email Service for sending OTP verification codes.
 * 
 * Uses Gmail SMTP with App Password.
 * To set up:
 * 1. Enable 2-Step Verification on your Google account
 * 2. Go to https://myaccount.google.com/apppasswords
 * 3. Generate an App Password for "Mail"
 * 4. Add EMAIL_USER and EMAIL_PASS to your .env file
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * Send OTP verification email
     */
    async sendOtpEmail(toEmail, otp) {
        const mailOptions = {
            from: `"NewRoyalCars" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Your Verification Code - NewRoyalCars',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 30px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">NewRoyalCars</h1>
                    <p style="color: #64748b; margin: 0 0 30px 0; font-size: 14px;">Email Verification</p>
                    
                    <p style="color: #1a1a2e; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
                    
                    <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
                        <span style="font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 8px;">${otp}</span>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">This code will expire in <strong>5 minutes</strong>.</p>
                    <p style="color: #64748b; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} NewRoyalCars. All rights reserved.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Email OTP sent to ${toEmail}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('Email send failed:', error.message);
            throw new Error('Failed to send verification email. Please check email configuration.');
        }
    }
}

export default new EmailService();
