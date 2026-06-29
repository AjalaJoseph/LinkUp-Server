import { transporter } from '../config/nodeMailer.js';
import dotenv from 'dotenv'
dotenv.config()
import { resetPasswordEmail } from '../mails/forgetPassword.js';
export const sendResetPasswordOtp = async(email, otpCode) =>{
    await transporter.sendMail({
         from: '"LinkUp No-Reply" <noreply@linkup.app>', 
        to: email,
        subject: '🔒 Reset Your LinkUp Password',
        text: `Your LinkUp verification code is: ${otpCode}. It will expire in 10 minutes.`,
        html:resetPasswordEmail(otpCode)
    })
}