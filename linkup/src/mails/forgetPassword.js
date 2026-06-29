export const resetPasswordEmail =(otpCode)=>{
    return `<div style="background: #F7F9FB; padding: 40px 20px; font-family: 'Montserrat', Arial, sans-serif; text-align: center;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                
                <!-- Brand Header Bar -->
                <div style="background: #065F46; padding: 24px; color: white; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">
                    Link<span style="color: #FFBF00;">Up</span>
                </div>

                <!-- Core Transaction Body -->
                <div style="padding: 32px 24px;">
                    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Password Reset</h2>
                    <p style="color: #374151; font-size: 15px; line-height: 24px; margin-bottom: 24px;">
                        Use the secure One-Time Password (OTP) validation code sequence below to finalize your session change:
                    </p>

                    <!-- Gold Code Display Hub -->
                    <div style="background: #065F46; display: inline-block; padding: 16px 32px; border-radius: 8px; border: 2px solid #FFBF00; margin-bottom: 24px;">
                        <span style="font-size: 32px; font-weight: bold; color: #FFBF00; letter-spacing: 4px; font-family: monospace;">${otpCode}</span>
                    </div>

                    <!-- Warning Indicator -->
                    <div style="background: #FEF3C7; color: #92400E; font-size: 13px; padding: 12px; border-radius: 6px; text-align: left; border-left: 4px solid #FFBF00; margin-bottom: 16px;">
                        ⚠️ This code is active for exactly <strong>10 minutes</strong>. After expiration, you must request a new one.
                    </div>

                    <p style="color: #6B7280; font-size: 13px; margin: 0;">
                        If you did not make this request, you can safely ignore this email.
                    </p>
                </div>

            </div>
        </div>
    `
}