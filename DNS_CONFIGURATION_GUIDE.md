# DNS Configuration Guide for Sabq Althakiyah CMS

## 🚀 Quick Start

To set up DNS for your Sabq Althakiyah CMS deployment, follow these steps:

### 1. Run DNS Verification Scripts

```bash
# Quick DNS check
npm run dns:quick

# Full DNS verification
npm run dns:check

# Interactive domain setup
npm run dns:setup

# Bash-based verification (if available)
npm run dns:verify-bash
```

### 2. GitHub Pages Setup (Recommended)

If you're using GitHub Pages for hosting:

1. **Create CNAME file:**
```bash
echo "sabq.org" > public/CNAME
```

2. **Configure DNS records at your domain registrar:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | sabq.org | 3600 |

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select your main branch
   - Enter your custom domain

### 3. Alternative Hosting Providers

#### Vercel
```
A record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

#### Netlify
```
A record: @ → 75.2.60.5
CNAME: www → yourdomain.com
```

#### Cloudflare Pages
- Add domain in Cloudflare dashboard
- DNS records are configured automatically

## 🔧 DNS Scripts Usage

### DNS Verification Script (Node.js)
```bash
# Basic verification
node scripts/dns-verification.js

# Save results to file
node scripts/dns-verification.js --save

# Check specific domain
node scripts/dns-verification.js yourdomain.com
```

### Quick DNS Check
```bash
# Quick check for default domain
node scripts/quick-dns-check.js

# Quick check for specific domain
node scripts/quick-dns-check.js yourdomain.com
```

### Domain Setup Helper
```bash
# Interactive setup wizard
node scripts/domain-setup-helper.js

# Generate CNAME file only
node scripts/domain-setup-helper.js --generate-cname yourdomain.com
```

### Bash DNS Verification
```bash
# Default domain check
bash scripts/dns-verification.sh

# Specific domain
bash scripts/dns-verification.sh yourdomain.com

# With options
CHECK_SSL=true CHECK_GITHUB_PAGES=true bash scripts/dns-verification.sh yourdomain.com
```

## 📋 Verification Checklist

The scripts will verify:

- ✅ **A Records**: IPv4 addresses pointing to hosting provider
- ✅ **AAAA Records**: IPv6 addresses (optional but recommended)
- ✅ **CNAME Records**: www subdomain configuration
- ✅ **MX Records**: Email routing (if configured)
- ✅ **TXT Records**: SPF, DKIM, domain verification
- ✅ **SSL Certificate**: Validity, expiration, issuer
- ✅ **HTTP/HTTPS**: Connectivity and response codes
- ✅ **DNS Propagation**: Consistency across DNS servers

## 🔍 Troubleshooting

### Common Issues

1. **"Domain not found" error**
   - Verify domain spelling
   - Check if domain is registered
   - Ensure DNS records are configured

2. **"SSL certificate not found"**
   - DNS must be configured first
   - Wait 24-48 hours for propagation
   - Check hosting provider SSL settings

3. **"GitHub Pages not detected"**
   - Verify A records point to GitHub IPs
   - Ensure CNAME file exists in repository
   - Check GitHub Pages settings

4. **"DNS propagation incomplete"**
   - Wait additional time (up to 48 hours)
   - Check with multiple DNS servers
   - Clear local DNS cache

### Manual Verification Commands

```bash
# Check A records
dig A yourdomain.com

# Check CNAME records
dig CNAME www.yourdomain.com

# Check DNS from specific server
dig @8.8.8.8 A yourdomain.com

# Test SSL certificate
openssl s_client -servername yourdomain.com -connect yourdomain.com:443

# Check HTTP/HTTPS response
curl -I http://yourdomain.com
curl -I https://yourdomain.com
```

## 📝 Configuration Files

### Required Files for GitHub Pages

1. **CNAME file** (in repository root or public directory):
```
sabq.org
```

2. **GitHub Pages settings** (in repository settings):
   - Source: Deploy from a branch
   - Branch: main (or your deployment branch)
   - Custom domain: sabq.org

### Optional Configuration

#### Email Records (if using email)
```
Type: MX
Name: @
Value: 10 mail.google.com

Type: TXT
Name: @  
Value: v=spf1 include:_spf.google.com ~all
```

#### CDN Configuration (if using Cloudflare)
- Enable "Always Use HTTPS"
- Set SSL/TLS mode to "Full" or "Full (strict)"
- Enable "Automatic HTTPS Rewrites"

## 🎯 Production Deployment Checklist

Before going live:

1. ✅ Run all verification scripts
2. ✅ Test from multiple devices/locations
3. ✅ Verify SSL certificate is valid
4. ✅ Check redirects (www → apex or vice versa)
5. ✅ Test mobile responsiveness
6. ✅ Verify search engine accessibility
7. ✅ Configure analytics and monitoring
8. ✅ Set up error pages (404, 500)
9. ✅ Test contact forms and user interactions
10. ✅ Implement security headers

## 🔗 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [DNS Records Explained](https://www.cloudflare.com/learning/dns/dns-records/)
- [SSL Certificate Guide](https://letsencrypt.org/getting-started/)
- [Domain Registrar Guides](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 📞 Support

For issues specific to Sabq Althakiyah CMS:

1. Run the interactive setup: `npm run dns:setup`
2. Check the verification results: `npm run dns:check --save`
3. Review the scripts/README.md for detailed troubleshooting
4. Ensure all required dependencies are installed

The DNS verification scripts will help identify and resolve most common configuration issues automatically.