# Domain Configuration for Avito Luxury Website

This document outlines the domain configuration for the Avito Luxury e-commerce platform.

## Domain Structure

The website uses the following domain structure:

1. **Main Website**: 
   - `avitoluxury.in` and `www.avitoluxury.in`
   - Contains the customer-facing e-commerce website

2. **Admin Panel**:
   - `admin.avitoluxury.in`
   - Contains the admin dashboard and management interface

## Routing Rules

### Main Domain (avitoluxury.in and www.avitoluxury.in)

- All regular website pages are accessible
- Any attempt to access `/admin/*` paths will automatically redirect to `admin.avitoluxury.in/admin/*`

### Admin Subdomain (admin.avitoluxury.in)

- Root path (`/`) redirects to `/admin/login` for non-authenticated users
- Root path (`/`) redirects to `/admin/dashboard` for authenticated admin users
- Only `/admin/*` paths are accessible directly
- Any attempt to access non-admin paths will redirect to the main website

## DNS Configuration

To set up these domains, configure your DNS settings as follows:

1. Set up A records for:
   - `avitoluxury.in`
   - `www.avitoluxury.in`
   - `admin.avitoluxury.in`

2. All should point to your hosting provider's IP address or use the appropriate CNAME records if using a service like Vercel.

## Vercel Configuration

If using Vercel for deployment, the configuration is already set in `vercel.json` with the following:

- Redirects for handling domain-specific routing
- Headers for security
- Rewrites for internal path handling

## Local Development

During local development, all routes are accessible through `localhost:3000`:

- Main website: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin/login`
- Admin dashboard: `http://localhost:3000/admin/dashboard` (requires authentication)

The domain-based routing is automatically disabled when:
- The application is running in development mode (`NODE_ENV !== 'production'`)
- The hostname includes 'localhost' or '127.0.0.1'

This allows developers to access all parts of the application through a single port without needing to set up multiple domains locally.

### Important Implementation Details

Domain-based routing is disabled for localhost in three places:

1. **middleware.ts** - Contains a helper function `isDevelopmentOrLocalhost()` that checks if we're in development mode or on localhost
2. **next.config.js** - Domain-specific redirects are only added when `process.env.NODE_ENV === 'production'`
3. **vercel.json** - Redirects include `missing` conditions for the hostname 'localhost'

All three of these mechanisms work together to ensure that localhost development works properly.

## Security Considerations

- Admin routes are protected with authentication
- Security headers are applied to all responses
- Strict domain separation ensures admin functionality is isolated from the main website

## Testing the Configuration

After deployment, verify the following scenarios:

1. Accessing `avitoluxury.in/admin/login` should redirect to `admin.avitoluxury.in/admin/login`
2. Accessing `admin.avitoluxury.in` should redirect to `admin.avitoluxury.in/admin/login`
3. Accessing `admin.avitoluxury.in/some-page` should redirect to `avitoluxury.in/some-page`

For local development, verify:

1. Accessing `localhost:3000/admin/login` shows the admin login page
2. Accessing `localhost:3000/admin/dashboard` (after login) shows the admin dashboard
3. Accessing `localhost:3000/` shows the main website 