# Razorpay Payment Gateway Setup

To enable the Razorpay payment gateway in the application, follow these steps:

## 1. Create a Razorpay Account

1. Sign up for a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. After registration, log in to the Razorpay Dashboard
3. Navigate to Settings > API Keys

## 2. Get API Keys

1. In the API Keys section, click on "Generate Key"
2. Save both the Key ID and Key Secret securely

## 3. Configure Environment Variables

Add the following variables to your `.env.local` file:

```
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_ZhhzXPVJwyHfxu
RAZORPAY_KEY_SECRET=
```

Replace the placeholder values with your actual Razorpay API keys.

## 4. Testing the Integration

For testing purposes, Razorpay provides test cards and UPI IDs:

### Test Cards
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3-digit number
- Name: Any name

### Test UPI
- UPI ID: success@razorpay

## 5. Going Live

When you're ready to accept real payments:

1. Complete the Razorpay account verification process
2. Switch from test keys to live keys in your `.env.local` file
3. Test the complete payment flow with a small real transaction

## Troubleshooting

If you encounter issues with the payment integration:

1. Verify that your API keys are correctly set in the environment variables
2. Check the browser console for any JavaScript errors
3. Check server logs for API response errors
4. Ensure the Razorpay script is loading properly
5. Test with Razorpay's test credentials first before using live keys 