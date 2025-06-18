import nodemailer from 'nodemailer';

export async function sendResetEmail(email: string, link: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: '비밀번호 재설정',
    html: `<p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p><a href="${link}">${link}</a>`,
  });
}
