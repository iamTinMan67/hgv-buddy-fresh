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
      // First, try to authenticate against app_users table (database)
      const dbResult = await this.authenticateFromDatabase(credentials);
      if (dbResult.success) {
        return dbResult;
      }

      // Fallback to localStorage for backward compatibility
      const localResult = await this.authenticateFromLocalStorage(credentials);
      if (localResult.success) {
        return localResult;
      }

      return {
        success: false,
        error: 'Invalid username or password.'
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
   * Authenticate against app_users table in database
   */
  private async authenticateFromDatabase(credentials: StaffCredentials): Promise<StaffAuthResult> {
    try {
      // Import supabase client dynamically to avoid circular imports
      const { supabase } = await import('../lib/supabase');
      
      console.log('🔍 Checking database for user:', credentials.username);
      
      // Try to find user by username first, then by email
      let { data: appUsers, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single();

      // If not found by username, try by email
      if (error || !appUsers) {
        console.log('🔍 User not found by username, trying email...');
        const emailResult = await supabase
          .from('app_users')
          .select('*')
          .eq('email', credentials.username)
          .eq('is_active', true)
          .single();
        
        appUsers = emailResult.data;
        error = emailResult.error;
      }

      if (error || !appUsers) {
        console.log('❌ User not found in database:', error);
        return {
          success: false,
          error: 'User not found in database.'
        };
      }

      console.log('✅ User found in database:', appUsers);

      // Check password (in production, you should hash passwords)
      if (appUsers.password_hash !== credentials.password) {
        console.log('❌ Password mismatch');
        return {
          success: false,
          error: 'Invalid password.'
        };
      }

      console.log('✅ Password verified');

      return {
        success: true,
        staff: {
          id: appUsers.id,
          staffId: appUsers.username || appUsers.email, // Use username or email as staffId
          firstName: appUsers.first_name,
          lastName: appUsers.last_name,
          role: appUsers.role as 'manager' | 'admin' | 'driver',
          isActive: appUsers.is_active
        }
      };

    } catch (error) {
      console.error('Database authentication error:', error);
      return {
        success: false,
        error: 'Database authentication failed.'
      };
    }
  }

  /**
   * Authenticate against localStorage (backward compatibility)
   */
  private async authenticateFromLocalStorage(credentials: StaffCredentials): Promise<StaffAuthResult> {
    try {
      const staffData = localStorage.getItem(this.STORAGE_KEY);
      if (!staffData) {
        return {
          success: false,
          error: 'No staff members found in local storage.'
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

      // Check password
      if (staff.password !== credentials.password) {
        return {
          success: false,
          error: 'Invalid password.'
        };
      }

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
      console.error('LocalStorage authentication error:', error);
      return {
        success: false,
        error: 'LocalStorage authentication failed.'
      };
    }
  }

  /**
   * Check if a username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      // Check database first
      const { supabase } = await import('../lib/supabase');
      const { data: dbUser, error: dbError } = await supabase
        .from('app_users')
        .select('username')
        .eq('username', username)
        .single();

      if (!dbError && dbUser) {
        return true;
      }

      // Check localStorage as fallback
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
