/**
 * Staff Authentication Service
 * 
 * This service handles authentication against staff credentials
 * stored in the staff management system.
 */

export interface StaffCredentials {
  username: string;
  password: string;
}

export interface StaffAuthResult {
  success: boolean;
  staff?: {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    role: 'manager' | 'admin' | 'driver';
    isActive: boolean;
  };
  error?: string;
}

class StaffAuthService {
  private readonly STORAGE_KEY = 'staffMembers';

  /**
   * Authenticate staff member using username and password
   */
  async authenticate(credentials: StaffCredentials): Promise<StaffAuthResult> {
    try {
      // Get staff members from localStorage (in a real app, this would be a database call)
      const staffData = localStorage.getItem(this.STORAGE_KEY);
      if (!staffData) {
        return {
          success: false,
          error: 'No staff members found. Please contact administrator.'
        };
      }

      const staffMembers = JSON.parse(staffData);
      
      // Find staff member by username
      const staff = staffMembers.find((member: any) => 
        member.username === credentials.username && 
        member.isActive === true
      );

      if (!staff) {
        return {
          success: false,
          error: 'Invalid username or account is inactive.'
        };
      }

      // Check password (in a real app, passwords should be hashed)
      if (staff.password !== credentials.password) {
        return {
          success: false,
          error: 'Invalid password.'
        };
      }

      // Return successful authentication
      return {
        success: true,
        staff: {
          id: staff.id,
          staffId: staff.staffId,
          firstName: staff.firstName,
          lastName: staff.familyName,
          role: staff.role,
          isActive: staff.isActive
        }
      };

    } catch (error) {
      console.error('Staff authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  }

  /**
   * Check if a username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const staffData = localStorage.getItem(this.STORAGE_KEY);
      if (!staffData) return false;

      const staffMembers = JSON.parse(staffData);
      return staffMembers.some((member: any) => member.username === username);
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  /**
   * Get all staff members (for admin purposes)
   */
  async getAllStaff(): Promise<any[]> {
    try {
      const staffData = localStorage.getItem(this.STORAGE_KEY);
      return staffData ? JSON.parse(staffData) : [];
    } catch (error) {
      console.error('Error getting staff members:', error);
      return [];
    }
  }
}

// Export singleton instance
export const staffAuthService = new StaffAuthService();
