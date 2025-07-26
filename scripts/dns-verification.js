#!/usr/bin/env node

/**
 * DNS Verification Script for Sabq Althakiyah CMS
 * Checks domain configuration for production deployment
 */

const dns = require('dns').promises;
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Your domain configuration
  domains: [
    'sabq.org',
    'www.sabq.org',
    'api.sabq.org',
    'cdn.sabq.org'
  ],
  
  // Expected DNS records
  expectedRecords: {
    A: [], // Will be populated during verification
    AAAA: [], // IPv6 records
    CNAME: {
      'www.sabq.org': 'sabq.org',
      'cdn.sabq.org': 'cdn.provider.com'
    },
    MX: [
      { priority: 10, exchange: 'mail.sabq.org' }
    ],
    TXT: [
      // SPF record
      'v=spf1 include:_spf.google.com ~all',
      // DKIM and domain verification records will be added here
    ]
  },
  
  // SSL/TLS configuration
  ssl: {
    checkCertificate: true,
    minValidDays: 30
  },
  
  // Hosting provider specific checks
  hosting: {
    provider: 'github-pages', // or 'vercel', 'netlify', 'cloudflare'
    customDomain: true
  }
};

class DNSVerifier {
  constructor() {
    this.results = {
      domains: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async verifyAll() {
    console.log('🔍 Starting DNS verification for Sabq Althakiyah CMS...\n');
    
    for (const domain of CONFIG.domains) {
      await this.verifyDomain(domain);
    }
    
    this.printSummary();
    return this.results;
  }

  async verifyDomain(domain) {
    console.log(`\n📍 Verifying domain: ${domain}`);
    console.log('─'.repeat(50));
    
    const domainResult = {
      domain,
      records: {},
      ssl: {},
      connectivity: {},
      issues: [],
      warnings: []
    };

    try {
      // DNS Record Checks
      await this.checkARecords(domain, domainResult);
      await this.checkAAAARecords(domain, domainResult);
      await this.checkCNAMERecords(domain, domainResult);
      await this.checkMXRecords(domain, domainResult);
      await this.checkTXTRecords(domain, domainResult);
      
      // SSL/TLS Certificate Check
      if (CONFIG.ssl.checkCertificate) {
        await this.checkSSLCertificate(domain, domainResult);
      }
      
      // Connectivity Check
      await this.checkConnectivity(domain, domainResult);
      
      // GitHub Pages specific checks
      if (CONFIG.hosting.provider === 'github-pages') {
        await this.checkGitHubPages(domain, domainResult);
      }
      
    } catch (error) {
      domainResult.issues.push(`General error: ${error.message}`);
      console.log(`❌ Error verifying ${domain}: ${error.message}`);
    }

    this.results.domains[domain] = domainResult;
    this.updateSummary(domainResult);
  }

  async checkARecords(domain, result) {
    try {
      const records = await dns.resolve4(domain);
      result.records.A = records;
      
      if (records.length > 0) {
        console.log(`✅ A Records: ${records.join(', ')}`);
      } else {
        result.issues.push('No A records found');
        console.log(`❌ No A records found for ${domain}`);
      }
    } catch (error) {
      result.issues.push(`A record lookup failed: ${error.message}`);
      console.log(`❌ A record lookup failed: ${error.message}`);
    }
  }

  async checkAAAARecords(domain, result) {
    try {
      const records = await dns.resolve6(domain);
      result.records.AAAA = records;
      console.log(`✅ AAAA Records: ${records.join(', ')}`);
    } catch (error) {
      // IPv6 is optional, so we'll just note it as a warning
      result.warnings.push(`No IPv6 (AAAA) records: ${error.message}`);
      console.log(`⚠️  No IPv6 records found (optional)`);
    }
  }

  async checkCNAMERecords(domain, result) {
    if (domain.startsWith('www.') || domain.includes('api.') || domain.includes('cdn.')) {
      try {
        const records = await dns.resolveCname(domain);
        result.records.CNAME = records;
        
        const expectedCname = CONFIG.expectedRecords.CNAME[domain];
        if (expectedCname && !records.includes(expectedCname)) {
          result.warnings.push(`CNAME doesn't match expected: ${expectedCname}`);
          console.log(`⚠️  CNAME: ${records.join(', ')} (expected: ${expectedCname})`);
        } else {
          console.log(`✅ CNAME Records: ${records.join(', ')}`);
        }
      } catch (error) {
        if (domain.startsWith('www.')) {
          result.issues.push(`CNAME lookup failed for www subdomain: ${error.message}`);
          console.log(`❌ CNAME lookup failed: ${error.message}`);
        } else {
          console.log(`ℹ️  No CNAME record (using A record instead)`);
        }
      }
    }
  }

  async checkMXRecords(domain, result) {
    try {
      const records = await dns.resolveMx(domain);
      result.records.MX = records;
      
      if (records.length > 0) {
        console.log(`✅ MX Records: ${records.map(r => `${r.priority} ${r.exchange}`).join(', ')}`);
      } else {
        result.warnings.push('No MX records found');
        console.log(`⚠️  No MX records found`);
      }
    } catch (error) {
      result.warnings.push(`MX record lookup failed: ${error.message}`);
      console.log(`⚠️  MX record lookup failed: ${error.message}`);
    }
  }

  async checkTXTRecords(domain, result) {
    try {
      const records = await dns.resolveTxt(domain);
      result.records.TXT = records.flat();
      
      if (records.length > 0) {
        console.log(`✅ TXT Records found: ${records.length} record(s)`);
        
        // Check for SPF record
        const spfRecord = records.flat().find(r => r.startsWith('v=spf1'));
        if (spfRecord) {
          console.log(`  📧 SPF: ${spfRecord}`);
        } else {
          result.warnings.push('No SPF record found');
          console.log(`  ⚠️  No SPF record found`);
        }
      } else {
        result.warnings.push('No TXT records found');
        console.log(`⚠️  No TXT records found`);
      }
    } catch (error) {
      result.warnings.push(`TXT record lookup failed: ${error.message}`);
      console.log(`⚠️  TXT record lookup failed: ${error.message}`);
    }
  }

  async checkSSLCertificate(domain, result) {
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        method: 'HEAD',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (cert && cert.subject) {
          result.ssl = {
            subject: cert.subject.CN,
            issuer: cert.issuer.CN,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysUntilExpiry: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
          };

          const daysLeft = result.ssl.daysUntilExpiry;
          
          if (daysLeft > CONFIG.ssl.minValidDays) {
            console.log(`✅ SSL Certificate: Valid until ${cert.valid_to} (${daysLeft} days)`);
          } else if (daysLeft > 0) {
            result.warnings.push(`SSL certificate expires soon: ${daysLeft} days`);
            console.log(`⚠️  SSL Certificate expires in ${daysLeft} days`);
          } else {
            result.issues.push('SSL certificate has expired');
            console.log(`❌ SSL Certificate has expired`);
          }
        } else {
          result.issues.push('No SSL certificate found');
          console.log(`❌ No SSL certificate found`);
        }
        
        resolve();
      });

      req.on('error', (error) => {
        result.issues.push(`SSL check failed: ${error.message}`);
        console.log(`❌ SSL check failed: ${error.message}`);
        resolve();
      });

      req.on('timeout', () => {
        result.warnings.push('SSL check timed out');
        console.log(`⚠️  SSL check timed out`);
        resolve();
      });

      req.setTimeout(10000);
      req.end();
    });
  }

  async checkConnectivity(domain, result) {
    // HTTP connectivity check
    await this.checkHTTPConnectivity(domain, result, 'http');
    // HTTPS connectivity check
    await this.checkHTTPConnectivity(domain, result, 'https');
  }

  async checkHTTPConnectivity(domain, result, protocol) {
    return new Promise((resolve) => {
      const module = protocol === 'https' ? https : http;
      const port = protocol === 'https' ? 443 : 80;
      
      const options = {
        hostname: domain,
        port,
        method: 'HEAD',
        timeout: 10000,
        path: '/'
      };

      const req = module.request(options, (res) => {
        result.connectivity[protocol] = {
          status: res.statusCode,
          headers: res.headers
        };

        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ ${protocol.toUpperCase()} Connectivity: ${res.statusCode}`);
          
          // Check for redirects
          if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`  🔄 Redirects to: ${res.headers.location}`);
          }
        } else {
          result.warnings.push(`${protocol.toUpperCase()} returned ${res.statusCode}`);
          console.log(`⚠️  ${protocol.toUpperCase()} returned: ${res.statusCode}`);
        }
        
        resolve();
      });

      req.on('error', (error) => {
        result.issues.push(`${protocol.toUpperCase()} connectivity failed: ${error.message}`);
        console.log(`❌ ${protocol.toUpperCase()} connectivity failed: ${error.message}`);
        resolve();
      });

      req.on('timeout', () => {
        result.warnings.push(`${protocol.toUpperCase()} connection timed out`);
        console.log(`⚠️  ${protocol.toUpperCase()} connection timed out`);
        resolve();
      });

      req.setTimeout(10000);
      req.end();
    });
  }

  async checkGitHubPages(domain, result) {
    console.log(`🔍 Checking GitHub Pages configuration...`);
    
    // Check if domain resolves to GitHub Pages IPs
    const githubPagesIPs = [
      '185.199.108.153',
      '185.199.109.153',
      '185.199.110.153',
      '185.199.111.153'
    ];

    const aRecords = result.records.A || [];
    const hasGitHubIP = aRecords.some(ip => githubPagesIPs.includes(ip));
    
    if (hasGitHubIP) {
      console.log(`✅ Domain points to GitHub Pages`);
    } else {
      result.warnings.push('Domain does not point to GitHub Pages IPs');
      console.log(`⚠️  Domain does not point to GitHub Pages IPs`);
      console.log(`   Expected one of: ${githubPagesIPs.join(', ')}`);
      console.log(`   Found: ${aRecords.join(', ')}`);
    }

    // Check for CNAME file requirement
    if (domain !== 'github.io' && !domain.endsWith('.github.io')) {
      console.log(`ℹ️  Custom domain detected - ensure CNAME file exists in repository`);
    }
  }

  updateSummary(domainResult) {
    this.results.summary.total++;
    
    if (domainResult.issues.length === 0) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
    
    this.results.summary.warnings += domainResult.warnings.length;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DNS VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const { total, passed, failed, warnings } = this.results.summary;
    
    console.log(`Total domains checked: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(40));
    
    for (const [domain, result] of Object.entries(this.results.domains)) {
      const status = result.issues.length === 0 ? '✅' : '❌';
      console.log(`${status} ${domain}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   ❌ ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
      }
    }

    if (failed === 0) {
      console.log('\n🎉 All domains are properly configured!');
    } else {
      console.log('\n⚠️  Some domains have issues that need attention.');
    }

    console.log('\n📝 Next Steps:');
    if (CONFIG.hosting.provider === 'github-pages') {
      console.log('• Ensure CNAME file exists in your repository root');
      console.log('• Verify GitHub Pages settings in repository settings');
      console.log('• Check that custom domain is configured in GitHub Pages');
    }
    console.log('• Update DNS records with your domain registrar if needed');
    console.log('• Wait 24-48 hours for DNS propagation');
    console.log('• Re-run this script to verify changes');
  }

  // Export results to file
  saveResults(filename = 'dns-verification-results.json') {
    const fs = require('fs');
    const results = {
      ...this.results,
      timestamp: new Date().toISOString(),
      config: CONFIG
    };
    
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
  }
}

// CLI execution
async function main() {
  const verifier = new DNSVerifier();
  
  try {
    const results = await verifier.verifyAll();
    
    // Save results if requested
    const args = process.argv.slice(2);
    if (args.includes('--save') || args.includes('-s')) {
      verifier.saveResults();
    }
    
    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ DNS verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DNSVerifier, CONFIG };