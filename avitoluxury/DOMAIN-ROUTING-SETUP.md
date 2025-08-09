# Domain Routing Configuration

This document explains how domain routing is configured for Avito Luxury website.

## Domain Structure

The website uses the following domains:

- **https://avitoluxury.in** - Main e-commerce website
- **https://www.avitoluxury.in** - Redirects to the non-www version
- **https://admin.avitoluxury.in** - Admin panel access (requires authentication)

## Routing Rules

### Main Domain (avitoluxury.in)

- Root path (`/`) redirects to `/store-routes/store`
- All admin paths (`/admin/*`) redirect to `https://admin.avitoluxury.in/admin/*`
- All other paths are served normally

### WWW Domain (www.avitoluxury.in)

- All requests redirect to the equivalent path on `https://avitoluxury.in`

### Admin Domain (admin.avitoluxury.in)

- Root path (`/`) redirects to `/admin/login` if not authenticated, or `/admin/dashboard` if logged in
- All non-admin paths redirect to the main domain `https://avitoluxury.in`
- Only admin paths (`/admin/*`) are served on this domain
- **All admin routes require authentication** except for `/admin/login`
- Unauthenticated users attempting to access any admin page will be redirected to `/admin/login`

## Implementation

The domain routing is implemented in two places:

1. **middleware.ts** - Handles dynamic routing based on the hostname and authentication state
2. **next.config.js** - Defines static redirects for various paths

### Authentication Protection

The middleware implements authentication checks to ensure:
- Only authenticated admin users can access admin pages
- Unauthenticated users are redirected to the login page
- Admin authentication is enforced across both domains

### Development Mode

In development mode (localhost), all routes are available on the same domain for easier testing.

## DNS Configuration

Ensure your DNS records are properly configured:

- **avitoluxury.in** - A record pointing to your server IP
- **www.avitoluxury.in** - CNAME record pointing to `avitoluxury.in`
- **admin.avitoluxury.in** - CNAME record pointing to `avitoluxury.in`

## SSL Certificates

Make sure SSL certificates are properly configured for all domains:

- **avitoluxury.in**
- **www.avitoluxury.in**
- **admin.avitoluxury.in**

You can use Let's Encrypt to generate free SSL certificates for all domains. 