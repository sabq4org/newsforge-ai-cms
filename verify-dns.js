#!/usr/bin/env node

/**
 * DNS Configuration Verification Tool for Sabq Althakiyah
 * Helps verify DNS records are configured correctly for your custom domain
 */

const https = require('https');
const dns = require('dns').promises;

// Configuration
const CONFIG = {
  domains: {
    root: 'sabq.ai',
    www: 'www.sabq.ai',
    staging: 'staging.sabq.ai'
  },
  expectedIPs: [
    '185.199.108.153',
    '185.199.109.153', 
    '185.199.110.153',
    '185.199.111.153'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  section: (msg) => {
    console.log(`\n${colors.magenta}${colors.bright}▶ ${msg}${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  }
};

// DNS verification functions
async function checkARecords(domain) {
  try {
    const addresses = await dns.resolve4(domain);
    const missingIPs = CONFIG.expectedIPs.filter(ip => !addresses.includes(ip));
    const extraIPs = addresses.filter(ip => !CONFIG.expectedIPs.includes(ip));
    
    if (missingIPs.length === 0 && extraIPs.length === 0) {
      log.success(`A records for ${domain} are correctly configured`);
      addresses.forEach(ip => console.log(`   ${ip}`));
      return true;
    } else {
      log.warning(`A records for ${domain} need adjustment:`);
      if (missingIPs.length > 0) {
        console.log(`   Missing IPs: ${missingIPs.join(', ')}`);
      }
      if (extraIPs.length > 0) {
        console.log(`   Extra IPs: ${extraIPs.join(', ')}`);
      }
      return false;
    }
  } catch (error) {
    log.error(`Failed to resolve A records for ${domain}: ${error.message}`);
    return false;
  }
}

async function checkCNAMERecord(domain) {
  try {
    const cnames = await dns.resolveCname(domain);
    if (cnames.length > 0) {
      log.success(`CNAME record for ${domain} found:`);
      cnames.forEach(cname => console.log(`   ${cname}`));
      
      // Verify the CNAME points to a github.app domain
      const isGitHubApp = cnames.some(cname => cname.endsWith('.github.app'));
      if (isGitHubApp) {
        log.success(`CNAME correctly points to GitHub Spark`);
        return true;
      } else {
        log.warning(`CNAME should point to a .github.app domain`);
        return false;
      }
    } else {
      log.warning(`No CNAME record found for ${domain}`);
      return false;
    }
  } catch (error) {
    log.error(`Failed to resolve CNAME for ${domain}: ${error.message}`);
    return false;
  }
}

async function checkHTTPS(domain) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      log.success(`HTTPS working for ${domain} (Status: ${res.statusCode})`);
      
      // Check for important headers
      const headers = res.headers;
      if (headers['strict-transport-security']) {
        log.success(`HSTS header present`);
      }
      if (headers['x-frame-options']) {
        log.success(`X-Frame-Options header present: ${headers['x-frame-options']}`);
      }
      
      resolve(true);
    });

    req.on('error', (error) => {
      log.error(`HTTPS failed for ${domain}: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      log.error(`HTTPS timeout for ${domain}`);
      req.destroy();
      resolve(false);
    });

    req.setTimeout(10000);
    req.end();
  });
}

async function checkRedirect(fromDomain, toDomain) {
  return new Promise((resolve) => {
    const options = {
      hostname: fromDomain,
      port: 80,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = require('http').request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        const location = res.headers.location;
        if (location && location.includes(toDomain)) {
          log.success(`Redirect from ${fromDomain} to ${toDomain} working`);
          resolve(true);
        } else {
          log.warning(`Redirect from ${fromDomain} goes to ${location}, expected ${toDomain}`);
          resolve(false);
        }
      } else {
        log.warning(`No redirect found from ${fromDomain} (Status: ${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log.error(`Redirect check failed for ${fromDomain}: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      log.error(`Redirect check timeout for ${fromDomain}`);
      req.destroy();
      resolve(false);
    });

    req.setTimeout(10000);
    req.end();
  });
}

// Main verification function
async function runVerification() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bright}🌐 DNS Configuration Verification${colors.reset}`);
  console.log(`${colors.blue}${colors.bright}   Sabq Althakiyah - سبق الذكية${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);

  const results = {
    aRecords: false,
    wwwCNAME: false,
    stagingCNAME: false,
    httpsWWW: false,
    httpsStaging: false,
    redirect: false
  };

  // Check A records for root domain
  log.section('Checking A Records for Root Domain');
  results.aRecords = await checkARecords(CONFIG.domains.root);

  // Check CNAME for www subdomain
  log.section('Checking CNAME for WWW Subdomain');
  results.wwwCNAME = await checkCNAMERecord(CONFIG.domains.www);

  // Check CNAME for staging subdomain
  log.section('Checking CNAME for Staging Subdomain');
  results.stagingCNAME = await checkCNAMERecord(CONFIG.domains.staging);

  // Check HTTPS for www domain
  log.section('Checking HTTPS for WWW Domain');
  results.httpsWWW = await checkHTTPS(CONFIG.domains.www);

  // Check HTTPS for staging domain
  log.section('Checking HTTPS for Staging Domain');
  results.httpsStaging = await checkHTTPS(CONFIG.domains.staging);

  // Check redirect from root to www
  log.section('Checking Root Domain Redirect');
  results.redirect = await checkRedirect(CONFIG.domains.root, CONFIG.domains.www);

  // Summary
  log.section('Verification Summary');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n${colors.bright}Results: ${passed}/${total} checks passed (${percentage}%)${colors.reset}\n`);

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = {
      aRecords: 'A Records (Root Domain)',
      wwwCNAME: 'CNAME (WWW Subdomain)',
      stagingCNAME: 'CNAME (Staging Subdomain)',
      httpsWWW: 'HTTPS (WWW Domain)',
      httpsStaging: 'HTTPS (Staging Domain)',
      redirect: 'Root to WWW Redirect'
    }[test];
    
    console.log(`${status} ${testName}`);
  });

  // Recommendations
  if (percentage < 100) {
    log.section('Recommendations');
    
    if (!results.aRecords) {
      log.info('Add A records for root domain pointing to GitHub IPs');
      CONFIG.expectedIPs.forEach(ip => {
        console.log(`   Type: A, Name: @, Value: ${ip}, TTL: 300`);
      });
    }
    
    if (!results.wwwCNAME) {
      log.info('Add CNAME record for www subdomain');
      console.log('   Type: CNAME, Name: www, Value: [your-spark-app].github.app, TTL: 300');
    }
    
    if (!results.stagingCNAME) {
      log.info('Add CNAME record for staging subdomain');
      console.log('   Type: CNAME, Name: staging, Value: [your-staging-app].github.app, TTL: 300');
    }
    
    if (!results.httpsWWW || !results.httpsStaging) {
      log.info('Configure custom domain in GitHub Spark dashboard');
      log.info('Enable Force HTTPS redirect in Spark settings');
    }
    
    if (!results.redirect) {
      log.info('Ensure root domain redirects are configured in Spark');
    }
  } else {
    log.success('All DNS checks passed! Your domain is properly configured. 🎉');
  }

  console.log(`\n${colors.cyan}For detailed setup instructions, see: DNS_CONFIGURATION_GUIDE.md${colors.reset}`);
  console.log(`${colors.cyan}For troubleshooting help, see: DOMAIN_SETUP.md${colors.reset}\n`);
}

// Run the verification
if (require.main === module) {
  runVerification().catch(error => {
    log.error(`Verification failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runVerification, checkARecords, checkCNAMERecord, checkHTTPS };