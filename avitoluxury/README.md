# Avito Luxury - E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js for luxury perfumes and fragrances. Features a comprehensive admin panel, payment integration, SMS notifications, and a responsive design.

## Features

### Customer Features
- 🛍️ Product catalog with categories (Him, Her, Unisex, Combos, etc.)
- 🛒 Shopping cart and checkout system
- 💳 Razorpay payment integration
- 📱 SMS OTP verification via Twilio
- 📦 Order tracking and invoice generation
- 🎁 Gifting options and discovery sets
- 📍 Pincode-based delivery checking
- 🔍 Product search functionality

### Admin Features
- 📊 Admin dashboard with analytics
- 📦 Product management
- 👥 Order management
- 📈 Sales reporting with Chart.js
- 🖼️ Image management with Cloudinary
- 👨‍💼 Leadership team management

### Technical Features
- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🗄️ MongoDB with Mongoose ODM
- 🔐 JWT authentication
- 📧 Email notifications with Nodemailer
- 🌐 Responsive design with Framer Motion animations
- 🔒 Form validation with Zod and React Hook Form

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Payments**: Razorpay
- **SMS**: Twilio
- **Email**: Nodemailer, Resend
- **File Storage**: Cloudinary, Google Cloud Storage
- **UI/UX**: Framer Motion, React Icons, React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Razorpay account
- Twilio account
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd avitoluxury
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with the required credentials:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

5. Seed the database (optional):
```bash
npm run seed
npm run seed-leadership
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data
- `npm run seed-leadership` - Populate leadership team data
- `npm run setup` - Run setup script

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── components/         # Reusable components
│   ├── lib/                # Utility libraries
│   ├── models/             # Database models
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic services
│   ├── utils/              # Helper functions
│   ├── [category]/         # Product category pages
│   └── layout.tsx          # Root layout
├── pages/                  # Legacy pages (if any)
└── styles/                 # Global styles
```

## Configuration Files

- **Setup Guides**: Check the following files for detailed setup instructions:
  - `RAZORPAY-SETUP.md` - Payment gateway configuration
  - `TWILIO-ENV-SETUP.md` - SMS service setup
  - `2FACTOR-ENV-SETUP.md` - Two-factor authentication
  - `NGINX-SETUP-INSTRUCTIONS.md` - Server configuration

## Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration. For other platforms, ensure environment variables are properly set.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.