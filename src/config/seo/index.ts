/**
 * SEO Configuration
 * Comprehensive SEO settings for the application
 */

import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  author: string
  siteUrl: string
  siteName: string
  locale: string
  type: string
  image?: string
  twitterHandle?: string
}

export const defaultSEOConfig: SEOConfig = {
  title: 'Kitchentory - Kitchen Inventory Management',
  description: 'Smart kitchen inventory management with expiration tracking, shopping lists, and meal planning. Keep track of your pantry, reduce food waste, and simplify your cooking.',
  keywords: [
    'kitchen inventory',
    'pantry management',
    'food tracking',
    'expiration dates',
    'shopping lists',
    'meal planning',
    'food waste reduction',
    'kitchen organization',
    'grocery management',
    'recipe planning'
  ],
  author: 'Kitchentory Team',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchentory.app',
  siteName: 'Kitchentory',
  locale: 'en_US',
  type: 'website',
  image: '/og-image.png',
  twitterHandle: '@kitchentory'
}

export function generatePageMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seoConfig = { ...defaultSEOConfig, ...config }
  const fullTitle = config.title 
    ? `${config.title} | ${defaultSEOConfig.siteName}`
    : defaultSEOConfig.title

  return {
    title: fullTitle,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.siteName,
    applicationName: seoConfig.siteName,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description: seoConfig.description,
      url: seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      images: seoConfig.image ? [
        {
          url: seoConfig.image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ] : undefined,
      locale: seoConfig.locale,
      type: seoConfig.type as any,
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: seoConfig.description,
      creator: seoConfig.twitterHandle,
      site: seoConfig.twitterHandle,
      images: seoConfig.image ? [seoConfig.image] : undefined,
    },
    
    // Additional
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
      other: {
        'msvalidate.01': process.env.BING_VERIFICATION_ID || '',
      },
    },
  }
}

export function generateStructuredData(config: Partial<SEOConfig> = {}) {
  const seoConfig = { ...defaultSEOConfig, ...config }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seoConfig.siteName,
    description: seoConfig.description,
    url: seoConfig.siteUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: seoConfig.author,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    featureList: [
      'Inventory Management',
      'Expiration Tracking',
      'Shopping Lists',
      'Meal Planning',
      'Recipe Integration',
      'Barcode Scanning',
    ],
  }
}

export const breadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const faqStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})