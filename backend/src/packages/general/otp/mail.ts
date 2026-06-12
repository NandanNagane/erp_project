import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "om.farakate@hiddenbrains.in",
    pass: "slfkpahedkxpiuqs",
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    // from: `"ZProject Support" <${"omifarakate@gmail.com"}>`,
    from : "om.farakate@hiddenbrains.in",
    to: email,
    subject: "Forgot Password OTP Verification",
    html: `
      <div>
        <h2>Password Reset OTP</h2>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: 1, message: "OTP sent successfully" };
  } catch (error: any) {
    return { success: 0, message: error.message };
  }
};