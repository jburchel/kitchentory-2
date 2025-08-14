/**
 * Sitemap Generator Script
 * Generates sitemap.xml for SEO optimization
 */

const fs = require('fs')
const path = require('path')

// Configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchentory.app'
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml')

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { url: '', priority: 1.0, changefreq: 'daily' }, // Home page
  { url: '/inventory', priority: 0.9, changefreq: 'daily' },
  { url: '/shopping', priority: 0.9, changefreq: 'daily' },
  { url: '/recipes', priority: 0.8, changefreq: 'weekly' },
  { url: '/alerts', priority: 0.8, changefreq: 'daily' },
  { url: '/analytics', priority: 0.7, changefreq: 'weekly' },
  { url: '/settings', priority: 0.6, changefreq: 'monthly' },
  { url: '/profile', priority: 0.6, changefreq: 'monthly' },
  { url: '/help', priority: 0.5, changefreq: 'monthly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/privacy', priority: 0.4, changefreq: 'yearly' },
  { url: '/terms', priority: 0.4, changefreq: 'yearly' },
]

// Generate URL entry for sitemap
function generateUrlEntry(route) {
  const url = `${SITE_URL}${route.url}`
  const lastmod = new Date().toISOString().split('T')[0]
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
}

// Generate complete sitemap XML
function generateSitemap() {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  const footer = `</urlset>`

  const urls = staticRoutes.map(generateUrlEntry).join('\n')

  return `${header}\n${urls}\n${footer}`
}

// Generate robots.txt content
function generateRobotsTxt() {
  return `# Robots.txt for Kitchentory
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Block sensitive areas
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# SEO optimization
Crawl-delay: 1

# Block specific bots if needed
# User-agent: BadBot
# Disallow: /
`
}

// Main execution
async function main() {
  try {
    console.log('Generating sitemap.xml...')
    
    // Generate sitemap
    const sitemapContent = generateSitemap()
    fs.writeFileSync(OUTPUT_PATH, sitemapContent, 'utf8')
    console.log(`✅ Sitemap generated at: ${OUTPUT_PATH}`)
    
    // Generate robots.txt
    const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt')
    const robotsContent = generateRobotsTxt()
    fs.writeFileSync(robotsPath, robotsContent, 'utf8')
    console.log(`✅ Robots.txt generated at: ${robotsPath}`)
    
    // Display summary
    console.log('\n📊 Sitemap Summary:')
    console.log(`- Total URLs: ${staticRoutes.length}`)
    console.log(`- Site URL: ${SITE_URL}`)
    console.log(`- Generated at: ${new Date().toISOString()}`)
    
    console.log('\n🔍 Route breakdown:')
    staticRoutes.forEach(route => {
      console.log(`  ${SITE_URL}${route.url} (${route.priority}, ${route.changefreq})`)
    })
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  staticRoutes,
}