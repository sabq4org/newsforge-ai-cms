/**
 * Spark Hosting Configuration
 * Configuration file for custom domain setup and hosting options
 */

export default {
  // Application metadata
  app: {
    name: "سبق الذكية - Sabq Althakiyah",
    description: "AI-Powered Arabic News CMS",
    version: "1.0.0",
    language: "ar",
    direction: "rtl"
  },

  // Custom domain configuration
  domains: {
    // Production domain
    production: {
      domain: "sabq.ai",
      subdomain: "www",
      fullDomain: "www.sabq.ai",
      ssl: true,
      redirects: [
        {
          from: "sabq.ai",
          to: "www.sabq.ai",
          statusCode: 301
        }
      ]
    },
    
    // Staging domain
    staging: {
      domain: "staging.sabq.ai",
      ssl: true
    },

    // Alternative domains
    alternatives: [
      "sabqai.com",
      "sabq-ai.com",
      "sabqalthakiyah.com"
    ]
  },

  // Hosting preferences
  hosting: {
    platform: "spark",
    region: "auto", // Let Spark choose optimal region
    scaling: {
      type: "auto",
      minInstances: 1,
      maxInstances: 10
    },
    
    // Performance optimization
    performance: {
      caching: true,
      compression: true,
      minification: true,
      imageOptimization: true
    },

    // Security settings
    security: {
      https: true,
      hsts: true,
      csp: true,
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    }
  },

  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
    target: "es2020",
    
    // Assets optimization
    assets: {
      inlineThreshold: 4096,
      assetsDir: "assets"
    },

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    }
  },

  // Environment variables for different environments
  env: {
    production: {
      NODE_ENV: "production",
      VITE_APP_URL: "https://www.sabq.ai",
      VITE_API_URL: "https://api.sabq.ai"
    },
    staging: {
      NODE_ENV: "staging", 
      VITE_APP_URL: "https://staging.sabq.ai",
      VITE_API_URL: "https://api-staging.sabq.ai"
    }
  },

  // Analytics and monitoring
  analytics: {
    enabled: true,
    provider: "spark-analytics",
    anonymized: true
  },

  // CDN configuration
  cdn: {
    enabled: true,
    regions: ["global"],
    caching: {
      static: "1y",
      dynamic: "1h"
    }
  },

  // Arabic-specific optimizations
  localization: {
    rtl: true,
    fonts: [
      "IBM Plex Sans Arabic",
      "Inter"
    ],
    fallbacks: ["Arial", "sans-serif"]
  }
};