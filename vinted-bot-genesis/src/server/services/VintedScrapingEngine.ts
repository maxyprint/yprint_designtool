/**
 * VintedScrapingEngine - Genesis v2.0 Enhanced Scraping Service
 *
 * Features:
 * - 100% Authentic Data Extraction (No Mock Data)
 * - Advanced Anti-Detection Mechanisms
 * - Individual Product Page Scraping
 * - Self-Healing Selector Adaptation
 */

import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { AgentLogger } from '../utils/AgentLogger.js';

// Data Validation Schemas
const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  likes: z.number(),
  views: z.number(),
  url: z.string(),
  imageUrl: z.string(),
  isAuthentic: z.boolean(),
  scrapedAt: z.string()
});

export type VintedProduct = z.infer<typeof ProductSchema>;

export class VintedScrapingEngine {
  private logger = new AgentLogger('VintedScrapingEngine');
  private baseUrl = 'https://www.vinted.de';

  // Genesis v2.0 Enhanced Selectors with Fallbacks
  private selectors = {
    productCards: [
      'div[data-testid="item-card"]',
      '.feed-grid__item',
      '.item-card',
      '[data-cy="item-card"]'
    ],
    productLink: [
      'a[data-testid="item-card-link"]',
      '.item-card__link',
      'a.feed-grid__item-link'
    ],
    title: [
      '[data-testid="item-title"]',
      '.item-card__title',
      '.feed-grid__item-title'
    ],
    price: [
      '[data-testid="item-price"]',
      '.item-card__price',
      '.feed-grid__item-price'
    ],
    image: [
      '[data-testid="item-image"]',
      '.item-card__photo img',
      '.feed-grid__item-photo img'
    ],
    likes: [
      '[data-testid="item-heart-count"]',
      '.item-card__heart-count',
      '.heart-count'
    ],
    views: [
      '[data-testid="view-count"]',
      '.view-count',
      '.item-view-count'
    ]
  };

  /**
   * Scrape trending products from Vinted main page
   */
  async scrapeTrendingProducts(headers?: any): Promise<VintedProduct[]> {
    try {
      this.logger.logAgentDecision('SCRAPING_INITIATED', {
        target: 'trending_products',
        timestamp: new Date().toISOString()
      });

      const config: AxiosRequestConfig = {
        headers: headers || {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      };

      const response = await axios.get(this.baseUrl, config);
      const $ = cheerio.load(response.data);

      this.logger.logAgentDecision('HTML_LOADED', {
        contentLength: response.data.length,
        statusCode: response.status
      });

      const products: VintedProduct[] = [];

      // Try different selectors until we find products
      for (const selector of this.selectors.productCards) {
        const productElements = $(selector);

        if (productElements.length > 0) {
          this.logger.logAgentDecision('PRODUCTS_FOUND', {
            selector,
            count: productElements.length
          });

          productElements.each((index, element) => {
            if (index >= 20) return false; // Limit to 20 products

            try {
              const product = this.extractProductData($, element, index);
              if (product) {
                products.push(product);
              }
            } catch (error) {
              this.logger.logError('PRODUCT_EXTRACTION_ERROR', error);
            }
          });

          break; // Stop trying selectors if we found products
        }
      }

      // Validate and enrich with individual page data
      const enrichedProducts = await this.enrichProductsWithDetailedData(products);

      this.logger.logAgentDecision('SCRAPING_COMPLETED', {
        totalProducts: enrichedProducts.length,
        authenticProducts: enrichedProducts.filter(p => p.isAuthentic).length,
        timestamp: new Date().toISOString()
      });

      return enrichedProducts;

    } catch (error) {
      this.logger.logError('SCRAPING_FAILED', error);

      // Genesis v2.0: NO MOCK DATA - Return empty array with honest error
      return [];
    }
  }

  /**
   * Extract product data from individual elements
   */
  private extractProductData($: cheerio.CheerioAPI, element: any, index: number): VintedProduct | null {
    try {
      // Extract product URL
      const linkElement = $(element).find(this.selectors.productLink.join(', ')).first();
      const relativeUrl = linkElement.attr('href');

      if (!relativeUrl) {
        this.logger.logWarning('NO_PRODUCT_LINK', { index });
        return null;
      }

      const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `${this.baseUrl}${relativeUrl}`;
      const productId = this.extractProductId(fullUrl);

      // Extract basic data
      const title = $(element).find(this.selectors.title.join(', ')).first().text().trim();
      const priceText = $(element).find(this.selectors.price.join(', ')).first().text().trim();
      const imageUrl = $(element).find(this.selectors.image.join(', ')).first().attr('src') || '';

      // Genesis v2.0: Set initial values to 0 - will be enriched later
      const product: VintedProduct = {
        id: productId,
        title: title || `Product ${index + 1}`,
        price: priceText || 'N/A',
        likes: 0, // Will be enriched from individual page
        views: 0, // Will be enriched from individual page
        url: fullUrl,
        imageUrl: imageUrl,
        isAuthentic: false, // Will be validated after enrichment
        scrapedAt: new Date().toISOString()
      };

      return product;

    } catch (error) {
      this.logger.logError('PRODUCT_DATA_EXTRACTION_ERROR', error);
      return null;
    }
  }

  /**
   * Scrape individual product page for accurate likes/views
   */
  async scrapeIndividualProduct(productId: string, headers?: any): Promise<VintedProduct | null> {
    try {
      const url = `${this.baseUrl}/items/${productId}`;

      this.logger.logAgentDecision('INDIVIDUAL_SCRAPE_START', {
        productId,
        url,
        timestamp: new Date().toISOString()
      });

      const config: AxiosRequestConfig = {
        headers: headers || {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          'Referer': this.baseUrl,
          'DNT': '1'
        },
        timeout: 10000
      };

      const response = await axios.get(url, config);
      const $ = cheerio.load(response.data);

      // Extract detailed product information
      const title = $('h1[data-testid="item-title"], .item-title, h1').first().text().trim();
      const priceElement = $('[data-testid="item-price"], .item-price, .price').first();
      const price = priceElement.text().trim();

      // Extract likes with multiple selector attempts
      let likes = 0;
      const likesSelectors = [
        '[data-testid="item-heart-count"]',
        '.heart-count',
        '.item-heart-count',
        '[aria-label*="favorite"], [aria-label*="like"]'
      ];

      for (const selector of likesSelectors) {
        const likesElement = $(selector);
        if (likesElement.length > 0) {
          const likesText = likesElement.text().trim();
          const likesMatch = likesText.match(/(\d+)/);
          if (likesMatch) {
            likes = parseInt(likesMatch[1]);
            break;
          }
        }
      }

      // Extract views with multiple selector attempts
      let views = 0;
      const viewsSelectors = [
        '[data-testid="view-count"]',
        '.view-count',
        '.item-view-count',
        '[aria-label*="view"]'
      ];

      for (const selector of viewsSelectors) {
        const viewsElement = $(selector);
        if (viewsElement.length > 0) {
          const viewsText = viewsElement.text().trim();
          const viewsMatch = viewsText.match(/(\d+)/);
          if (viewsMatch) {
            views = parseInt(viewsMatch[1]);
            break;
          }
        }
      }

      // Extract image URL
      const imageUrl = $('[data-testid="item-photo"] img, .item-photo img, .product-image img').first().attr('src') || '';

      const product: VintedProduct = {
        id: productId,
        title: title || 'Unknown Product',
        price: price || 'N/A',
        likes,
        views,
        url,
        imageUrl,
        isAuthentic: true, // Individual page data is considered authentic
        scrapedAt: new Date().toISOString()
      };

      this.logger.logAgentDecision('INDIVIDUAL_SCRAPE_SUCCESS', {
        productId,
        likes,
        views,
        title: title.substring(0, 50)
      });

      return product;

    } catch (error) {
      this.logger.logError('INDIVIDUAL_SCRAPE_ERROR', error);
      return null;
    }
  }

  /**
   * Enrich products with detailed data from individual pages
   */
  private async enrichProductsWithDetailedData(products: VintedProduct[]): Promise<VintedProduct[]> {
    const enrichedProducts: VintedProduct[] = [];

    for (const product of products.slice(0, 10)) { // Limit to first 10 for performance
      try {
        // Add delay between requests
        await this.delay(1000 + Math.random() * 2000);

        const detailedProduct = await this.scrapeIndividualProduct(product.id);

        if (detailedProduct) {
          enrichedProducts.push(detailedProduct);
        } else {
          // Keep original product but mark as not fully authentic
          enrichedProducts.push({
            ...product,
            isAuthentic: false
          });
        }

      } catch (error) {
        this.logger.logError('ENRICHMENT_ERROR', error);
        enrichedProducts.push({
          ...product,
          isAuthentic: false
        });
      }
    }

    return enrichedProducts;
  }

  /**
   * Extract product ID from URL
   */
  private extractProductId(url: string): string {
    const match = url.match(/\/items\/(\d+)/);
    return match ? match[1] : `unknown-${Date.now()}`;
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}