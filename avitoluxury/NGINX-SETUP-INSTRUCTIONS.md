# Nginx Setup Instructions for Avito Luxury

The 404 errors and incorrect routing issues you're seeing are likely due to Nginx not properly forwarding requests to your Next.js application. Follow these steps to fix the issue:

## 1. Update Nginx Configuration

Create or edit your Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/avitoluxury
```

Copy the configuration from the `nginx-config.conf` file in this repository.

### Important Configuration Details

The Nginx configuration includes:

1. **Explicit root path redirects**:
   - For avitoluxury.in: Root path (/) redirects directly to /store-routes/store
   - For admin.avitoluxury.in: Root path (/) redirects directly to /admin/login

2. **Domain-specific handling**:
   - Main domain (avitoluxury.in) serves the e-commerce site
   - Admin subdomain (admin.avitoluxury.in) serves the admin panel
   - All requests are forwarded to the same Next.js application

3. **Critical fixes for admin subdomain**:
   - Hard-coded redirect from / to /admin/login for the admin subdomain
   - Blocking access to store-routes on the admin subdomain
   - Redirecting non-admin content to the main domain

## 2. Enable the Site

Create a symbolic link to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/avitoluxury /etc/nginx/sites-enabled/
```

## 3. Test the Configuration

Check if the configuration is valid:

```bash
sudo nginx -t
```

## 4. Restart Nginx

Apply the changes:

```bash
sudo systemctl restart nginx
```

## 5. SSL Certificates

If you haven't already, obtain SSL certificates for your domains:

```bash
sudo certbot --nginx -d avitoluxury.in -d www.avitoluxury.in -d admin.avitoluxury.in
```

## 6. Verify DNS Configuration

Make sure all three domains point to your server:

- avitoluxury.in
- www.avitoluxury.in
- admin.avitoluxury.in

## 7. Testing the Redirects

After implementing these changes, test the redirects:

1. Visit https://avitoluxury.in/ - should redirect to https://avitoluxury.in/store-routes/store
2. Visit https://admin.avitoluxury.in/ - should redirect to https://admin.avitoluxury.in/admin/login
3. Visit https://admin.avitoluxury.in/store-routes/store - should redirect to https://avitoluxury.in/store-routes/store

## 8. Troubleshooting

If you're still seeing 404 errors or incorrect redirects:

1. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Check that your Next.js application is running:
   ```bash
   pm2 status
   # or
   systemctl status your-nextjs-service
   ```

3. Verify that port 3000 (or whichever port your app runs on) is accessible:
   ```bash
   curl http://localhost:3000
   ```

4. Clear your browser cache or test in an incognito window to ensure you're not seeing cached responses.

5. If the redirect from admin.avitoluxury.in to admin/login still doesn't work, you can try a more aggressive approach:
   ```
   # In the admin server block in nginx-config.conf
   location / {
       rewrite ^/$ /admin/login redirect;
       # Rest of the location block...
   }
   ```

## Important Notes

1. Make sure your Next.js application is running and accessible at http://localhost:3000 (or whatever port you've configured).

2. The Nginx configuration forwards all requests to your Next.js application, which then uses its own routing logic to handle different domains.

3. If you're using PM2 or another process manager, ensure your application starts automatically after server reboots.

4. Your Next.js application should be configured to handle the different domains as specified in the middleware.ts file. 