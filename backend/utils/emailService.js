import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (userEmail, code) => {
  try {
    const data = await resend.emails.send({
      // LƯU Ý: Nếu chưa add domain riêng, chỉ được dùng 'onboarding@resend.dev'
      from: 'onboarding@resend.dev', 
      
      // LƯU Ý: Nếu chưa add domain, chỉ gửi được đến email chính chủ tài khoản Resend
      to: "hoangvanbinh14122005@gmail.com", 
      
      subject: 'Mã xác nhận của bạn',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Xin chào!</h2>
          <p>Mã xác nhận của bạn là:</p>
          <h1 style="color: #0070f3; letter-spacing: 5px;">${code}</h1>
          <p>Mã này sẽ hết hạn trong 5 phút.</p>
        </div>
      `
    });

    console.log("Email sent ID:", data.id);
    return { success: true, data };
    
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    return { success: false, error };
  }
};

// --- Ví dụ cách dùng trong Express Route ---
// app.post('/send-code', async (req, res) => {
//    const { email } = req.body;
//    const code = "123456"; // Code sinh ngẫu nhiên của bạn
//
//    // Gọi hàm gửi mail
//    const result = await sendVerificationEmail(email, code);
//
//    if (result.success) {
//       return res.status(200).json({ message: "Đã gửi mã!" });
//    } else {
//       return res.status(500).json({ message: "Gửi thất bại", error: result.error });
//    }
// });