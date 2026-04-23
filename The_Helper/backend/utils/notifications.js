const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email transporter
let emailTransporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  logger.info('Email service configured');
} else {
  logger.warn('Email service not configured - skipping email notifications');
}

// Twilio client
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info('SMS service configured');
  } catch (error) {
    logger.warn('SMS service not configured - skipping SMS notifications');
  }
} else {
  logger.warn('SMS service not configured - skipping SMS notifications');
}

/**
 * Send email notification
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!emailTransporter) {
    logger.warn(`Email not sent (service disabled): ${subject} to ${to}`);
    return { success: false, reason: 'Email service not configured' };
  }

  try {
    const info = await emailTransporter.sendMail({
      from: `"Black Gold Health" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS notification
 */
const sendSMS = async ({ to, message }) => {
  if (!twilioClient) {
    logger.warn(`SMS not sent (service disabled): ${message.substring(0, 50)}... to ${to}`);
    return { success: false, reason: 'SMS service not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });

    logger.info(`SMS sent: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error(`SMS error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send SOS alert to hospital
 */
const notifyHospitalSOS = async (hospital, sosData) => {
  const { patient, location } = sosData;

  // Email notification
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6a00;">🚨 EMERGENCY SOS ALERT</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Patient Information:</h3>
        <p><strong>Name:</strong> ${patient.name || 'Unknown'}</p>
        <p><strong>Age:</strong> ${patient.age || 'N/A'}</p>
        <p><strong>Blood Type:</strong> ${patient.bloodType || 'Unknown'}</p>
        <p><strong>Allergies:</strong> ${patient.allergies || 'None reported'}</p>
        <p><strong>Medical Conditions:</strong> ${patient.conditions || 'None reported'}</p>
      </div>
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Location:</h3>
        <p><strong>Coordinates:</strong> ${location.coordinates[1]}, ${location.coordinates[0]}</p>
        <p><strong>Address:</strong> ${location.address || 'Not available'}</p>
        <p><a href="https://www.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}" 
             style="color: #ff6a00; text-decoration: none;">View on Google Maps →</a></p>
      </div>
      <p style="margin-top: 20px;">
        Please log in to the hospital dashboard to accept or decline this emergency.
      </p>
    </div>
  `;

  // SMS message
  const smsMessage = `🚨 EMERGENCY SOS - Patient: ${patient.name || 'Unknown'}, Location: ${location.coordinates[1]}, ${location.coordinates[0]}. Log in to dashboard to respond.`;

  const results = {
    email: null,
    sms: null
  };

  if (hospital.email) {
    results.email = await sendEmail({
      to: hospital.email,
      subject: '🚨 EMERGENCY SOS ALERT',
      html: emailHtml
    });
  }

  if (hospital.phone) {
    results.sms = await sendSMS({
      to: hospital.phone,
      message: smsMessage
    });
  }

  return results;
};

module.exports = {
  sendEmail,
  sendSMS,
  notifyHospitalSOS
};
