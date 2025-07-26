# 🚀 DNS Configuration Quick Start for Sabq Althakiyah

## 📋 What You Need to Configure

To connect your custom domain to your GitHub Spark application, you need to add these DNS records to your domain registrar:

### Required DNS Records

| Type | Name | Value | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 300 |
| A | @ | 185.199.109.153 | 300 |
| A | @ | 185.199.110.153 | 300 |
| A | @ | 185.199.111.153 | 300 |
| CNAME | www | [your-spark-app].github.app | 300 |
| CNAME | staging | [your-staging-app].github.app | 300 |

> **Important**: Replace `[your-spark-app]` and `[your-staging-app]` with your actual GitHub Spark application URLs.

## 🔧 Step-by-Step Process

### 1. Get Your Spark URLs
- Go to your GitHub Spark dashboard
- Find your application URLs (ending in `.github.app`)
- Note them down for DNS configuration

### 2. Configure DNS Records
- Log into your domain registrar (GoDaddy, Cloudflare, etc.)
- Go to DNS management section
- Add the records from the table above
- Use TTL of 300 for faster propagation during setup

### 3. Configure GitHub Spark
- In Spark dashboard, go to Settings > Custom Domains
- Add `www.sabq.ai` as custom domain
- Add `staging.sabq.ai` for staging
- Enable "Force HTTPS" redirect

### 4. Wait for Propagation
- DNS changes take 5-30 minutes to start working
- Full global propagation can take 24-48 hours
- SSL certificates may take 10-20 minutes to provision

## 🧪 Testing Your Configuration

### Manual Testing
1. Visit `https://www.sabq.ai` (should load your app)
2. Visit `http://sabq.ai` (should redirect to https://www.sabq.ai)
3. Visit `https://staging.sabq.ai` (should load staging)

### Automated Verification
Run the verification script:
```bash
node verify-dns.js
```

### Online Tools
- [DNS Checker](https://dnschecker.org) - Check global DNS propagation
- [What's My DNS](https://www.whatsmydns.net) - Verify DNS records worldwide

## 📚 Detailed Guides

- **Complete Setup**: See `DNS_CONFIGURATION_GUIDE.md` for detailed instructions
- **Platform Specific**: See `DOMAIN_SETUP.md` for registrar-specific steps  
- **Troubleshooting**: Check the guides above for common issues and solutions

## 🆘 Common Issues

### DNS Not Working
- Check record values are exactly correct
- Verify TTL is set to 300 (5 minutes)
- Clear your browser cache and DNS cache

### SSL Certificate Issues
- Ensure CNAME points to correct `.github.app` URL
- Wait up to 20 minutes for certificate provisioning
- Check Spark dashboard for certificate status

### Redirect Not Working
- Verify A records point to all four GitHub IPs
- Check redirect configuration in Spark dashboard
- Ensure no conflicting DNS records exist

## 📞 Support Resources

- **GitHub Spark Documentation**: Official hosting documentation
- **Domain Registrar Support**: Contact your DNS provider
- **DNS Tools**: Use online DNS diagnostic tools for troubleshooting

---

**Ready to configure your domain?** Follow this guide step-by-step to get Sabq Althakiyah running on your custom domain! 🌐