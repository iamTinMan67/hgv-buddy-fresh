/**
 * Trailer ID Generator Utility
 * 
 * This utility provides functions for generating unique Trailer IDs.
 * Currently uses localStorage for tracking existing IDs, but is designed
 * to be easily replaced with database calls when needed.
 */

export interface TrailerIdGenerator {
  generateTrailerId(): Promise<string>;
  validateTrailerId(trailerId: string): boolean;
  getExistingTrailerIds(): Promise<string[]>;
}

class LocalStorageTrailerIdGenerator implements TrailerIdGenerator {
  private readonly STORAGE_KEY = 'existingTrailerIds';

  /**
   * Generates a unique Trailer ID in the format TRL-YYYY-NNN
   * where YYYY is the current year and NNN is a 3-digit sequential number
   */
  async generateTrailerId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const existingTrailerIds = await this.getExistingTrailerIds();
    
    // Find the highest trailer number for the current year
    const currentYearTrailers = existingTrailerIds.filter(id => id.startsWith(`TRL-${currentYear}-`));
    let maxNumber = 0;
    
    currentYearTrailers.forEach(trailerId => {
      const match = trailerId.match(new RegExp(`TRL-${currentYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const newTrailerId = `TRL-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Store the new Trailer ID to maintain uniqueness
    existingTrailerIds.push(newTrailerId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTrailerIds));
    
    return newTrailerId;
  }

  /**
   * Validates if a Trailer ID follows the correct format
   */
  validateTrailerId(trailerId: string): boolean {
    const pattern = /^TRL-\d{4}-\d{3}$/;
    return pattern.test(trailerId);
  }

  /**
   * Retrieves all existing Trailer IDs from storage
   */
  async getExistingTrailerIds(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error retrieving existing trailer IDs:', error);
      return [];
    }
  }

  /**
   * Clears all stored Trailer IDs (useful for testing or reset)
   */
  clearAllTrailerIds(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Gets the next available Trailer ID without storing it
   * Useful for preview or validation purposes
   */
  async getNextTrailerId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const existingTrailerIds = await this.getExistingTrailerIds();
    
    const currentYearTrailers = existingTrailerIds.filter(id => id.startsWith(`TRL-${currentYear}-`));
    let maxNumber = 0;
    
    currentYearTrailers.forEach(trailerId => {
      const match = trailerId.match(new RegExp(`TRL-${currentYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `TRL-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Extracts the year from a Trailer ID
   */
  extractYearFromTrailerId(trailerId: string): number | null {
    const match = trailerId.match(/^TRL-(\d{4})-\d{3}$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }
}

// Export singleton instance
export const trailerIdGenerator = new LocalStorageTrailerIdGenerator();

