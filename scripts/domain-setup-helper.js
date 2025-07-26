#!/usr/bin/env node

/**
 * Domain Setup Helper for Sabq Althakiyah CMS
 * Provides step-by-step domain configuration guidance
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

class DomainSetupHelper {
  constructor() {
    this.config = {
      domain: '',
      hosting: '',
      hasWWW: false,
      needsEmail: false,
      useCloudflare: false
    };
  }

  async start() {
    console.log('🌍 Sabq Althakiyah Domain Setup Helper');
    console.log('=====================================\n');
    
    await this.getDomainInfo();
    await this.getHostingInfo();
    await this.getAdditionalFeatures();
    
    this.generateInstructions();
    this.generateDNSRecords();
    
    rl.close();
  }

  async getDomainInfo() {
    console.log('📍 Domain Information');
    console.log('---------------------');
    
    this.config.domain = await question('Enter your domain name (e.g., sabq.org): ');
    
    const wwwAnswer = await question('Do you want www.yourdomain.com to work? (y/n): ');
    this.config.hasWWW = wwwAnswer.toLowerCase().startsWith('y');
    
    console.log('');
  }

  async getHostingInfo() {
    console.log('🏠 Hosting Information');
    console.log('----------------------');
    
    console.log('Select your hosting provider:');
    console.log('1. GitHub Pages');
    console.log('2. Vercel');
    console.log('3. Netlify');
    console.log('4. Cloudflare Pages');
    console.log('5. Custom/Other');
    
    const hostingChoice = await question('Enter choice (1-5): ');
    
    const hostingMap = {
      '1': 'github-pages',
      '2': 'vercel',
      '3': 'netlify',
      '4': 'cloudflare-pages',
      '5': 'custom'
    };
    
    this.config.hosting = hostingMap[hostingChoice] || 'custom';
    console.log('');
  }

  async getAdditionalFeatures() {
    console.log('✨ Additional Features');
    console.log('----------------------');
    
    const emailAnswer = await question('Do you need email functionality? (y/n): ');
    this.config.needsEmail = emailAnswer.toLowerCase().startsWith('y');
    
    const cloudflareAnswer = await question('Are you using Cloudflare? (y/n): ');
    this.config.useCloudflare = cloudflareAnswer.toLowerCase().startsWith('y');
    
    console.log('');
  }

  generateInstructions() {
    console.log('📋 Setup Instructions');
    console.log('======================\n');
    
    // Step 1: Repository Setup
    if (this.config.hosting === 'github-pages') {
      console.log('Step 1: Repository Setup');
      console.log('-------------------------');
      console.log('1. Create a file named "CNAME" in your repository root');
      console.log(`2. Add your domain to the CNAME file: ${this.config.domain}`);
      console.log('3. Commit and push the CNAME file');
      console.log('4. Go to repository Settings → Pages');
      console.log('5. Set source to "Deploy from a branch"');
      console.log('6. Select your deployment branch (usually main)');
      console.log('7. Enter your custom domain in the Pages settings\n');
    }
    
    // Step 2: DNS Configuration
    console.log('Step 2: DNS Configuration');
    console.log('--------------------------');
    console.log('Add these DNS records to your domain registrar:\n');
  }

  generateDNSRecords() {
    const records = [];
    
    // Generate records based on hosting provider
    switch (this.config.hosting) {
      case 'github-pages':
        records.push(
          { type: 'A', name: '@', value: '185.199.108.153' },
          { type: 'A', name: '@', value: '185.199.109.153' },
          { type: 'A', name: '@', value: '185.199.110.153' },
          { type: 'A', name: '@', value: '185.199.111.153' }
        );
        
        if (this.config.hasWWW) {
          records.push({ type: 'CNAME', name: 'www', value: this.config.domain });
        }
        break;
        
      case 'vercel':
        records.push({ type: 'A', name: '@', value: '76.76.19.61' });
        if (this.config.hasWWW) {
          records.push({ type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' });
        }
        break;
        
      case 'netlify':
        records.push({ type: 'A', name: '@', value: '75.2.60.5' });
        if (this.config.hasWWW) {
          records.push({ type: 'CNAME', name: 'www', value: this.config.domain });
        }
        break;
        
      case 'cloudflare-pages':
        console.log('For Cloudflare Pages, add your domain in the Cloudflare dashboard.');
        console.log('Cloudflare will automatically configure the DNS records.\n');
        return;
    }

    // Email records
    if (this.config.needsEmail) {
      records.push(
        { type: 'MX', name: '@', value: '10 mail.google.com', note: 'Google Workspace' },
        { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', note: 'SPF record' }
      );
    }

    // Display records in table format
    console.log('DNS Records:');
    console.log('┌─────────┬──────────────┬────────────────────────────────┬─────────────────┐');
    console.log('│ Type    │ Name         │ Value                          │ Note            │');
    console.log('├─────────┼──────────────┼────────────────────────────────┼─────────────────┤');
    
    records.forEach(record => {
      const type = record.type.padEnd(7);
      const name = record.name.padEnd(12);
      const value = record.value.length > 30 ? record.value.substring(0, 27) + '...' : record.value.padEnd(30);
      const note = (record.note || '').padEnd(15);
      console.log(`│ ${type} │ ${name} │ ${value} │ ${note} │`);
    });
    
    console.log('└─────────┴──────────────┴────────────────────────────────┴─────────────────┘\n');

    // Additional instructions
    console.log('Additional Notes:');
    console.log('• DNS changes can take 24-48 hours to propagate fully');
    console.log('• Use the verification scripts to check your setup:');
    console.log(`  - node scripts/dns-verification.js`);
    console.log(`  - bash scripts/dns-verification.sh ${this.config.domain}`);
    
    if (this.config.useCloudflare) {
      console.log('\n☁️ Cloudflare Users:');
      console.log('• Set SSL/TLS encryption mode to "Full" or "Full (strict)"');
      console.log('• Enable "Always Use HTTPS"');
      console.log('• Consider enabling "Automatic HTTPS Rewrites"');
    }

    console.log('\n🎉 Setup complete! Run the verification script to check your configuration.');
  }
}

// Export CNAME file generator
function generateCNAMEFile(domain) {
  const fs = require('fs');
  const path = require('path');
  
  const cnamePath = path.join(process.cwd(), 'public', 'CNAME');
  
  // Ensure public directory exists
  const publicDir = path.dirname(cnamePath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(cnamePath, domain);
  console.log(`✅ CNAME file created at: ${cnamePath}`);
  console.log(`📄 Content: ${domain}`);
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--generate-cname') || args.includes('-c')) {
    const domain = args[args.indexOf('--generate-cname') + 1] || args[args.indexOf('-c') + 1];
    if (domain) {
      generateCNAMEFile(domain);
    } else {
      console.error('❌ Please specify a domain: --generate-cname yourdomain.com');
    }
    return;
  }
  
  const helper = new DomainSetupHelper();
  await helper.start();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DomainSetupHelper, generateCNAMEFile };