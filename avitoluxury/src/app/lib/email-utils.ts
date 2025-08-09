import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER || 'info@avitoluxury.in',
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to admin email
export const sendAdminOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return false;
    }

    const mailOptions = {
      from: `Admin Panel <${process.env.EMAIL_USER || 'info@avitoluxury.in' || 'admin@avitoluxury.in'}>`,
      to: email,
      subject: 'Admin Panel OTP Verification',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Panel OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f9fc;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header img {
      max-height: 50px;
    }
    .otp-box {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      text-align: center;
      background-color: #f2f4f8;
      padding: 15px 0;
      border-radius: 6px;
      color: #333;
      margin: 20px 0;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #444;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png" alt="AvitoLuxury Logo" />
      <h2>Admin OTP Verification</h2>
    </div>
    <p class="message">
      Hello Admin,<br><br>
      Your One-Time Password (OTP) to access the Admin Panel is:
    </p>
    <div class="otp-box">
      ${otp}
    </div>
    <p class="message">
      This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.
    </p>
    <p class="message">
      If you did not request this OTP, please ignore this email.
    </p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} AvitoLuxury.in • Secure Admin Access
    </div>
  </div>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


// Send contact form notification to admin
export const sendContactFormEmail = async (
  contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }
): Promise<boolean> => {
  try {
    const transporter = require('nodemailer').createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const { name, email, phone, subject, message } = contactData;
    const currentYear = new Date().getFullYear();
    const dateTime = new Date().toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    const mailOptions = {
      from: `AVITO LUXURY Website <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: process.env.EMAIL_RECIPIENT || 'avitoluxury@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Luxury Contact Form Email</title>
          <style>
            body {
              font-family: 'Georgia', serif;
            }
          </style>
        </head>
        <body style="background: linear-gradient(to bottom right, #f3f4f6, #d1d5db); padding: 24px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px;">

            <!-- Title -->
            <h2 style="font-size: 28px; font-weight: bold; text-align: center; color: #1c1f36; letter-spacing: 0.5px; margin-bottom: 8px;">New Message Received</h2>
            <p style="text-align: center; color: #9b870c; font-size: 13px; margin-bottom: 32px; text-transform: uppercase;">From your website contact form</p>

            <!-- Info Block -->
            <div style="font-size: 15px; color: #1f2937; line-height: 1.6;">
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Full Name:</strong> ${name}</div>
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Email:</strong> <a href="mailto:${email}" style="color: #0056b3; text-decoration: none;">${email}</a></div>
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Phone:</strong> ${phone || 'Not provided'}</div>
              <div><strong style="width: 120px; display: inline-block; color: #4b5563;">Subject:</strong> ${subject}</div>
            </div>

            <!-- Message Section -->

<div style="margin-top: 32px;">
  <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px;">Message:</div>
  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
    <tr>
      <td style="
        background-color: #f9f9f9;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        font-size: 15px;
        color: #111827;
        line-height: 1.6;
        white-space: pre-line;
        word-break: break-word;
      ">
        ${message}
      </td>
    </tr>
  </table>
</div>

             <!-- Footer with Logo -->
    <table width="100%" style="margin-top: 40px; font-size: 11px; color: #9ca3af;">
      <tr>
        <td style="text-align: left;">${dateTime}</td>
        <td style="text-align: right;">
          <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752250731/avitologo3_yt1lzu.png"
               alt="Avito Logo"
               style="width: 200px; height: auto; opacity: 0.9;" />
        </td>
      </tr>
    </table>

    <!-- Copyright -->
    <div style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px;">
      &copy; ${currentYear} AVITO LUXURY. All rights reserved.
    </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

// Send order confirmation email to admin
export const sendOrderConfirmationEmail = async (
  orderData: {
    user: {
      fullName: string;
      email: string;
      phone: string;
      alternatePhone?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
    order: {
      items: Array<{
        name: string;
        category: string;
        subCategory: string;
        volume: string;
        image: string;
        quantity: number;
        price: number;
        total: number;
      }>;
    };
    payment: {
      id: string;
      amount: number;
      method: string;
      date: string;
    };
  }
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Process order items to create HTML rows
    const itemRows = orderData.order.items.map(item => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; vertical-align: top;">
          <div style="display: flex; align-items: center;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
            ${item.name}
          </div>
        </td>
        <td style="padding: 10px; vertical-align: top;">${item.category}</td>
        <td style="padding: 10px; vertical-align: top;">${item.subCategory}</td>
        <td style="padding: 10px; vertical-align: top;">${item.volume}</td>
        <td style="padding: 10px; text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; vertical-align: top;">₹${item.price}</td>
        <td style="padding: 10px; text-align: right; vertical-align: top;">₹${item.total}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `AVITO LUXURY Order <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: process.env.EMAIL_RECIPIENT || 'avitoluxury@gmail.com',
      subject: `New Order Received - Payment Successful`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="700" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px; overflow: hidden; padding: 30px;">
          
          <!-- Header -->
          <tr>
            <td>
              <h2 style="margin-top: 0; color: #2c3e50;">🛒 New Order Received</h2>
              <p style="margin-bottom: 20px;">A new order has been placed and payment has been successfully received. Please find the order details below:</p>
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td>
              <h3 style="color: #2980b9;">🧍‍♂️ Customer Information</h3>
              <table cellpadding="5" cellspacing="0" style="width: 100%; font-size: 14px;">
                <tr>
                  <td><strong>Name:</strong></td>
                  <td>${orderData.user.fullName}</td>
                </tr>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>${orderData.user.email}</td>
                </tr>
                <tr>
                  <td><strong>Phone:</strong></td>
                  <td>${orderData.user.phone}</td>
                </tr>
                ${orderData.user.alternatePhone ? `
                <tr>
                  <td><strong>Alternate Phone:</strong></td>
                  <td>${orderData.user.alternatePhone}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding-top: 20px;">
              <h3 style="color: #2980b9;">📦 Shipping Address</h3>
              <p style="font-size: 14px;">
                ${orderData.user.address.line1}<br />
                ${orderData.user.address.line2 ? orderData.user.address.line2 + '<br />' : ''}
                ${orderData.user.address.city}, ${orderData.user.address.state} - ${orderData.user.address.zip}<br />
                ${orderData.user.address.country}
              </p>
            </td>
          </tr>

          <!-- Product Details -->
          <tr>
            <td style="padding-top: 20px;">
              <h3 style="color: #2980b9;">🛍️ Product Details</h3>
              <table width="100%" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #ecf0f1;">
                    <th style="padding: 12px; text-align: left;">Product</th>
                    <th style="padding: 12px; text-align: left;">Category</th>
                    <th style="padding: 12px; text-align: left;">Sub-Category</th>
                    <th style="padding: 12px; text-align: left;">Volume</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td>
              <h3 style="color: #2980b9;">💳 Payment Details</h3>
              <table cellpadding="5" cellspacing="0" style="width: 100%; font-size: 14px;">
                <tr>
                  <td><strong>Payment ID:</strong></td>
                  <td>${orderData.payment.id}</td>
                </tr>
                <tr>
                  <td><strong>Amount Paid:</strong></td>
                  <td>₹${orderData.payment.amount}</td>
                </tr>
                <tr>
                  <td><strong>Payment Method:</strong></td>
                  <td>${orderData.payment.method}</td>
                </tr>
                <tr>
                  <td><strong>Date:</strong></td>
                  <td>${orderData.payment.date}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px; font-size: 12px; color: #999;">
              <p>This is an automated message from your order system. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// Send product notification email to subscribers
export const sendProductNotificationEmail = async (
  subscriberEmail: string,
  productData: {
    name: string;
    type: string;
    subCategory: string;
    volume: string;
    image: string;
    slug: string;
  }
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return false;
    }

    const { name, type, subCategory, volume, image, slug } = productData;
    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://avitoluxury.in'}/product/${slug}`;
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://avitoluxury.in'}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

    const mailOptions = {
      from: `AVITO LUXURY <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: subscriberEmail,
      subject: `New Product Alert: ${name} is now available!`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Product Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #000;
      text-align: center;
      padding: 30px;
    }
    .header img {
      max-width: 180px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
      color: #333333;
    }
    .content h2 {
      color: #c19b6c;
      margin-bottom: 20px;
    }
    .product-img {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .product-details p {
      margin: 6px 0;
      font-size: 15px;
    }
    .product-details strong {
      color: #000;
    }
    .btn {
      display: inline-block;
      margin-top: 25px;
      background-color: #c19b6c;
      color: #fff;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      background-color: #f1f1f1;
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 15px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png" alt="AvitoLuxury Logo">
    </div>

    <div class="content">
      <h2>🎉 New Product Added to AvitoLuxury</h2>
      <p>Hey there,</p>
      <p>We just added a new premium perfume to our collection. Here are the details:</p>

      <img src="${image}" alt="${name}" class="product-img">

      <div class="product-details">
        <p><strong>Product Name:</strong> ${name}</p>
        <p><strong>Product Type:</strong> ${type}</p>
        <p><strong>Sub-Category:</strong> ${subCategory}</p>
        <p><strong>Volume:</strong> ${volume}</p>
      </div>

      <a href="${productUrl}" class="btn">View Product</a>
    </div>

    <div class="footer">
      You are receiving this email because you subscribed to AvitoLuxury product notifications.<br />
      <a href="${unsubscribeUrl}" style="color: #c19b6c;">Unsubscribe</a> if you no longer wish to receive these updates.
    </div>
  </div>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Product notification email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending product notification email:', error);
    return false;
  }
};

// Generate HTML for custom email templates
function generateCustomEmailHtml(
  template: {
    subject: string;
    heading: string;
    content: string;
    imageUrl: string;
    buttonText?: string;
    buttonLink?: string;
    buttons?: Array<{ text: string; link: string }>;
  },
  styles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    headingAlignment: 'left' | 'center' | 'right';
    logoAlignment: 'left' | 'center' | 'right';
    contentAlignment: 'left' | 'center' | 'right';
  }
): string {
  // Generate buttons HTML
  let buttonsHtml = '';
  
  // Handle single button
  if (template.buttonText && template.buttonLink) {
    buttonsHtml = `
      <a href="${template.buttonLink}" 
         style="display: inline-block; background-color: ${styles.accentColor}; color: white; 
                padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                margin-top: 20px; font-weight: bold;">
        ${template.buttonText}
      </a>
    `;
  } 
  // Handle multiple buttons
  else if (template.buttons && template.buttons.length > 0) {
    buttonsHtml = template.buttons.map(button => `
      <a href="${button.link}" 
         style="display: inline-block; background-color: ${styles.accentColor}; color: white; 
                padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                margin: 10px 5px; font-weight: bold;">
        ${button.text}
      </a>
    `).join('');
  }

  // Generate the full email HTML
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: ${styles.textColor};
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${styles.backgroundColor};
          padding: 20px;
        }
        .header {
          text-align: ${styles.logoAlignment};
          padding: 20px 0;
        }
        .header img {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 20px 0;
          text-align: ${styles.contentAlignment};
        }
        h1 {
          color: ${styles.accentColor};
          text-align: ${styles.headingAlignment};
          margin-bottom: 20px;
        }
        .image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          margin: 20px 0;
        }
        .button-container {
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #eeeeee;
          margin-top: 20px;
        }
        .footer a {
          color: ${styles.accentColor};
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png" alt="AVITO LUXURY Logo">
        </div>
        
        <div class="content">
          <h1>${template.heading}</h1>
          
          ${template.imageUrl ? `<img src="${template.imageUrl}" alt="Email Image" class="image">` : ''}
          
          <div style="line-height: 1.6;">
            ${template.content}
          </div>
          
          <div class="button-container">
            ${buttonsHtml}
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AVITO LUXURY. All rights reserved.</p>
          <p>
            <a href="https://avitoluxury.in/privacy-policy">Privacy Policy</a> | 
            <a href="https://avitoluxury.in/terms-of-service">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send custom email to multiple recipients
export const sendCustomEmail = async (
  recipients: string[],
  template: {
    subject: string;
    heading: string;
    content: string;
    imageUrl: string;
    buttonText?: string;
    buttonLink?: string;
    buttons?: Array<{ text: string; link: string }>;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
      headingAlignment?: 'left' | 'center' | 'right';
      logoAlignment?: 'left' | 'center' | 'right';
      contentAlignment?: 'left' | 'center' | 'right';
    };
  },
  attachments?: Array<{
    filename: string;
    path: string;
    mimeType: string;
    url: string;
  }>
): Promise<{success: boolean; sentCount: number}> => {
  try {
    const transporter = createTransporter();

    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return { success: false, sentCount: 0 };
    }

    // Default styles
    const styles = {
      backgroundColor: template.styles?.backgroundColor || '#ffffff',
      textColor: template.styles?.textColor || '#333333',
      accentColor: template.styles?.accentColor || '#c19b6c',
      headingAlignment: template.styles?.headingAlignment || 'center',
      logoAlignment: template.styles?.logoAlignment || 'center',
      contentAlignment: template.styles?.contentAlignment || 'left'
    };

    // Process attachments for nodemailer format
    const emailAttachments = attachments ? attachments.map(attachment => ({
      filename: attachment.filename,
      path: attachment.path,
      contentType: attachment.mimeType
    })) : [];

    // Create email HTML
    const emailHtml = generateCustomEmailHtml(template, styles);

    let sentCount = 0;
    const failedRecipients: string[] = [];

    // Send to each recipient individually
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: `AVITO LUXURY <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
          to: recipient,
          subject: template.subject,
          html: emailHtml,
          attachments: emailAttachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}:`, info.response);
        sentCount++;
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        failedRecipients.push(recipient);
      }
    }

    // Log results
    console.log(`Custom email campaign sent to ${sentCount} recipients, failed for ${failedRecipients.length} recipients`);
    
    return {
      success: sentCount > 0,
      sentCount
    };
  } catch (error) {
    console.error('Error sending custom emails:', error);
    return { success: false, sentCount: 0 };
  }
};
