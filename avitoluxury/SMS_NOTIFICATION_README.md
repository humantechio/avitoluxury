# SMS Notification System for Avito Luxury

This document explains how to set up and use the SMS notification system for order confirmations.

## Overview

The SMS notification system sends a text message to customers when their order payment is successfully processed. The message includes:
- Transaction ID
- Total amount paid
- Tracking ID

## Setup Instructions

### 1. Register with 2Factor.in

1. Go to [https://2factor.in](https://2factor.in) and create an account
2. After registration, navigate to your dashboard to get your API key
3. Create a sender ID (default is 'AVTLUX')
4. Make sure your sender ID is DLT approved for transactional SMS

### 2. Update Environment Variables

Add the following variables to your `.env.local` file:

```
# 2Factor.in SMS API
TWO_FACTOR_API_KEY=your-2factor-api-key
TWO_FACTOR_SENDER_ID=AVTLUX
```

### 3. Base URL for Tracking Links

Make sure the `NEXT_PUBLIC_BASE_URL` environment variable is set to your website's URL:

```
NEXT_PUBLIC_BASE_URL=https://avitoluxury.in
```

If not set, the system will default to 'https://avitoluxury.in'.

## How It Works

1. When a payment is successfully verified, the system:
   - Updates the order status
   - Sends a confirmation email
   - Sends an SMS notification to the customer's phone number

2. The SMS contains:
   - Order confirmation message
   - Transaction ID from the payment gateway
   - Total amount paid
   - Tracking ID for the order

## API Format

The system uses the 2Factor.in API with the following parameters:

```
POST https://2factor.in/API/R1/
Content-Type: application/x-www-form-urlencoded

module=TRANS_SMS
apikey=your-2factor-api-key
to=1234567890
from=AVTLUX
msg=Your message here
```

Where:
- `module` is set to TRANS_SMS for transactional SMS
- `apikey` is your 2Factor.in API key
- `to` is the recipient's phone number (10 digits, without country code)
- `from` is your DLT approved sender ID
- `msg` is your message (must be a DLT approved template)

## Testing

### Using the Test Endpoint

You can test the SMS functionality using the test endpoint:

```
POST /api/test-sms
Content-Type: application/json

{
  "phone": "1234567890",
  "message": "This is a test message"
}
```

This endpoint is only available in development mode.

### Manual Testing

To test the SMS functionality in production:

1. Make a test order through the website
2. Complete the payment process
3. Check if you receive the SMS notification

## Troubleshooting

If SMS notifications are not being sent:

1. Check the server logs for any errors related to SMS sending
2. Verify that the 2Factor.in API key is correctly set in the environment variables
3. Ensure the phone number format is correct (the system handles both +91 prefix and 10-digit numbers)
4. Check your 2Factor.in dashboard for failed message delivery reports
5. Make sure your sender ID is DLT approved for transactional SMS
6. Verify that you have sufficient SMS credits in your 2Factor.in account
7. Ensure your message follows a DLT approved template

## SMS Format

The SMS message follows this format:

```
Thank you for your order with Avito Luxury! Payment of Rs.[AMOUNT] confirmed. TxnID: [TRANSACTION_ID]. TrackingID: [TRACKING_ID].
```

This message should be registered as a DLT approved template with your telecom provider. 