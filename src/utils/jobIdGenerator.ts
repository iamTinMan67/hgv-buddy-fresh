/**
 * Job ID Generator Utility
 * 
 * This utility provides functions for generating unique Job IDs.
 * Currently uses localStorage for tracking existing IDs, but is designed
 * to be easily replaced with database calls when needed.
 */

export interface JobIdGenerator {
  generateJobId(): Promise<string>;
  validateJobId(jobId: string): boolean;
  getExistingJobIds(): Promise<string[]>;
}

class LocalStorageJobIdGenerator implements JobIdGenerator {
  private readonly STORAGE_KEY = 'existingJobIds';

  /**
   * Generates a unique Job ID in the format JOB-YYYY-NNN
   * where YYYY is the current year and NNN is a 3-digit sequential number
   */
  async generateJobId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const existingJobIds = await this.getExistingJobIds();
    
    // Find the highest job number for the current year
    const currentYearJobs = existingJobIds.filter(id => id.startsWith(`JOB-${currentYear}-`));
    let maxNumber = 0;
    
    currentYearJobs.forEach(jobId => {
      const match = jobId.match(new RegExp(`JOB-${currentYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const newJobId = `JOB-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Store the new Job ID to maintain uniqueness
    existingJobIds.push(newJobId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingJobIds));
    
    return newJobId;
  }

  /**
   * Validates if a Job ID follows the correct format
   */
  validateJobId(jobId: string): boolean {
    const pattern = /^JOB-\d{4}-\d{3}$/;
    return pattern.test(jobId);
  }

  /**
   * Retrieves all existing Job IDs from storage
   */
  async getExistingJobIds(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving existing Job IDs:', error);
      return [];
    }
  }

  /**
   * Clears all stored Job IDs (useful for testing or reset)
   */
  clearAllJobIds(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Gets the next available Job ID without storing it
   * Useful for preview or validation purposes
   */
  async getNextJobId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const existingJobIds = await this.getExistingJobIds();
    
    const currentYearJobs = existingJobIds.filter(id => id.startsWith(`JOB-${currentYear}-`));
    let maxNumber = 0;
    
    currentYearJobs.forEach(jobId => {
      const match = jobId.match(new RegExp(`JOB-${currentYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `JOB-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }
}

// Export the default instance
export const jobIdGenerator = new LocalStorageJobIdGenerator();

// Export the class for testing or custom implementations
export { LocalStorageJobIdGenerator };

/**
 * Database-ready Job ID Generator (for future use)
 * 
 * Example implementation for when you integrate with a database:
 * 
 * class DatabaseJobIdGenerator implements JobIdGenerator {
 *   async generateJobId(): Promise<string> {
 *     // Query database for max job number for current year
 *     // Use database transaction to ensure uniqueness
 *     // Return generated ID
 *   }
 *   
 *   async getExistingJobIds(): Promise<string[]> {
 *     // Query database for all job IDs
 *   }
 *   
 *   validateJobId(jobId: string): boolean {
 *     // Same validation logic
 *   }
 * }
 */
