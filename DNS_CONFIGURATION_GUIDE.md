# 🌐 DNS Configuration Guide for Sabq Althakiyah

This guide provides detailed instructions for configuring DNS records with your domain registrar to connect your custom domain to your GitHub Spark application.

## 📋 Quick Setup Summary

| Record Type | Name | Value | TTL | Priority |
|------------|------|--------|-----|----------|
| A | @ | 185.199.108.153 | 300 | - |
| A | @ | 185.199.109.153 | 300 | - |
| A | @ | 185.199.110.153 | 300 | - |
| A | @ | 185.199.111.153 | 300 | - |
| CNAME | www | [your-spark-app].github.app | 300 | - |
| CNAME | staging | [your-staging-app].github.app | 300 | - |

## 🏗️ Detailed Configuration Steps

### Step 1: Gather Your Spark URLs

Before configuring DNS, you need your actual Spark application URLs:

1. **Access GitHub Spark Dashboard**
2. **Find Your Application URLs**:
   - Production app: `your-production-app.github.app`
   - Staging app: `your-staging-app.github.app`

**Note**: Replace `[your-spark-app]` and `[your-staging-app]` in the DNS records below with your actual Spark URLs.

### Step 2: Configure DNS Records with Your Registrar

#### For the Root Domain (sabq.ai)

Add these **A records** to point your root domain to GitHub's servers:

```dns
Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.108.153
TTL: 300 (5 minutes)

Type: A  
Name: @ (or leave blank for root domain)
Value: 185.199.109.153
TTL: 300

Type: A
Name: @ (or leave blank for root domain) 
Value: 185.199.110.153
TTL: 300

Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.111.153  
TTL: 300
```

#### For the WWW Subdomain (www.sabq.ai)

Add this **CNAME record** to point www to your Spark app:

```dns
Type: CNAME
Name: www
Value: [your-production-spark-app].github.app
TTL: 300
```

#### For the Staging Subdomain (staging.sabq.ai)

Add this **CNAME record** for your staging environment:

```dns
Type: CNAME
Name: staging  
Value: [your-staging-spark-app].github.app
TTL: 300
```

### Step 3: Platform-Specific Instructions

#### For Cloudflare
1. Log into Cloudflare Dashboard
2. Select your domain (sabq.ai)
3. Go to **DNS** tab
4. Click **Add record**
5. Add each record from the table above
6. **Important**: Set Proxy status to "DNS only" (gray cloud) for CNAME records pointing to GitHub

#### For GoDaddy
1. Log into GoDaddy Account Manager
2. Go to **My Products** > **DNS**
3. Select your domain
4. Click **Add** for each DNS record
5. Enter the Type, Name, and Value as specified above

#### For Namecheap
1. Log into Namecheap account
2. Go to **Domain List** > **Manage**
3. Click **Advanced DNS**
4. Add each record using the **Add New Record** button

#### For Google Domains
1. Sign in to Google Domains
2. Select your domain
3. Click **DNS** in the left sidebar
4. Scroll down to **Custom resource records**
5. Add each record as specified

#### For Route 53 (AWS)
1. Open AWS Route 53 Console
2. Select your hosted zone
3. Click **Create Record Set**
4. Add each record with the specified values

## 🔧 Advanced Configuration Options

### API Subdomain (Optional)
If you plan to use a separate API endpoint:

```dns
Type: CNAME
Name: api
Value: [your-api-spark-app].github.app
TTL: 300
```

### Media/Assets Subdomain (Optional)
For serving media files from a separate subdomain:

```dns  
Type: CNAME
Name: media
Value: [your-media-spark-app].github.app
TTL: 300
```

### Admin Subdomain (Optional)
For a separate admin interface:

```dns
Type: CNAME
Name: admin
Value: [your-admin-spark-app].github.app  
TTL: 300
```

## ⚙️ GitHub Spark Custom Domain Setup

After configuring DNS records, you need to add the custom domain in GitHub Spark:

### Step 1: Access Spark Settings
1. Go to your GitHub Spark dashboard
2. Select your Sabq Althakiyah application
3. Navigate to **Settings** > **Custom Domains**

### Step 2: Add Custom Domain
1. Click **Add Custom Domain**
2. Enter: `www.sabq.ai`
3. Click **Verify** (may take a few minutes for DNS to propagate)
4. Once verified, click **Add**

### Step 3: Configure HTTPS
1. Enable **Force HTTPS redirect**
2. Spark will automatically provision SSL certificates
3. This process may take 10-20 minutes

### Step 4: Add Staging Domain
1. Repeat the above steps for `staging.sabq.ai`
2. Connect it to your staging Spark application

## 📊 Verification and Testing

### DNS Propagation Check
Use these tools to verify your DNS configuration:

1. **Online Tools**:
   - https://dnschecker.org
   - https://www.whatsmydns.net
   - https://dns.google (Google DNS checker)

2. **Command Line Tools**:
   ```bash
   # Check A records
   dig sabq.ai
   
   # Check CNAME records  
   dig www.sabq.ai
   dig staging.sabq.ai
   
   # Check from specific DNS server
   dig @8.8.8.8 www.sabq.ai
   ```

### Test Domain Access
1. **Root domain**: http://sabq.ai (should redirect to https://www.sabq.ai)
2. **WWW domain**: https://www.sabq.ai (your main application)
3. **Staging**: https://staging.sabq.ai (staging environment)

### SSL Certificate Verification
```bash
# Check SSL certificate
openssl s_client -connect www.sabq.ai:443 -servername www.sabq.ai

# Check certificate expiration
curl -vI https://www.sabq.ai 2>&1 | grep -i expire
```

## 🚨 Troubleshooting Common Issues

### 1. DNS Not Propagating
**Problem**: DNS changes not visible after 24 hours
**Solutions**:
- Check TTL values (should be 300 for faster propagation)
- Verify exact record values with your registrar
- Clear local DNS cache: `sudo systemctl flush-dns` (Linux) or `ipconfig /flushdns` (Windows)

### 2. SSL Certificate Issues
**Problem**: HTTPS not working or certificate errors
**Solutions**:
- Ensure CNAME records point exactly to `[your-app].github.app` 
- Wait for Spark to provision certificates (can take 20 minutes)
- Check Spark dashboard for certificate status

### 3. Redirect Loops
**Problem**: Infinite redirect between domains
**Solutions**:
- Verify only one primary domain is configured in Spark
- Check that A records point to GitHub IPs, not other redirects
- Ensure redirect configuration in `spark.config.js` is correct

### 4. Site Not Loading
**Problem**: Domain resolves but site doesn't load
**Solutions**:
- Verify Spark application is deployed and running
- Check Spark application logs for errors
- Ensure domain is properly configured in Spark dashboard

## 📋 Pre-Deployment Checklist

- [ ] All DNS records configured correctly
- [ ] DNS propagation verified (use dnschecker.org)
- [ ] Custom domain added in Spark dashboard
- [ ] SSL certificate provisioned and active
- [ ] HTTP to HTTPS redirect working
- [ ] www.sabq.ai loads your application
- [ ] staging.sabq.ai loads staging version
- [ ] No SSL certificate warnings
- [ ] All links and assets loading correctly
- [ ] Arabic fonts rendering properly
- [ ] RTL layout displaying correctly

## 🔄 Ongoing Maintenance

### Regular Checks
1. **Monthly**: Verify SSL certificate auto-renewal
2. **Quarterly**: Check DNS record integrity  
3. **Annually**: Review domain registration renewal

### Monitoring Setup
Consider setting up monitoring for:
- Domain uptime
- SSL certificate expiration
- DNS resolution times
- Page load performance

## 📞 Support Resources

### DNS-Related Issues
- **Domain Registrar Support**: Contact your domain provider's support team
- **DNS Troubleshooting**: Use online DNS diagnostic tools

### Spark-Related Issues  
- **GitHub Spark Documentation**: Check official Spark hosting docs
- **Spark Dashboard**: Monitor application status and logs
- **Community Support**: GitHub Spark community forums

### Application Issues
- **Error Logs**: Check browser console and Spark application logs
- **Performance**: Use Google PageSpeed Insights for optimization tips

---

## 💡 Pro Tips

1. **Use Short TTL Initially**: Set TTL to 300 (5 minutes) during setup for faster changes
2. **Test Staging First**: Always test domain configuration on staging before production
3. **Monitor Propagation**: DNS changes can take 24-48 hours to propagate globally
4. **Keep Records Simple**: Avoid complex chained CNAME records
5. **Document Changes**: Keep a record of all DNS modifications for future reference

---

**Your DNS configuration for Sabq Althakiyah is now ready!** 🎉

Follow this guide step-by-step, and your Arabic news CMS will be accessible via your custom domain with proper SSL encryption and optimal performance.