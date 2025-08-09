# 2Factor SMS Service Setup Guide

To enable the SMS OTP functionality, you need to set up a 2Factor account and add the required API key to your `.env.local` file.

## Steps to Set Up 2Factor

1. Sign up for a 2Factor account at [https://2factor.in/](https://2factor.in/)
2. Once registered and logged in, navigate to the 2Factor Dashboard
3. Get your API Key from the dashboard
4. Make sure your account has sufficient credits for sending SMS

## Update Your .env.local File

Add the following variable to your `.env.local` file:

```
# 2Factor
TWOFACTOR_API_KEY=your_2factor_api_key
```

Replace `your_2factor_api_key` with your actual 2Factor API key.

## OTP Functionality Details

- Each OTP is valid for 5 minutes only
- After 5 minutes, the OTP will expire and cannot be used
- Users can request a new OTP only after the current one expires (5 minutes)
- Users are limited to a maximum of 4 OTP requests within a 24-hour period

## 2Factor API Integration

The system uses 2Factor's AUTOGEN API endpoint which automatically:
1. Generates a random OTP
2. Sends it to the user's phone number
3. Returns the session ID for verification

The API endpoint format is:
```
https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE_NUMBER}/AUTOGEN/OTP1
```

## SMS Message Format

The system uses 2Factor's default OTP template. You can customize this template in your 2Factor dashboard under the Templates section. 