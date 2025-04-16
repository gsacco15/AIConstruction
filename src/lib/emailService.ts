import nodemailer from 'nodemailer';
// import mjml2html from 'mjml';
import { ProductItem, Recommendations } from '@/utils/affiliateUtils';

interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  items: ProductItem[];
  projectTitle?: string;
  recommendations?: Recommendations;
}

/**
 * Generate HTML email using the simplified template
 */
export function generateEmailHTML(data: EmailData): string {
  const { firstName, lastName, email, items, projectTitle = 'Your DIY Project', recommendations } = data;
  
  // If we have the full recommendations object, use that for categorization
  let materials: ProductItem[] = [];
  let tools: ProductItem[] = [];
  
  if (recommendations) {
    // Use the pre-categorized data
    materials = recommendations.materials;
    tools = recommendations.tools;
  } else {
    // Fallback to filtering based on item names
    materials = items.filter(item => 
      !item.name.toLowerCase().includes('tool') && 
      !item.name.toLowerCase().includes('cutter') &&
      !item.name.toLowerCase().includes('knife') &&
      !item.name.toLowerCase().includes('measure')
    );
    
    tools = items.filter(item => 
      item.name.toLowerCase().includes('tool') || 
      item.name.toLowerCase().includes('cutter') ||
      item.name.toLowerCase().includes('knife') ||
      item.name.toLowerCase().includes('measure')
    );
  }
  
  console.log('Email categorization:', { 
    totalItems: items.length,
    materialsCount: materials.length,
    toolsCount: tools.length
  });
  
  // Generate HTML for materials list items
  const materialsListHTML = materials.map(item => `
    <li style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: bold; color: #333;">${item.name}</span>
      <a href="${item.affiliate_url}" target="_blank" style="background-color: #9747FF; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
        Buy on Amazon
      </a>
    </li>
  `).join('');
  
  // Generate HTML for tools list items
  const toolsListHTML = tools.map(item => `
    <li style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: bold; color: #333;">${item.name}</span>
      <a href="${item.affiliate_url}" target="_blank" style="background-color: #9747FF; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
        Buy on Amazon
      </a>
    </li>
  `).join('');
  
  // Simple HTML Template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI Construction Shopping List</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          position: relative;
          overflow: hidden;
        }
        .decorative-shape {
          position: absolute;
          top: -100px;
          right: -150px;
          width: 399px;
          height: 285px;
          border-radius: 399px;
          background: linear-gradient(180deg, rgba(9, 9, 9, 0.00) 0%, #6F00FF 100%);
          filter: blur(100px);
          opacity: 0.15;
          z-index: 0;
          transform: rotate(47.669deg);
        }
        .decorative-rectangle {
          position: absolute;
          bottom: -50px;
          left: -100px;
          width: 192px;
          height: 194px;
          background: linear-gradient(180deg, rgba(24, 75, 255, 0.00) 0%, rgba(255, 255, 255, 0.69) 100%);
          filter: blur(100px);
          opacity: 0.15;
          z-index: 0;
          transform: rotate(47.669deg);
        }
        h1 {
          font-size: 32px;
          margin-top: 0;
          text-align: center;
          font-weight: 800;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
          background: linear-gradient(90deg, #111 -2.35%, #9747FF 99.89%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          width: 100%;
        }
        .hero {
          font-size: 18px;
          text-align: center;
          margin-bottom: 30px;
          color: #555;
          position: relative;
          z-index: 1;
        }
        h2 {
          color: #333;
          font-size: 20px;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
          margin-top: 30px;
          position: relative;
          z-index: 1;
        }
        ul {
          padding-left: 0;
          list-style-type: none;
          position: relative;
          z-index: 1;
        }
        .footer {
          margin-top: 40px;
          padding: 30px 0 20px;
          text-align: center;
          font-size: 12px;
          color: #fff;
          background: linear-gradient(180deg, rgba(111, 0, 255, 0.2) 0%, rgba(111, 0, 255, 0.8) 100%);
          border-radius: 0 0 4px 4px;
          position: relative;
          z-index: 1;
        }
        .content {
          position: relative;
          z-index: 1;
          padding: 0 10px;
        }
        .amazon-button {
          background-color: #9747FF;
          color: white;
          padding: 6px 12px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="decorative-shape"></div>
        <div class="decorative-rectangle"></div>
        
        <div class="content">
          <h1>AI Construction Assistant</h1>
          <p class="hero">Here's your project list for ${projectTitle}! Let's get building.</p>
          
          <h2>Project Shopping List</h2>
          <p>Hello ${firstName} ${lastName}, here are the recommended items for your project:</p>
          
          ${materials.length > 0 ? `
          <h2>Materials Recommended</h2>
          <ul>
            ${materialsListHTML}
          </ul>
          ` : ''}
          
          ${tools.length > 0 ? `
          <h2>Tools Recommended</h2>
          <ul>
            ${toolsListHTML}
          </ul>
          ` : ''}
        </div>
        
        <div class="footer">
          &copy; 2025 AI Construction Assistant. All rights reserved.
          <br>
          <small style="color: rgba(255,255,255,0.8);">This email was sent to ${email}</small>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return htmlTemplate;
}

/**
 * Configure and return NodeMailer transporter
 */
export function getEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

/**
 * Send shopping list via email
 */
export async function sendShoppingListEmail(data: EmailData): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  try {
    // Generate the email HTML
    const emailHtml = generateEmailHTML(data);
    console.log('Generated email HTML for:', data.email);
    
    // Create a test account with Ethereal for testing
    console.log('Creating test account with Ethereal...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount.user);
    
    // Create a test transporter
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    const mailOptions = {
      from: `"AI Construction" <${testAccount.user}>`,
      to: data.email,
      subject: `Your AI Construction Shopping List for ${data.projectTitle || 'DIY Project'}`,
      html: emailHtml,
    };
    
    console.log('Sending email to test account...');
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // Generate preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    
    return { 
      success: true, 
      message: 'Shopping list sent! Click the link below to preview the email.',
      previewUrl: previewUrl as string
    };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
} 