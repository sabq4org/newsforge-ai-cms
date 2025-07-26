#!/bin/bash

# Sabq Althakiyah - Custom Domain Setup Script
# This script helps configure custom domain for GitHub Spark hosting

set -e

echo "🌐 Sabq Althakiyah - Custom Domain Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_CONFIG_FILE="spark.config.js"
DEPLOYMENT_CONFIG_FILE="spark.json"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required files exist
check_files() {
    print_status "Checking required configuration files..."
    
    if [[ ! -f "$DOMAIN_CONFIG_FILE" ]]; then
        print_error "Missing $DOMAIN_CONFIG_FILE"
        exit 1
    fi
    
    if [[ ! -f "$DEPLOYMENT_CONFIG_FILE" ]]; then
        print_error "Missing $DEPLOYMENT_CONFIG_FILE"
        exit 1
    fi
    
    print_success "All configuration files found"
}

# Function to validate domain format
validate_domain() {
    local domain=$1
    if [[ $domain =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check DNS configuration
check_dns() {
    local domain=$1
    print_status "Checking DNS configuration for $domain..."
    
    if command -v dig >/dev/null 2>&1; then
        local dns_result=$(dig +short "$domain")
        if [[ -n "$dns_result" ]]; then
            print_success "DNS resolution successful for $domain"
            echo "  Resolved to: $dns_result"
        else
            print_warning "No DNS records found for $domain"
        fi
    else
        print_warning "dig command not available, skipping DNS check"
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    print_status "Checking SSL certificate for $domain..."
    
    if command -v openssl >/dev/null 2>&1; then
        if timeout 10s openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
            print_success "SSL certificate is valid for $domain"
        else
            print_warning "SSL certificate check failed for $domain (this is normal if domain is not yet configured)"
        fi
    else
        print_warning "openssl command not available, skipping SSL check"
    fi
}

# Function to update package.json with deployment scripts
update_package_json() {
    print_status "Updating package.json with deployment scripts..."
    
    if [[ -f "package.json" ]]; then
        # Add deployment scripts if they don't exist
        if ! grep -q "deploy:production" package.json; then
            print_status "Adding deployment scripts to package.json..."
            # This would normally use jq but we'll provide instructions instead
            print_warning "Please manually add these scripts to your package.json:"
            echo '  "scripts": {'
            echo '    "deploy:production": "npm run build && spark deploy --env production",'
            echo '    "deploy:staging": "npm run build && spark deploy --env staging",'
            echo '    "domain:setup": "spark domain add",'
            echo '    "domain:verify": "spark domain verify"'
            echo '  }'
        fi
    fi
}

# Function to create deployment checklist
create_checklist() {
    print_status "Creating deployment checklist..."
    
    cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚀 Sabq Althakiyah Deployment Checklist

## Pre-Deployment

- [ ] Domain registered and DNS access confirmed
- [ ] GitHub Spark account set up
- [ ] Repository connected to Spark
- [ ] Environment variables configured

## DNS Configuration

- [ ] CNAME record for www.sabq.ai pointing to Spark
- [ ] A records for root domain (sabq.ai) configured
- [ ] Staging subdomain CNAME configured
- [ ] DNS propagation verified (24-48 hours)

## Spark Configuration

- [ ] Custom domain added in Spark dashboard
- [ ] SSL certificate provisioned
- [ ] Environment variables set for production
- [ ] Build configuration verified
- [ ] Deployment successful

## Testing

- [ ] Production domain loads correctly
- [ ] HTTPS redirect working
- [ ] Arabic content displays properly
- [ ] RTL layout functioning
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

## Post-Deployment

- [ ] Analytics tracking configured
- [ ] Error monitoring set up
- [ ] Backup domain configuration verified
- [ ] Documentation updated
- [ ] Team access configured

## Emergency Contacts

- GitHub Spark Support: [Add support link]
- Domain Registrar Support: [Add registrar support]
- Technical Team: [Add team contacts]

---

*Last updated: $(date)*
EOF

    print_success "Deployment checklist created: DEPLOYMENT_CHECKLIST.md"
}

# Function to create environment configuration
create_env_config() {
    print_status "Creating environment configuration templates..."
    
    # Production environment
    cat > .env.production << 'EOF'
# Production Environment Configuration
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_URL=https://www.sabq.ai
VITE_API_BASE_URL=https://api.sabq.ai

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_ID=

# Features
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_AUDIO_FEATURES=true

# Security
VITE_CSP_ENABLED=true
VITE_HSTS_ENABLED=true
EOF

    # Staging environment
    cat > .env.staging << 'EOF'
# Staging Environment Configuration
NODE_ENV=staging
VITE_APP_ENV=staging
VITE_APP_URL=https://staging.sabq.ai
VITE_API_BASE_URL=https://api-staging.sabq.ai

# Analytics
VITE_ANALYTICS_ENABLED=false

# Features
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_AUDIO_FEATURES=true

# Security
VITE_CSP_ENABLED=true
VITE_HSTS_ENABLED=true
EOF

    print_success "Environment configuration files created"
    print_warning "Please update the environment files with your actual values"
}

# Function to verify build configuration
verify_build() {
    print_status "Verifying build configuration..."
    
    if [[ -f "vite.config.ts" ]]; then
        print_success "Vite configuration found"
    else
        print_error "vite.config.ts not found"
        exit 1
    fi
    
    if [[ -f "tailwind.config.js" ]]; then
        print_success "Tailwind configuration found"
    else
        print_warning "tailwind.config.js not found"
    fi
    
    # Check if build command works
    print_status "Testing build process..."
    if npm run build; then
        print_success "Build process completed successfully"
    else
        print_error "Build process failed"
        exit 1
    fi
}

# Main setup function
main() {
    echo ""
    print_status "Starting custom domain setup for Sabq Althakiyah..."
    echo ""
    
    # Check required files
    check_files
    
    # Get domain from user or use default
    read -p "Enter your primary domain (default: www.sabq.ai): " DOMAIN
    DOMAIN=${DOMAIN:-"www.sabq.ai"}
    
    if ! validate_domain "$DOMAIN"; then
        print_error "Invalid domain format: $DOMAIN"
        exit 1
    fi
    
    print_success "Using domain: $DOMAIN"
    
    # Check DNS and SSL
    check_dns "$DOMAIN"
    check_ssl "$DOMAIN"
    
    # Update configurations
    update_package_json
    create_env_config
    create_checklist
    
    # Verify build
    read -p "Do you want to test the build process? (y/N): " TEST_BUILD
    if [[ $TEST_BUILD =~ ^[Yy]$ ]]; then
        verify_build
    fi
    
    echo ""
    print_success "Domain setup configuration completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Configure DNS records with your domain provider"
    echo "2. Add custom domain in GitHub Spark dashboard"
    echo "3. Update environment variables"
    echo "4. Deploy to staging first, then production"
    echo "5. Follow the deployment checklist"
    echo ""
    print_status "For detailed instructions, see: DOMAIN_SETUP.md"
    print_status "For deployment checklist, see: DEPLOYMENT_CHECKLIST.md"
    echo ""
}

# Run main function
main "$@"