import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from "nodemailer";

export class NodeMailService {
  private transporter: Transporter;
  private static emailPass: string | undefined;
  private static emailUserName: string | undefined;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // specify SMTP host
      port: 465, // Use 465 for SSL
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    NodeMailService.emailPass = process.env.EMAIL_PASS;
    NodeMailService.emailUserName = process.env.EMAIL_USERNAME;
  }

  // Phương thức sendMail sử dụng static
  static async sendMail(email: string, otp: number): Promise<SentMessageInfo> {
    try {
      console.log(email);

      console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
      console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

      const info = await nodemailer
        .createTransport({
          service: "gmail",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME, // Đảm bảo giá trị không undefined
            pass: process.env.EMAIL_PASS, // Đảm bảo giá trị không undefined
          },
        })
        .sendMail({
          from: '"Node Typescript Core 👻" <maseotrang2020@gmail.com>',
          to: email,
          subject: "Xác minh tài khoản",
          text: "Hello world?", // Nội dung văn bản thông thường
          html: `<div>Mã xác thực OTP của bạn là : <b>${otp}</b> <em>(Hiệu lực trong 20 phút)</em></div>`, // Nội dung HTML
        });

      console.log("Message sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Ném ngoại lệ nếu có lỗi
    }
  }
}
