#!/bin/bash

# DNS Configuration Helper Script for Sabq Althakiyah
# This script helps you set up DNS records for your custom domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Unicode symbols
CHECK_MARK="✅"
CROSS_MARK="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
ROCKET="🚀"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}🌐 DNS Configuration Helper${NC}"
echo -e "${BLUE}   Sabq Althakiyah - سبق الذكية${NC}"
echo -e "${BLUE}=====================================${NC}"
echo

# Function to print section headers
print_section() {
    echo -e "\n${PURPLE}▶ $1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..50})${NC}"
}

# Function to print DNS record in table format
print_dns_record() {
    local type="$1"
    local name="$2"
    local value="$3"
    local ttl="$4"
    
    printf "│ %-8s │ %-12s │ %-35s │ %-5s │\n" "$type" "$name" "$value" "$ttl"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check DNS propagation
check_dns() {
    local domain="$1"
    local type="$2"
    
    if command_exists dig; then
        echo -e "${INFO} Checking DNS for $domain ($type record)..."
        dig +short "$domain" "$type" 2>/dev/null || echo -e "${WARNING} DNS not yet propagated"
    else
        echo -e "${WARNING} 'dig' command not found. Please check DNS manually at: https://dnschecker.org"
    fi
}

# Check if user has the required information
print_section "Prerequisites Check"

echo -e "${INFO} Before we start, make sure you have:"
echo -e "   ${CHECK_MARK} Access to your domain registrar's DNS settings"
echo -e "   ${CHECK_MARK} Your GitHub Spark application URL(s)"
echo -e "   ${CHECK_MARK} Domain ownership verification"
echo

read -p "Do you have all the prerequisites? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CROSS_MARK} Please ensure you have all prerequisites before continuing."
    exit 1
fi

# Get Spark application URLs
print_section "Spark Application URLs"

echo -e "${INFO} Please provide your GitHub Spark application URLs:"
echo -e "${YELLOW}Note: You can find these in your GitHub Spark dashboard${NC}"
echo

read -p "Production Spark URL (e.g., your-app.github.app): " PROD_SPARK_URL
read -p "Staging Spark URL (optional, e.g., your-staging.github.app): " STAGING_SPARK_URL

# Validate URLs
if [[ ! $PROD_SPARK_URL =~ \.github\.app$ ]]; then
    echo -e "${WARNING} Production URL should end with .github.app"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Display DNS records to configure
print_section "DNS Records Configuration"

echo -e "${INFO} Configure these DNS records with your domain registrar:"
echo

# Table header
echo "┌──────────┬──────────────┬─────────────────────────────────────┬───────┐"
echo "│   Type   │     Name     │                Value                │  TTL  │"
echo "├──────────┼──────────────┼─────────────────────────────────────┼───────┤"

# A records for root domain
print_dns_record "A" "@" "185.199.108.153" "300"
print_dns_record "A" "@" "185.199.109.153" "300"
print_dns_record "A" "@" "185.199.110.153" "300"
print_dns_record "A" "@" "185.199.111.153" "300"

# CNAME for www
print_dns_record "CNAME" "www" "$PROD_SPARK_URL" "300"

# CNAME for staging (if provided)
if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    print_dns_record "CNAME" "staging" "$STAGING_SPARK_URL" "300"
fi

echo "└──────────┴──────────────┴─────────────────────────────────────┴───────┘"

# Platform-specific instructions
print_section "Platform-Specific Instructions"

echo -e "${INFO} Choose your DNS provider for specific instructions:"
echo -e "   1) Cloudflare"
echo -e "   2) GoDaddy"
echo -e "   3) Namecheap"
echo -e "   4) Google Domains"
echo -e "   5) AWS Route 53"
echo -e "   6) Other/Manual"
echo

read -p "Select your DNS provider (1-6): " -n 1 -r DNS_PROVIDER
echo

case $DNS_PROVIDER in
    1)
        echo -e "${BLUE}Cloudflare Instructions:${NC}"
        echo -e "1. Log into Cloudflare Dashboard"
        echo -e "2. Select your domain (sabq.ai)"
        echo -e "3. Go to ${YELLOW}DNS${NC} tab"
        echo -e "4. Click ${YELLOW}Add record${NC}"
        echo -e "5. Add each record from the table above"
        echo -e "${WARNING} Set Proxy status to ${YELLOW}DNS only${NC} (gray cloud) for CNAME records"
        ;;
    2)
        echo -e "${BLUE}GoDaddy Instructions:${NC}"
        echo -e "1. Log into GoDaddy Account Manager"
        echo -e "2. Go to ${YELLOW}My Products > DNS${NC}"
        echo -e "3. Select your domain"
        echo -e "4. Click ${YELLOW}Add${NC} for each DNS record"
        echo -e "5. Enter the Type, Name, and Value as specified"
        ;;
    3)
        echo -e "${BLUE}Namecheap Instructions:${NC}"
        echo -e "1. Log into Namecheap account"
        echo -e "2. Go to ${YELLOW}Domain List > Manage${NC}"
        echo -e "3. Click ${YELLOW}Advanced DNS${NC}"
        echo -e "4. Add each record using ${YELLOW}Add New Record${NC} button"
        ;;
    4)
        echo -e "${BLUE}Google Domains Instructions:${NC}"
        echo -e "1. Sign in to Google Domains"
        echo -e "2. Select your domain"
        echo -e "3. Click ${YELLOW}DNS${NC} in the left sidebar"
        echo -e "4. Scroll to ${YELLOW}Custom resource records${NC}"
        echo -e "5. Add each record as specified"
        ;;
    5)
        echo -e "${BLUE}AWS Route 53 Instructions:${NC}"
        echo -e "1. Open AWS Route 53 Console"
        echo -e "2. Select your hosted zone"
        echo -e "3. Click ${YELLOW}Create Record Set${NC}"
        echo -e "4. Add each record with specified values"
        ;;
    *)
        echo -e "${BLUE}General Instructions:${NC}"
        echo -e "1. Access your domain registrar's DNS management"
        echo -e "2. Look for options like 'DNS Records', 'DNS Management', or 'Advanced DNS'"
        echo -e "3. Add each record from the table above"
        echo -e "4. Save your changes"
        ;;
esac

# GitHub Spark configuration
print_section "GitHub Spark Configuration"

echo -e "${INFO} After configuring DNS records, set up custom domain in GitHub Spark:"
echo -e "1. Go to your GitHub Spark dashboard"
echo -e "2. Select your Sabq Althakiyah application"
echo -e "3. Navigate to ${YELLOW}Settings > Custom Domains${NC}"
echo -e "4. Click ${YELLOW}Add Custom Domain${NC}"
echo -e "5. Enter: ${YELLOW}www.sabq.ai${NC}"
echo -e "6. Click ${YELLOW}Verify${NC} (may take a few minutes)"
echo -e "7. Enable ${YELLOW}Force HTTPS${NC} redirect"
echo

if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    echo -e "${INFO} For staging domain:"
    echo -e "8. Repeat above steps for ${YELLOW}staging.sabq.ai${NC}"
    echo
fi

# Verification steps
print_section "Verification and Testing"

echo -e "${INFO} Verification steps (after DNS propagation):"
echo

# Check if dig is available
if command_exists dig; then
    echo -e "${GEAR} DNS verification commands:"
    echo -e "   ${CYAN}dig sabq.ai${NC}                  # Check A records"
    echo -e "   ${CYAN}dig www.sabq.ai${NC}              # Check CNAME for www"
    if [[ ! -z "$STAGING_SPARK_URL" ]]; then
        echo -e "   ${CYAN}dig staging.sabq.ai${NC}          # Check CNAME for staging"
    fi
    echo
fi

echo -e "${GEAR} Online verification tools:"
echo -e "   ${CYAN}https://dnschecker.org${NC}        # Global DNS propagation check"
echo -e "   ${CYAN}https://www.whatsmydns.net${NC}    # DNS propagation status"
echo

echo -e "${GEAR} Test domain access:"
echo -e "   ${CYAN}https://www.sabq.ai${NC}           # Main application"
if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    echo -e "   ${CYAN}https://staging.sabq.ai${NC}       # Staging environment"
fi

# Create a summary file
print_section "Creating Configuration Summary"

cat > dns_configuration_summary.txt << EOF
DNS Configuration Summary for Sabq Althakiyah
==============================================

Production Spark URL: $PROD_SPARK_URL
Staging Spark URL: ${STAGING_SPARK_URL:-"Not provided"}

DNS Records to Configure:
-------------------------
Type: A,     Name: @,       Value: 185.199.108.153,  TTL: 300
Type: A,     Name: @,       Value: 185.199.109.153,  TTL: 300
Type: A,     Name: @,       Value: 185.199.110.153,  TTL: 300
Type: A,     Name: @,       Value: 185.199.111.153,  TTL: 300
Type: CNAME, Name: www,     Value: $PROD_SPARK_URL,  TTL: 300
EOF

if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    echo "Type: CNAME, Name: staging, Value: $STAGING_SPARK_URL, TTL: 300" >> dns_configuration_summary.txt
fi

cat >> dns_configuration_summary.txt << EOF

Verification Commands:
----------------------
dig sabq.ai
dig www.sabq.ai
EOF

if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    echo "dig staging.sabq.ai" >> dns_configuration_summary.txt
fi

cat >> dns_configuration_summary.txt << EOF

Test URLs:
----------
https://www.sabq.ai
EOF

if [[ ! -z "$STAGING_SPARK_URL" ]]; then
    echo "https://staging.sabq.ai" >> dns_configuration_summary.txt
fi

echo -e "${CHECK_MARK} Configuration summary saved to: ${YELLOW}dns_configuration_summary.txt${NC}"

# Final instructions
print_section "Next Steps"

echo -e "${ROCKET} Complete these steps in order:"
echo -e "   1. Configure DNS records with your registrar"
echo -e "   2. Wait for DNS propagation (can take 24-48 hours)"
echo -e "   3. Add custom domain in GitHub Spark dashboard"
echo -e "   4. Enable HTTPS in Spark settings"
echo -e "   5. Test your domain access"
echo

echo -e "${INFO} DNS propagation typically takes:"
echo -e "   • ${GREEN}5-30 minutes${NC} for most changes to appear"
echo -e "   • ${YELLOW}Up to 24-48 hours${NC} for global propagation"
echo

echo -e "${WARNING} Important notes:"
echo -e "   • Use TTL 300 (5 minutes) for faster propagation during setup"
echo -e "   • Test staging domain first before configuring production"
echo -e "   • SSL certificates may take 10-20 minutes to provision"
echo

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}${CHECK_MARK} DNS Configuration Guide Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo
echo -e "For detailed troubleshooting, see: ${CYAN}DNS_CONFIGURATION_GUIDE.md${NC}"
echo -e "For questions, refer to: ${CYAN}DOMAIN_SETUP.md${NC}"
echo

exit 0