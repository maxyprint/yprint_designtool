/**
 * DataValidationService - Genesis v2.0 Data Authenticity Validator
 *
 * Features:
 * - 100% Authentic Data Validation
 * - Source Verification
 * - No Mock Data Generation
 * - Multi-Layer Validation Checks
 */

import { z } from 'zod';
import { VintedProduct } from './VintedScrapingEngine.js';
import { AgentLogger } from '../utils/AgentLogger.js';

const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100)
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export class DataValidationService {
  private logger = new AgentLogger('DataValidationService');

  /**
   * Validate array of products for authenticity
   */
  async validateProductData(products: VintedProduct[]): Promise<VintedProduct[]> {
    this.logger.logAgentDecision('VALIDATION_STARTED', {
      totalProducts: products.length,
      timestamp: new Date().toISOString()
    });

    const validatedProducts: VintedProduct[] = [];

    for (const product of products) {
      const validationResult = await this.validateSingleProduct(product);
      validatedProducts.push(validationResult);
    }

    const authenticCount = validatedProducts.filter(p => p.isAuthentic).length;
    
    this.logger.logAgentDecision('VALIDATION_COMPLETED', {
      totalProducts: validatedProducts.length,
      authenticProducts: authenticCount,
      authenticityRate: (authenticCount / validatedProducts.length) * 100
    });

    return validatedProducts;
  }

  /**
   * Validate single product for authenticity
   */
  async validateSingleProduct(product: VintedProduct): Promise<VintedProduct> {
    const validation = this.performValidationChecks(product);
    
    // Genesis v2.0: Strict authenticity requirements
    const isAuthentic = validation.isValid && 
                       validation.confidenceScore >= 80 && 
                       this.hasRequiredData(product);

    if (!isAuthentic) {
      this.logger.logWarning('PRODUCT_VALIDATION_FAILED', {
        productId: product.id,
        errors: validation.errors,
        confidenceScore: validation.confidenceScore
      });
    }

    return {
      ...product,
      isAuthentic
    };
  }

  /**
   * Perform comprehensive validation checks
   */
  private performValidationChecks(product: VintedProduct): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidenceScore = 100;

    // Check required fields
    if (!product.id || product.id.includes('unknown')) {
      errors.push('Invalid or missing product ID');
      confidenceScore -= 30;
    }

    if (!product.title || product.title.trim().length === 0) {
      errors.push('Missing or empty product title');
      confidenceScore -= 20;
    }

    if (!product.url || !this.isValidUrl(product.url)) {
      errors.push('Invalid or missing product URL');
      confidenceScore -= 25;
    }

    // Check data quality
    if (product.likes < 0 || product.views < 0) {
      errors.push('Invalid negative engagement numbers');
      confidenceScore -= 40;
    }

    if (product.likes === 0 && product.views === 0 && product.isAuthentic) {
      warnings.push('Zero engagement - may indicate scraping issues');
      confidenceScore -= 10;
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(product)) {
      warnings.push('Product contains suspicious data patterns');
      confidenceScore -= 15;
    }

    // Validate timestamp
    if (!this.isValidTimestamp(product.scrapedAt)) {
      errors.push('Invalid or missing scraping timestamp');
      confidenceScore -= 10;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidenceScore: Math.max(0, confidenceScore)
    };
  }

  /**
   * Check if product has required data
   */
  private hasRequiredData(product: VintedProduct): boolean {
    return !!(product.id && 
             product.title && 
             product.url && 
             product.scrapedAt);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('vinted.') && 
             urlObj.pathname.includes('/items/');
    } catch {
      return false;
    }
  }

  /**
   * Check for suspicious data patterns
   */
  private hasSuspiciousPatterns(product: VintedProduct): boolean {
    // Check for obviously fake data
    if (product.title.includes('Mock') || 
        product.title.includes('Test') ||
        product.title.includes('Fake')) {
      return true;
    }

    // Check for unrealistic engagement numbers
    if (product.likes > 10000 || product.views > 100000) {
      return true;
    }

    // Check for suspicious ID patterns
    if (product.id.length < 3 || product.id.includes('mock') || product.id.includes('test')) {
      return true;
    }

    return false;
  }

  /**
   * Validate timestamp format
   */
  private isValidTimestamp(timestamp: string): boolean {
    try {
      const date = new Date(timestamp);
      return date instanceof Date && !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Generate validation report
   */
  generateValidationReport(products: VintedProduct[]): any {
    const authentic = products.filter(p => p.isAuthentic);
    const suspicious = products.filter(p => !p.isAuthentic);

    return {
      totalProducts: products.length,
      authenticProducts: authentic.length,
      suspiciousProducts: suspicious.length,
      authenticityRate: products.length > 0 ? (authentic.length / products.length) * 100 : 0,
      timestamp: new Date().toISOString(),
      validator: 'Genesis v2.0 DataValidationService'
    };
  }
}