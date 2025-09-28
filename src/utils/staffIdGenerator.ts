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
   * Generates a unique Staff ID in the format EMP-YYYY-MM-001
   * where YYYY is the start date year, MM is the month, and 001 is a 3-digit sequential number
   */
  async generateStaffId(startDate: string): Promise<string> {
    const startDateObj = new Date(startDate);
    const startYear = startDateObj.getFullYear();
    const startMonth = (startDateObj.getMonth() + 1).toString().padStart(2, '0');
    const existingStaffIds = await this.getExistingStaffIds();
    
    // Find the highest staff number for the start year and month
    const yearMonthPrefix = `EMP-${startYear}-${startMonth}-`;
    const yearMonthStaff = existingStaffIds.filter(id => id.startsWith(yearMonthPrefix));
    let maxNumber = 0;
    
    yearMonthStaff.forEach(staffId => {
      const match = staffId.match(new RegExp(`EMP-${startYear}-${startMonth}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const newStaffId = `EMP-${startYear}-${startMonth}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Store the new Staff ID to maintain uniqueness
    existingStaffIds.push(newStaffId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingStaffIds));
    
    return newStaffId;
  }

  /**
   * Validates if a Staff ID follows the correct format
   */
  validateStaffId(staffId: string): boolean {
    const pattern = /^EMP-\d{4}-\d{2}-\d{3}$/;
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
   * Clears all staff IDs and resets the system for fresh start
   * This should be called when migrating to new ID format
   */
  async resetStaffIdSystem(): Promise<void> {
    // Clear localStorage
    this.clearAllStaffIds();
    
    // If you have Supabase integration, you could also clear the database here
    // For now, we'll just clear localStorage
    console.log('Staff ID system reset - ready for new EMP-YYYY-MM-001 format');
  }

  /**
   * Gets the next available Staff ID without storing it
   * Useful for preview or validation purposes
   */
  async getNextStaffId(startDate: string): Promise<string> {
    const startDateObj = new Date(startDate);
    const startYear = startDateObj.getFullYear();
    const startMonth = (startDateObj.getMonth() + 1).toString().padStart(2, '0');
    const existingStaffIds = await this.getExistingStaffIds();
    
    const yearMonthPrefix = `EMP-${startYear}-${startMonth}-`;
    const yearMonthStaff = existingStaffIds.filter(id => id.startsWith(yearMonthPrefix));
    let maxNumber = 0;
    
    yearMonthStaff.forEach(staffId => {
      const match = staffId.match(new RegExp(`EMP-${startYear}-${startMonth}-(\\d+)`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `EMP-${startYear}-${startMonth}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Extracts the year from a Staff ID
   */
  extractYearFromStaffId(staffId: string): number | null {
    const match = staffId.match(/^EMP-(\d{4})-\d{2}-\d{3}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Extracts the month from a Staff ID
   */
  extractMonthFromStaffId(staffId: string): number | null {
    const match = staffId.match(/^EMP-\d{4}-(\d{2})-\d{3}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Extracts the sequence number from a Staff ID
   */
  extractSequenceFromStaffId(staffId: string): number | null {
    const match = staffId.match(/^EMP-\d{4}-\d{2}-(\d{3})$/);
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
