# Twilio Environment Setup Guide

To enable the SMS OTP functionality, you need to set up a Twilio account and add the required credentials to your `.env.local` file.

## Steps to Set Up Twilio

1. Sign up for a Twilio account at [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Once registered and logged in, navigate to the Twilio Console Dashboard
3. Get your Account SID and Auth Token from the dashboard
4. Purchase a Twilio phone number or use a trial number

## Update Your .env.local File

Add the following variables to your `.env.local` file:

```
# Twilio

```

Replace the placeholder values with your actual Twilio credentials.

## Testing SMS Functionality

When using a trial Twilio account, you'll need to verify phone numbers before sending SMS to them. 
You can do this in the Twilio Console under "Verified Caller IDs".

For production use, you'll need to upgrade to a paid Twilio account. 