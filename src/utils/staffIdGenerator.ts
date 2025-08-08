/**
 * Staff ID Generator Utility
 * 
 * This utility provides functions for generating unique Staff IDs.
 * Currently uses localStorage for tracking existing IDs, but is designed
 * to be easily replaced with database calls when needed.
 */

export interface StaffIdGenerator {
  generateStaffId(startDate: string): Promise<string>;
  validateStaffId(staffId: string): boolean;
  getExistingStaffIds(): Promise<string[]>;
}

class LocalStorageStaffIdGenerator implements StaffIdGenerator {
  private readonly STORAGE_KEY = 'existingStaffIds';

  /**
   * Generates a unique Staff ID in the format EMP-YYYY-NNN
   * where YYYY is the start date year and NNN is a 3-digit sequential number
   */
  async generateStaffId(startDate: string): Promise<string> {
    const startYear = new Date(startDate).getFullYear();
    const existingStaffIds = await this.getExistingStaffIds();
    
    // Find the highest staff number for the start year
    const startYearStaff = existingStaffIds.filter(id => id.startsWith(`EMP-${startYear}-`));
    let maxNumber = 0;
    
    startYearStaff.forEach(staffId => {
      const match = staffId.match(new RegExp(`EMP-${startYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const newStaffId = `EMP-${startYear}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Store the new Staff ID to maintain uniqueness
    existingStaffIds.push(newStaffId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingStaffIds));
    
    return newStaffId;
  }

  /**
   * Validates if a Staff ID follows the correct format
   */
  validateStaffId(staffId: string): boolean {
    const pattern = /^EMP-\d{4}-\d{3}$/;
    return pattern.test(staffId);
  }

  /**
   * Retrieves all existing Staff IDs from storage
   */
  async getExistingStaffIds(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving existing Staff IDs:', error);
      return [];
    }
  }

  /**
   * Clears all stored Staff IDs (useful for testing or reset)
   */
  clearAllStaffIds(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Gets the next available Staff ID without storing it
   * Useful for preview or validation purposes
   */
  async getNextStaffId(startDate: string): Promise<string> {
    const startYear = new Date(startDate).getFullYear();
    const existingStaffIds = await this.getExistingStaffIds();
    
    const startYearStaff = existingStaffIds.filter(id => id.startsWith(`EMP-${startYear}-`));
    let maxNumber = 0;
    
    startYearStaff.forEach(staffId => {
      const match = staffId.match(new RegExp(`EMP-${startYear}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `EMP-${startYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Extracts the year from a Staff ID
   */
  extractYearFromStaffId(staffId: string): number | null {
    const match = staffId.match(/^EMP-(\d{4})-\d{3}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Extracts the sequence number from a Staff ID
   */
  extractSequenceFromStaffId(staffId: string): number | null {
    const match = staffId.match(/^EMP-\d{4}-(\d{3})$/);
    return match ? parseInt(match[1], 10) : null;
  }
}

// Export the default instance
export const staffIdGenerator = new LocalStorageStaffIdGenerator();

// Export the class for testing or custom implementations
export { LocalStorageStaffIdGenerator };

/**
 * Database-ready Staff ID Generator (for future use)
 * 
 * Example implementation for when you integrate with a database:
 * 
 * class DatabaseStaffIdGenerator implements StaffIdGenerator {
 *   async generateStaffId(startDate: string): Promise<string> {
 *     // Query database for max staff number for start year
 *     // Use database transaction to ensure uniqueness
 *     // Return generated ID
 *   }
 *   
 *   async getExistingStaffIds(): Promise<string[]> {
 *     // Query database for all staff IDs
 *   }
 *   
 *   validateStaffId(staffId: string): boolean {
 *     // Same validation logic
 *   }
 * }
 */
