#!/bin/bash

# DNS Verification Script for Sabq Althakiyah CMS
# This script checks domain configuration and DNS setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-sabq.org}"
CHECK_SSL="${CHECK_SSL:-true}"
CHECK_GITHUB_PAGES="${CHECK_GITHUB_PAGES:-true}"

echo -e "${BLUE}🔍 DNS Verification for Sabq Althakiyah CMS${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo -e "${BLUE}📋 Checking required tools...${NC}"
MISSING_TOOLS=()

if ! command_exists dig; then
    MISSING_TOOLS+=("dig (dnsutils)")
fi

if ! command_exists curl; then
    MISSING_TOOLS+=("curl")
fi

if ! command_exists openssl; then
    MISSING_TOOLS+=("openssl")
fi

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required tools: ${MISSING_TOOLS[*]}${NC}"
    echo -e "${YELLOW}💡 Install with: sudo apt-get install dnsutils curl openssl${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tools available${NC}"
echo ""

# DNS Record Checks
echo -e "${BLUE}🔍 Checking DNS records for: ${DOMAIN}${NC}"
echo "----------------------------------------"

# A Records
echo -n "A Records: "
A_RECORDS=$(dig +short A $DOMAIN 2>/dev/null || echo "")
if [ -n "$A_RECORDS" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    echo "   $A_RECORDS"
else
    echo -e "${RED}❌ None found${NC}"
fi

# AAAA Records (IPv6)
echo -n "AAAA Records: "
AAAA_RECORDS=$(dig +short AAAA $DOMAIN 2>/dev/null || echo "")
if [ -n "$AAAA_RECORDS" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    echo "   $AAAA_RECORDS"
else
    echo -e "${YELLOW}⚠️  None found (IPv6 optional)${NC}"
fi

# CNAME Records (for www subdomain)
echo -n "WWW CNAME: "
WWW_CNAME=$(dig +short CNAME www.$DOMAIN 2>/dev/null || echo "")
if [ -n "$WWW_CNAME" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    echo "   www.$DOMAIN -> $WWW_CNAME"
else
    echo -e "${YELLOW}⚠️  None found${NC}"
fi

# MX Records
echo -n "MX Records: "
MX_RECORDS=$(dig +short MX $DOMAIN 2>/dev/null || echo "")
if [ -n "$MX_RECORDS" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    echo "   $MX_RECORDS"
else
    echo -e "${YELLOW}⚠️  None found${NC}"
fi

# TXT Records
echo -n "TXT Records: "
TXT_RECORDS=$(dig +short TXT $DOMAIN 2>/dev/null || echo "")
if [ -n "$TXT_RECORDS" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    # Check for SPF record
    if echo "$TXT_RECORDS" | grep -q "v=spf1"; then
        echo -e "   ${GREEN}📧 SPF record found${NC}"
    else
        echo -e "   ${YELLOW}⚠️  No SPF record found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  None found${NC}"
fi

echo ""

# SSL Certificate Check
if [ "$CHECK_SSL" = "true" ]; then
    echo -e "${BLUE}🔒 Checking SSL Certificate...${NC}"
    echo "----------------------------------------"
    
    SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null || echo "")
    
    if [ -n "$SSL_INFO" ]; then
        echo -e "${GREEN}✅ SSL Certificate found${NC}"
        
        # Extract expiry date
        EXPIRY=$(echo "$SSL_INFO" | grep "notAfter" | cut -d= -f2)
        if [ -n "$EXPIRY" ]; then
            EXPIRY_TIMESTAMP=$(date -d "$EXPIRY" +%s 2>/dev/null || echo "0")
            CURRENT_TIMESTAMP=$(date +%s)
            DAYS_LEFT=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
            
            if [ "$DAYS_LEFT" -gt 30 ]; then
                echo -e "   ${GREEN}📅 Expires: $EXPIRY ($DAYS_LEFT days)${NC}"
            elif [ "$DAYS_LEFT" -gt 0 ]; then
                echo -e "   ${YELLOW}⚠️  Expires soon: $EXPIRY ($DAYS_LEFT days)${NC}"
            else
                echo -e "   ${RED}❌ Certificate expired: $EXPIRY${NC}"
            fi
        fi
        
        # Extract issuer
        ISSUER=$(echo "$SSL_INFO" | grep "issuer" | cut -d= -f2-)
        if [ -n "$ISSUER" ]; then
            echo "   🏢 Issuer: $ISSUER"
        fi
    else
        echo -e "${RED}❌ No SSL certificate found or connection failed${NC}"
    fi
    
    echo ""
fi

# Connectivity Check
echo -e "${BLUE}🌐 Checking Connectivity...${NC}"
echo "----------------------------------------"

# HTTP Check
echo -n "HTTP (port 80): "
if curl -s --connect-timeout 10 --max-time 30 -I http://$DOMAIN >/dev/null 2>&1; then
    HTTP_STATUS=$(curl -s --connect-timeout 10 --max-time 30 -I http://$DOMAIN | head -n1 | cut -d' ' -f2)
    echo -e "${GREEN}✅ Connected (Status: $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ Connection failed${NC}"
fi

# HTTPS Check
echo -n "HTTPS (port 443): "
if curl -s --connect-timeout 10 --max-time 30 -I https://$DOMAIN >/dev/null 2>&1; then
    HTTPS_STATUS=$(curl -s --connect-timeout 10 --max-time 30 -I https://$DOMAIN | head -n1 | cut -d' ' -f2)
    echo -e "${GREEN}✅ Connected (Status: $HTTPS_STATUS)${NC}"
else
    echo -e "${RED}❌ Connection failed${NC}"
fi

echo ""

# GitHub Pages Check
if [ "$CHECK_GITHUB_PAGES" = "true" ]; then
    echo -e "${BLUE}📄 Checking GitHub Pages Configuration...${NC}"
    echo "----------------------------------------"
    
    # Check if domain points to GitHub Pages IPs
    GITHUB_IPS=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")
    POINTS_TO_GITHUB=false
    
    for ip in "${GITHUB_IPS[@]}"; do
        if echo "$A_RECORDS" | grep -q "$ip"; then
            POINTS_TO_GITHUB=true
            break
        fi
    done
    
    if [ "$POINTS_TO_GITHUB" = true ]; then
        echo -e "${GREEN}✅ Domain points to GitHub Pages${NC}"
    else
        echo -e "${YELLOW}⚠️  Domain does not point to GitHub Pages IPs${NC}"
        echo "   Expected one of: ${GITHUB_IPS[*]}"
        echo "   Found: $A_RECORDS"
    fi
    
    # Check for GitHub Pages response headers
    echo -n "GitHub Pages headers: "
    if curl -s --connect-timeout 10 --max-time 30 -I https://$DOMAIN 2>/dev/null | grep -i "server.*github" >/dev/null; then
        echo -e "${GREEN}✅ GitHub Pages detected${NC}"
    else
        echo -e "${YELLOW}⚠️  No GitHub Pages headers found${NC}"
    fi
    
    echo ""
fi

# DNS Propagation Check
echo -e "${BLUE}🌍 Checking DNS Propagation...${NC}"
echo "----------------------------------------"

# Check multiple DNS servers
DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222")
for dns_server in "${DNS_SERVERS[@]}"; do
    echo -n "DNS Server $dns_server: "
    REMOTE_A=$(dig @$dns_server +short A $DOMAIN 2>/dev/null || echo "")
    if [ -n "$REMOTE_A" ]; then
        if [ "$REMOTE_A" = "$A_RECORDS" ]; then
            echo -e "${GREEN}✅ Consistent${NC}"
        else
            echo -e "${YELLOW}⚠️  Different result: $REMOTE_A${NC}"
        fi
    else
        echo -e "${RED}❌ No response${NC}"
    fi
done

echo ""

# Summary and Recommendations
echo -e "${BLUE}📋 Summary and Recommendations${NC}"
echo "========================================"

echo ""
echo -e "${BLUE}🔧 Configuration Checklist:${NC}"

if [ -n "$A_RECORDS" ]; then
    echo -e "${GREEN}✅${NC} A records configured"
else
    echo -e "${RED}❌${NC} Configure A records pointing to your hosting provider"
fi

if [ -n "$WWW_CNAME" ] || [ -n "$(dig +short A www.$DOMAIN 2>/dev/null)" ]; then
    echo -e "${GREEN}✅${NC} WWW subdomain configured"
else
    echo -e "${YELLOW}⚠️${NC} Consider configuring www.$DOMAIN (CNAME or A record)"
fi

if [ "$CHECK_SSL" = "true" ] && [ -n "$SSL_INFO" ]; then
    echo -e "${GREEN}✅${NC} SSL certificate installed"
else
    echo -e "${RED}❌${NC} SSL certificate needed"
fi

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"

if [ "$CHECK_GITHUB_PAGES" = "true" ]; then
    echo "• Ensure CNAME file exists in your repository root with content: $DOMAIN"
    echo "• Verify GitHub Pages is enabled in repository settings"
    echo "• Check that custom domain is configured in GitHub Pages settings"
fi

echo "• Update DNS records with your domain registrar if needed"
echo "• Wait 24-48 hours for full DNS propagation"
echo "• Re-run this script to verify changes"

if [ -z "$A_RECORDS" ]; then
    echo ""
    echo -e "${YELLOW}💡 GitHub Pages A records:${NC}"
    for ip in "${GITHUB_IPS[@]}"; do
        echo "   A    $DOMAIN    $ip"
    done
fi

echo ""
echo -e "${BLUE}🔄 Re-run this script with:${NC}"
echo "   ./scripts/dns-verification.sh $DOMAIN"
echo ""
echo -e "${GREEN}✨ DNS verification complete!${NC}"