# Delivery SMS Notification System for Avito Luxury

This document explains how the delivery SMS notification system works for Avito Luxury.

## Overview

The SMS notification system sends a text message to customers when their order is marked as delivered. The message includes:
- A personalized greeting with the customer's first name
- Notification that their order has been delivered
- A link to view and download their invoice
- A thank you message from Avito Luxury

## Example SMS Format

```
Hi [CustomerName], your order has been delivered!  
View your invoice: https://avitoluxury.in/invoice/123456  
Thank you for shopping with AvitoLuxury!  
We look forward to seeing you again.
```

## Technical Implementation

### 1. SMS Service Provider

The system uses [2Factor.in](https://2factor.in) as the SMS service provider. You need to:
- Register for an account
- Get your API key
- Create a sender ID (default is 'AVTLUX')
- Ensure your sender ID is DLT approved for transactional SMS

### 2. Required Environment Variables

Add these to your `.env.local` file:

```
# 2Factor.in SMS API
TWO_FACTOR_API_KEY=your-2factor-api-key
TWO_FACTOR_SENDER_ID=AVTLUX

# Base URL for invoice links
NEXT_PUBLIC_BASE_URL=https://avitoluxury.in
```

### 3. How It Works

1. When an order is marked as "Delivered" (either via the admin panel or API):
   - The system updates the order status in the database
   - Sets `isDelivered` to `true` and `deliveredAt` to the current date
   - Sends an SMS notification to the customer's phone number

2. The SMS contains:
   - A personalized greeting with the customer's first name
   - Notification that the order has been delivered
   - A link to view their invoice online
   - A thank you message from Avito Luxury

3. The invoice link directs customers to a public invoice page where they can:
   - View the invoice details
   - Print the invoice
   - Share the invoice link

## Testing the System

### Using the Test Endpoint

You can test the SMS functionality using the test endpoint:

```
POST /api/test-delivery-sms
Content-Type: application/json

{
  "phone": "1234567890",
  "customerName": "Abhishek",
  "orderId": "123456"
}
```

This endpoint is only available in development mode or when `ALLOW_SMS_TEST_IN_PRODUCTION` is set.

### Manual Testing

To test the SMS functionality in production:

1. Log in to the admin panel
2. Go to the Orders section
3. Find an order and mark it as "Delivered"
4. The system will automatically send the SMS notification

## Troubleshooting

If SMS notifications are not being sent:

1. Check the server logs for any errors related to SMS sending
2. Verify that the 2Factor.in API key is correctly set in the environment variables
3. Ensure the phone number format is correct (the system handles both +91 prefix and 10-digit numbers)
4. Check your 2Factor.in dashboard for failed message delivery reports
5. Make sure your sender ID is DLT approved for transactional SMS
6. Verify that you have sufficient SMS credits in your 2Factor.in account

## Security Considerations

- The invoice link is publicly accessible but requires the exact order ID
- No sensitive payment information is displayed on the invoice page
- The SMS is sent only to the phone number associated with the order

## Customizing the SMS Message

To customize the SMS message format, modify the `sendOrderConfirmationSMS` function in `src/app/lib/sms-utils.ts`. 