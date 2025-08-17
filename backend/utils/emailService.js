

import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"

// DEBUG: Log SMTP credentials to verify they are loaded
console.log('SMTP_USER:', process.env.SMTP_USER)
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[HIDDEN]' : undefined)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const subject = "Booking Confirmation - Tour Guide"
  const html = `
    <h1>Booking Confirmation</h1>
    <p>Dear ${bookingDetails.userName},</p>
    <p>Your booking has been confirmed!</p>
    <h3>Booking Details:</h3>
    <ul>
      <li>Tour: ${bookingDetails.tourTitle}</li>
      <li>Date: ${bookingDetails.startDate}</li>
      <li>Number of People: ${bookingDetails.numberOfPeople}</li>
      <li>Total Price: $${bookingDetails.totalPrice}</li>
    </ul>
    <p>Thank you for choosing Tour Guide!</p>
  `

  return sendEmail(userEmail, subject, html)
}
