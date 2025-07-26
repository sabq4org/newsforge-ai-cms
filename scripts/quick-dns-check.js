#!/usr/bin/env node

/**
 * Quick DNS Check for Sabq Althakiyah CMS
 * Fast domain verification for production deployment
 */

const dns = require('dns').promises;

async function quickCheck(domain = 'sabq.org') {
  console.log(`🚀 Quick DNS check for: ${domain}\n`);
  
  try {
    // A Records
    const aRecords = await dns.resolve4(domain);
    console.log(`✅ A Records: ${aRecords.join(', ')}`);
    
    // Check GitHub Pages IPs
    const githubIPs = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
    const hasGitHubIP = aRecords.some(ip => githubIPs.includes(ip));
    
    if (hasGitHubIP) {
      console.log('✅ GitHub Pages configuration detected');
    } else {
      console.log('⚠️  Not using GitHub Pages IPs');
    }
    
    // WWW CNAME
    try {
      const wwwCname = await dns.resolveCname(`www.${domain}`);
      console.log(`✅ WWW CNAME: ${wwwCname.join(', ')}`);
    } catch {
      console.log('⚠️  No WWW CNAME found');
    }
    
    console.log('\n🎉 Quick check complete!');
    console.log('📋 For detailed verification, run: node scripts/dns-verification.js');
    
  } catch (error) {
    console.error(`❌ DNS lookup failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI execution
const domain = process.argv[2] || 'sabq.org';
quickCheck(domain);