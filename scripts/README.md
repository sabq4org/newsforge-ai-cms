# DNS Verification Scripts for Sabq Althakiyah CMS

This directory contains DNS verification and domain setup tools for the Sabq Althakiyah content management system.

## 📋 Available Scripts

### 1. DNS Verification Script (Node.js)
```bash
node scripts/dns-verification.js
```

**Features:**
- Comprehensive DNS record checking (A, AAAA, CNAME, MX, TXT)
- SSL certificate validation
- Connectivity testing (HTTP/HTTPS)
- GitHub Pages configuration verification
- Results export to JSON
- Detailed error reporting

**Usage:**
```bash
# Run verification
node scripts/dns-verification.js

# Save results to file
node scripts/dns-verification.js --save

# Check specific domain
node scripts/dns-verification.js sabq.org
```

### 2. DNS Verification Script (Bash)
```bash
bash scripts/dns-verification.sh [domain]
```

**Features:**
- Cross-platform DNS checking using dig and curl
- SSL certificate expiry checking
- GitHub Pages IP verification
- DNS propagation testing across multiple servers
- Color-coded output

**Usage:**
```bash
# Check default domain
bash scripts/dns-verification.sh

# Check specific domain
bash scripts/dns-verification.sh sabq.org

# With environment variables
CHECK_SSL=true CHECK_GITHUB_PAGES=true bash scripts/dns-verification.sh sabq.org
```

### 3. Domain Setup Helper
```bash
node scripts/domain-setup-helper.js
```

**Features:**
- Interactive domain configuration wizard
- Hosting provider-specific instructions
- DNS record generation
- CNAME file creation for GitHub Pages

**Usage:**
```bash
# Interactive setup
node scripts/domain-setup-helper.js

# Generate CNAME file only
node scripts/domain-setup-helper.js --generate-cname sabq.org
```

## 🔧 Configuration

### Editing Domain Configuration

Edit the `CONFIG` object in `dns-verification.js`:

```javascript
const CONFIG = {
  domains: [
    'sabq.org',
    'www.sabq.org',
    'api.sabq.org',
    'cdn.sabq.org'
  ],
  
  hosting: {
    provider: 'github-pages', // or 'vercel', 'netlify', 'cloudflare'
    customDomain: true
  }
};
```

### GitHub Pages Setup

1. Create a `CNAME` file in your repository root:
```bash
node scripts/domain-setup-helper.js --generate-cname sabq.org
```

2. Configure DNS records:
```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @  
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: sabq.org
```

## 🚀 Common DNS Configurations

### GitHub Pages
```
A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
CNAME (www): yourdomain.com
```

### Vercel
```
A record: 76.76.19.61
CNAME (www): cname.vercel-dns.com
```

### Netlify
```
A record: 75.2.60.5
CNAME (www): yourdomain.com
```

### Cloudflare Pages
Cloudflare automatically configures DNS when you add your domain.

## 📊 Verification Results

The verification scripts check:

- ✅ **DNS Records**: A, AAAA, CNAME, MX, TXT
- ✅ **SSL Certificate**: Validity, expiration, issuer
- ✅ **Connectivity**: HTTP/HTTPS response codes
- ✅ **Propagation**: Consistency across DNS servers
- ✅ **Platform-specific**: GitHub Pages, Vercel, etc.

### Sample Output
```
🔍 DNS verification for Sabq Althakiyah CMS...

📍 Verifying domain: sabq.org
──────────────────────────────────────────────────
✅ A Records: 185.199.108.153, 185.199.109.153
✅ AAAA Records: 2606:50c0:8000::153, 2606:50c0:8001::153
✅ CNAME Records: www.sabq.org -> sabq.org
✅ SSL Certificate: Valid until Nov 15, 2025 (285 days)
✅ HTTP Connectivity: 200
✅ HTTPS Connectivity: 200
✅ Domain points to GitHub Pages
```

## 🔍 Troubleshooting

### Common Issues

1. **DNS not propagating**
   - Wait 24-48 hours for full propagation
   - Check multiple DNS servers
   - Use `dig @8.8.8.8 yourdomain.com` to test

2. **SSL certificate issues**
   - Ensure proper A/CNAME records first
   - Wait for DNS propagation before SSL provisioning
   - Check hosting provider SSL settings

3. **GitHub Pages not working**
   - Verify CNAME file exists in repository
   - Check GitHub Pages settings in repository
   - Ensure domain is configured in Pages settings

### Manual Verification Commands

```bash
# Check A records
dig A sabq.org

# Check CNAME records  
dig CNAME www.sabq.org

# Check SSL certificate
openssl s_client -servername sabq.org -connect sabq.org:443

# Test HTTP/HTTPS
curl -I http://sabq.org
curl -I https://sabq.org
```

## 📝 Environment Variables

Set these environment variables to customize verification:

```bash
export CHECK_SSL=true
export CHECK_GITHUB_PAGES=true
export DNS_TIMEOUT=10
export SSL_MIN_VALID_DAYS=30
```

## 🎯 Next Steps

After running verification:

1. ✅ Fix any DNS record issues
2. ✅ Configure SSL/TLS settings
3. ✅ Set up email records (MX, SPF, DKIM)
4. ✅ Configure CDN and caching
5. ✅ Test from multiple locations
6. ✅ Monitor DNS and SSL expiry

## 🔗 Related Documentation

- [GitHub Pages Custom Domain Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [DNS Record Types Explained](https://www.cloudflare.com/learning/dns/dns-records/)
- [SSL Certificate Setup](https://letsencrypt.org/getting-started/)

For support with Sabq Althakiyah CMS domain setup, run the interactive helper:
```bash
node scripts/domain-setup-helper.js
```