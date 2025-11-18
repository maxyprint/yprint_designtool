/**
 * AntiDetectionService - Genesis v2.0 Advanced Anti-Detection
 *
 * Features:
 * - Dynamic User-Agent Rotation
 * - Intelligent Rate Limiting
 * - Random Delay Patterns
 * - Ethical Scraping Compliance
 */

import UserAgent from 'user-agents';
import { AgentLogger } from '../utils/AgentLogger.js';

export class AntiDetectionService {
  private logger = new AgentLogger('AntiDetectionService');
  private userAgents: string[];
  private lastRequestTime = 0;
  private requestCount = 0;
  private rateLimitWindow = 60000; // 1 minute
  private maxRequestsPerWindow = 30;

  constructor() {
    this.userAgents = this.generateUserAgents();
    this.logger.logAgentDecision('ANTI_DETECTION_INITIALIZED', {
      userAgentCount: this.userAgents.length,
      rateLimit: `${this.maxRequestsPerWindow}/${this.rateLimitWindow/1000}s`
    });
  }

  /**
   * Generate realistic User-Agent strings
   */
  private generateUserAgents(): string[] {
    const baseAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];

    // Add variations
    const variations: string[] = [];
    baseAgents.forEach(agent => {
      variations.push(agent);
      // Add version variations
      variations.push(agent.replace('119.0.0.0', '118.0.0.0'));
      variations.push(agent.replace('119.0.0.0', '120.0.0.0'));
    });

    return variations;
  }

  /**
   * Generate headers with anti-detection measures
   */
  generateHeaders(): Record<string, string> {
    const userAgent = this.getRandomUserAgent();
    const acceptLanguages = ['de-DE,de;q=0.9,en;q=0.8', 'en-US,en;q=0.9', 'de;q=0.9,en-US;q=0.8,en;q=0.7'];
    const acceptEncodings = ['gzip, deflate, br', 'gzip, deflate', 'gzip'];

    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': this.getRandomItem(acceptLanguages),
      'Accept-Encoding': this.getRandomItem(acceptEncodings),
      'DNT': Math.random() > 0.5 ? '1' : '0',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    // Sometimes add referer
    if (Math.random() > 0.7) {
      headers['Referer'] = 'https://www.google.com/';
    }

    this.logger.logAgentDecision('HEADERS_GENERATED', {
      userAgent: userAgent.substring(0, 50) + '...',
      hasReferer: 'Referer' in headers
    });

    return headers;
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    return this.getRandomItem(this.userAgents);
  }

  /**
   * Get random item from array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Apply intelligent random delay
   */
  async applyRandomDelay(): Promise<void> {
    // Check rate limiting
    await this.enforceRateLimit();

    // Apply random delay between requests
    const minDelay = 1000; // 1 second
    const maxDelay = 3000; // 3 seconds
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    this.logger.logAgentDecision('APPLYING_DELAY', {
      delayMs: Math.round(delay),
      timestamp: new Date().toISOString()
    });

    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const currentTime = Date.now();
    
    // Reset counter if window has passed
    if (currentTime - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0;
      this.lastRequestTime = currentTime;
    }

    // Check if we're over the limit
    if (this.requestCount >= this.maxRequestsPerWindow) {
      const waitTime = this.rateLimitWindow - (currentTime - this.lastRequestTime);
      
      this.logger.logAgentDecision('RATE_LIMIT_TRIGGERED', {
        waitTimeMs: waitTime,
        requestCount: this.requestCount,
        limit: this.maxRequestsPerWindow
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset after waiting
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): any {
    const currentTime = Date.now();
    const timeInWindow = currentTime - this.lastRequestTime;
    const remainingRequests = Math.max(0, this.maxRequestsPerWindow - this.requestCount);
    const resetTime = this.lastRequestTime + this.rateLimitWindow;

    return {
      requestCount: this.requestCount,
      maxRequests: this.maxRequestsPerWindow,
      remainingRequests,
      windowMs: this.rateLimitWindow,
      timeInWindowMs: timeInWindow,
      resetTime: new Date(resetTime).toISOString(),
      isLimited: remainingRequests === 0
    };
  }

  /**
   * Generate realistic session fingerprint
   */
  generateSessionFingerprint(): any {
    const screens = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 2560, height: 1440 }
    ];

    const timezones = [
      'Europe/Berlin',
      'Europe/London', 
      'America/New_York',
      'Europe/Paris'
    ];

    const screen = this.getRandomItem(screens);
    
    return {
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: 24
      },
      timezone: this.getRandomItem(timezones),
      language: 'de-DE',
      platform: this.getRandomItem(['MacIntel', 'Win32', 'Linux x86_64']),
      cookieEnabled: true,
      doNotTrack: Math.random() > 0.5 ? '1' : null
    };
  }

  /**
   * Check if IP should be rotated (placeholder for proxy support)
   */
  shouldRotateIP(): boolean {
    // Simple implementation - can be enhanced with proxy support
    return this.requestCount > 0 && this.requestCount % 10 === 0;
  }

  /**
   * Get anti-detection status
   */
  getStatus(): any {
    return {
      userAgentCount: this.userAgents.length,
      rateLimitStatus: this.getRateLimitStatus(),
      lastActivity: new Date(this.lastRequestTime).toISOString(),
      service: 'Genesis v2.0 AntiDetectionService'
    };
  }
}