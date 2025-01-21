import nodemailer from 'nodemailer';

/**
 * Creates and configures a Nodemailer transporter for sending emails via Gmail's SMTP server.
 * 
 * The transporter is configured to use OAuth2 authentication with credentials provided 
 * via environment variables. Ensure that the required environment variables are set:
 * - `SMTP_PORT`: The SMTP port (typically 465 for secure connections).
 * - `CLIENT_ID`: The OAuth2 client ID.
 * - `CLIENT_SECRET`: The OAuth2 client secret.
 * 
 * @returns A pre-configured Nodemailer transporter instance.
 */
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: process.env.SMTP_PORT, // SMTP port (e.g., 465)
  secure: true, // Use SSL for secure connections
  auth: {
    type: 'OAuth2', // OAuth2 authentication
    clientId: process.env.CLIENT_ID, // OAuth2 client ID
    clientSecret: process.env.CLIENT_SECRET, // OAuth2 client secret
  },
});

export default transporter;
