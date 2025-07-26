# Custom Domain Setup for Sabq Althakiyah

This guide explains how to configure a custom domain for your Sabq Althakiyah application on GitHub Spark.

## 🌐 Domain Configuration Overview

The application is configured to support the following domains:

### Primary Domain
- **Production**: `www.sabq.ai`
- **Staging**: `staging.sabq.ai`

### Alternative Domains
- `sabqai.com`
- `sabq-ai.com` 
- `sabqalthakiyah.com`

## 📋 Prerequisites

1. **Domain Registration**: Ensure you own the domain you want to use
2. **DNS Access**: You need access to modify DNS records for your domain
3. **Spark Account**: Your application must be deployed on GitHub Spark
4. **SSL Certificate**: Spark will automatically provide SSL certificates

## 🔧 Setup Steps

### Step 1: Configure DNS Records

Add the following DNS records to your domain provider:

```dns
# For www.sabq.ai
Type: CNAME
Name: www
Value: [your-spark-app-url].github.app

# For root domain redirect (sabq.ai)
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153  
Value: 185.199.110.153
Value: 185.199.111.153

# For staging subdomain
Type: CNAME
Name: staging
Value: [your-staging-app-url].github.app
```

### Step 2: Update Spark Configuration

The `spark.config.js` file has been created with your domain configuration. Update it with your actual Spark app URLs:

```javascript
// Update these values with your actual Spark URLs
domains: {
  production: {
    domain: "sabq.ai",
    fullDomain: "www.sabq.ai",
    sparkUrl: "your-production-app.github.app" // Update this
  },
  staging: {
    domain: "staging.sabq.ai", 
    sparkUrl: "your-staging-app.github.app" // Update this
  }
}
```

### Step 3: Configure GitHub Spark

1. **Access Spark Dashboard**:
   - Go to your GitHub Spark dashboard
   - Navigate to your Sabq Althakiyah application

2. **Add Custom Domain**:
   - In the app settings, find "Custom Domains"
   - Add `www.sabq.ai` as your primary domain
   - Add `staging.sabq.ai` for staging environment

3. **Enable HTTPS**:
   - Spark will automatically provision SSL certificates
   - Ensure "Force HTTPS" is enabled

### Step 4: Update Application URLs

Update your application configuration to use the new domain:

```javascript
// In your environment configuration
const config = {
  production: {
    baseURL: "https://www.sabq.ai",
    apiURL: "https://api.sabq.ai"
  },
  staging: {
    baseURL: "https://staging.sabq.ai", 
    apiURL: "https://api-staging.sabq.ai"
  }
};
```

## 🌍 Arabic Domain Considerations

### RTL Support
- The application is configured with RTL support
- Domain display will respect Arabic text direction
- Font loading optimized for Arabic content

### SEO Optimization
- Arabic meta tags and descriptions
- Proper language tags (`hreflang="ar"`)
- Structured data in Arabic

### Performance
- CDN configuration optimized for Middle East regions
- Arabic font loading optimization
- RTL CSS delivery optimization

## 🔧 Advanced Configuration

### Multiple Domain Support

To support multiple domains pointing to the same application:

```javascript
// In spark.config.js
domains: {
  alternatives: [
    "sabqai.com",
    "sabq-ai.com", 
    "sabqalthakiyah.com"
  ]
}
```

### Subdomain Configuration

For different services on subdomains:

```dns
# API subdomain
Type: CNAME  
Name: api
Value: [your-api-app].github.app

# Admin subdomain
Type: CNAME
Name: admin  
Value: [your-admin-app].github.app

# Media/Assets subdomain
Type: CNAME
Name: media
Value: [your-media-app].github.app
```

### Regional Optimization

For better performance in different regions:

```javascript
// In spark.config.js
hosting: {
  regions: {
    primary: "me-south-1", // Middle East
    secondary: "eu-west-1", // Europe backup
    fallback: "us-east-1"   // Global fallback
  }
}
```

## 📊 Monitoring and Analytics

### Domain Performance Monitoring

Track domain performance with:

```javascript
// Custom domain analytics
analytics: {
  domains: {
    "www.sabq.ai": {
      trackLoading: true,
      trackErrors: true,
      trackPerformance: true
    }
  }
}
```

### Error Tracking

Monitor domain-related issues:

```javascript
// Error monitoring for custom domains
monitoring: {
  ssl: true,          // Monitor SSL certificate status
  dns: true,          // Monitor DNS resolution
  uptime: true,       // Monitor domain uptime
  performance: true   // Monitor loading times
}
```

## 🚀 Deployment Process

### Automated Deployment

1. **Push to Main Branch**: 
   ```bash
   git push origin main
   ```

2. **Spark Auto-Deploy**:
   - Spark automatically deploys to production domain
   - SSL certificates are renewed automatically
   - CDN cache is invalidated

3. **Staging Deployment**:
   ```bash
   git push origin staging
   ```

### Manual Domain Updates

If you need to update domain configuration:

```bash
# Update spark.config.js
# Commit changes
git add spark.config.js
git commit -m "Update domain configuration"
git push origin main
```

## 🔐 Security Configuration

### SSL/TLS Setup
- Automatic SSL certificate provisioning
- HSTS (HTTP Strict Transport Security) enabled
- Perfect Forward Secrecy supported

### Content Security Policy
```javascript
security: {
  csp: {
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-inline'",
    "style-src": "'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src": "'self' fonts.gstatic.com",
    "img-src": "'self' data: https:",
    "connect-src": "'self' https://api.sabq.ai"
  }
}
```

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- Referrer-Policy: strict-origin-when-cross-origin

## 🐛 Troubleshooting

### Common Issues

1. **DNS Propagation Delay**:
   - DNS changes can take 24-48 hours to propagate globally
   - Use `dig` or online DNS checkers to verify

2. **SSL Certificate Issues**:
   - Ensure CNAME records are correct
   - Check Spark dashboard for certificate status

3. **Redirect Loops**:
   - Verify redirect configuration in spark.config.js
   - Check for conflicting DNS records

### Verification Commands

```bash
# Check DNS resolution
dig www.sabq.ai

# Check SSL certificate
openssl s_client -connect www.sabq.ai:443 -servername www.sabq.ai

# Test HTTP redirect
curl -I http://sabq.ai
```

## 📞 Support

For domain configuration issues:

1. **GitHub Spark Support**: Check Spark documentation
2. **DNS Provider Support**: Contact your domain registrar
3. **Application Issues**: Check application logs in Spark dashboard

## 📝 Checklist

- [ ] Domain registered and DNS access confirmed
- [ ] DNS records configured correctly
- [ ] Spark custom domain added
- [ ] SSL certificate provisioned
- [ ] Application URLs updated
- [ ] Testing completed on staging domain
- [ ] Production domain verified and working
- [ ] Analytics and monitoring configured

---

**Note**: This configuration is optimized for Arabic content and RTL layout. The domain setup includes specific optimizations for Middle Eastern users and Arabic language support.