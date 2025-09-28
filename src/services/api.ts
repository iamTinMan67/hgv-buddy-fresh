import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Company = Tables['companies']['Row'];
type Driver = Tables['drivers']['Row'];
type Vehicle = Tables['vehicles']['Row'];
type Job = Tables['jobs']['Row'];
type ClientContact = Tables['client_contacts']['Row'];
type FuelRecord = Tables['fuel_records']['Row'];

// Generic API response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Generic API service class
export class ApiService {
  // Generic CRUD operations
  static async create<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert']
  ): Promise<ApiResponse<Tables[T]['Row']>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return {
        data: result,
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create record',
        success: false
      };
    }
  }

  static async read<T extends keyof Tables>(
    table: T,
    id: string
  ): Promise<ApiResponse<Tables[T]['Row']>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch record',
        success: false
      };
    }
  }

  static async readAll<T extends keyof Tables>(
    table: T,
    filters?: Record<string, any>
  ): Promise<ApiResponse<Tables[T]['Row'][]>> {
    try {
      let query = supabase.from(table).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch records',
        success: false
      };
    }
  }

  static async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: Tables[T]['Update']
  ): Promise<ApiResponse<Tables[T]['Row']>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: result,
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update record',
        success: false
      };
    }
  }

  static async delete<T extends keyof Tables>(
    table: T,
    id: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: false,
        error: error.message || 'Failed to delete record',
        success: false
      };
    }
  }

  // Search functionality
  static async search<T extends keyof Tables>(
    table: T,
    searchTerm: string,
    searchColumns: string[],
    filters?: Record<string, any>
  ): Promise<ApiResponse<Tables[T]['Row'][]>> {
    try {
      let query = supabase.from(table).select('*');

      // Add search conditions
      if (searchTerm) {
        const searchConditions = searchColumns
          .map(column => `${column}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to search records',
        success: false
      };
    }
  }

  // Pagination
  static async paginate<T extends keyof Tables>(
    table: T,
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<ApiResponse<{
    data: Tables[T]['Row'][];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase.from(table).select('*', { count: 'exact' });

      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: {
          data: data || [],
          total,
          page,
          limit,
          totalPages
        },
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to paginate records',
        success: false
      };
    }
  }
}

// Specific service classes for each entity
export class AuthService {
  static async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: 'admin' | 'driver' | 'owner';
  }): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: userData, error: userError } = await ApiService.create('users', {
          id: authData.user.id,
          email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
        });

        if (userError) throw userError;

        return userData;
      }

      throw new Error('User creation failed');
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to sign up',
        success: false
      };
    }
  }

  static async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if this is a super admin first
        const isSuperAdmin = await this.isSuperAdmin(email);
        
        if (isSuperAdmin) {
          // Return super admin user data
          return {
            data: {
              id: authData.user.id,
              email: authData.user.email || email,
              first_name: 'Super',
              last_name: 'Admin',
              role: 'supa_admin' as any,
              created_at: authData.user.created_at,
              updated_at: authData.user.updated_at || authData.user.created_at,
            },
            error: null,
            success: true
          };
        }

        // Regular user lookup
        const { data: userData, error: userError } = await ApiService.read('users', authData.user.id);

        if (userError) throw userError;

        return userData;
      }

      throw new Error('Sign in failed');
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to sign in',
        success: false
      };
    }
  }

  static async isSuperAdmin(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('email')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  static async signOut(): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error: any) {
      return {
        data: false,
        error: error.message || 'Failed to sign out',
        success: false
      };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (user) {
        const { data: userData, error: userError } = await ApiService.read('users', user.id);

        if (userError) throw userError;

        return userData;
      }

      return {
        data: null,
        error: 'No user found',
        success: false
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to get current user',
        success: false
      };
    }
  }
}

export class CompanyService {
  static async getCompany(): Promise<ApiResponse<Company>> {
    return ApiService.readAll('companies').then(response => {
      if (response.success && response.data && response.data.length > 0) {
        return {
          data: response.data[0],
          error: null,
          success: true
        };
      }
      return {
        data: null,
        error: 'No company found',
        success: false
      };
    });
  }

  static async updateCompany(data: Company['Update']): Promise<ApiResponse<Company>> {
    const companyResponse = await this.getCompany();
    if (companyResponse.success && companyResponse.data) {
      // Company exists, update it
      return ApiService.update('companies', companyResponse.data.id, data);
    } else {
      // No company exists, create a new one
      console.log('No company found, creating new company');
      return ApiService.create('companies', {
        name: data.name || 'Your Company Name',
        logo_url: data.logo_url,
        description: data.description,
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2,
        city: data.city || '',
        postcode: data.postcode || '',
        country: data.country || 'UK',
        phone: data.phone,
        email: data.email,
        website: data.website,
      });
    }
  }

  static async createCompany(data: Company['Insert']): Promise<ApiResponse<Company>> {
    return ApiService.create('companies', data);
  }
}

export class DriverService {
  static async getDrivers(filters?: Record<string, any>): Promise<ApiResponse<Driver[]>> {
    return ApiService.readAll('drivers', filters);
  }

  static async getDriver(id: string): Promise<ApiResponse<Driver>> {
    return ApiService.read('drivers', id);
  }

  static async createDriver(data: Driver['Insert']): Promise<ApiResponse<Driver>> {
    return ApiService.create('drivers', data);
  }

  static async updateDriver(id: string, data: Driver['Update']): Promise<ApiResponse<Driver>> {
    return ApiService.update('drivers', id, data);
  }

  static async deleteDriver(id: string): Promise<ApiResponse<boolean>> {
    return ApiService.delete('drivers', id);
  }

  static async searchDrivers(searchTerm: string): Promise<ApiResponse<Driver[]>> {
    return ApiService.search('drivers', searchTerm, ['first_name', 'last_name', 'email', 'employee_id']);
  }
}

export class VehicleService {
  static async getVehicles(filters?: Record<string, any>): Promise<ApiResponse<Vehicle[]>> {
    return ApiService.readAll('vehicles', filters);
  }

  static async getVehicle(id: string): Promise<ApiResponse<Vehicle>> {
    return ApiService.read('vehicles', id);
  }

  static async createVehicle(data: Vehicle['Insert']): Promise<ApiResponse<Vehicle>> {
    return ApiService.create('vehicles', data);
  }

  static async updateVehicle(id: string, data: Vehicle['Update']): Promise<ApiResponse<Vehicle>> {
    return ApiService.update('vehicles', id, data);
  }

  static async deleteVehicle(id: string): Promise<ApiResponse<boolean>> {
    return ApiService.delete('vehicles', id);
  }
}

export class JobService {
  static async getJobs(filters?: Record<string, any>): Promise<ApiResponse<Job[]>> {
    return ApiService.readAll('jobs', filters);
  }

  static async getJob(id: string): Promise<ApiResponse<Job>> {
    return ApiService.read('jobs', id);
  }

  static async createJob(data: Job['Insert']): Promise<ApiResponse<Job>> {
    return ApiService.create('jobs', data);
  }

  static async updateJob(id: string, data: Job['Update']): Promise<ApiResponse<Job>> {
    return ApiService.update('jobs', id, data);
  }

  static async deleteJob(id: string): Promise<ApiResponse<boolean>> {
    return ApiService.delete('jobs', id);
  }

  static async getJobsByDriver(driverId: string): Promise<ApiResponse<Job[]>> {
    return ApiService.readAll('jobs', { assigned_driver_id: driverId });
  }

  static async getJobsByVehicle(vehicleId: string): Promise<ApiResponse<Job[]>> {
    return ApiService.readAll('jobs', { assigned_vehicle_id: vehicleId });
  }
}

export class ClientContactService {
  static async getContacts(filters?: Record<string, any>): Promise<ApiResponse<ClientContact[]>> {
    return ApiService.readAll('client_contacts', filters);
  }

  static async getContact(id: string): Promise<ApiResponse<ClientContact>> {
    return ApiService.read('client_contacts', id);
  }

  static async createContact(data: ClientContact['Insert']): Promise<ApiResponse<ClientContact>> {
    return ApiService.create('client_contacts', data);
  }

  static async updateContact(id: string, data: ClientContact['Update']): Promise<ApiResponse<ClientContact>> {
    return ApiService.update('client_contacts', id, data);
  }

  static async deleteContact(id: string): Promise<ApiResponse<boolean>> {
    return ApiService.delete('client_contacts', id);
  }

  static async searchContacts(searchTerm: string): Promise<ApiResponse<ClientContact[]>> {
    return ApiService.search('client_contacts', searchTerm, ['name', 'company', 'email']);
  }
}

export class FuelRecordService {
  static async getFuelRecords(filters?: Record<string, any>): Promise<ApiResponse<FuelRecord[]>> {
    return ApiService.readAll('fuel_records', filters);
  }

  static async getFuelRecord(id: string): Promise<ApiResponse<FuelRecord>> {
    return ApiService.read('fuel_records', id);
  }

  static async createFuelRecord(data: FuelRecord['Insert']): Promise<ApiResponse<FuelRecord>> {
    return ApiService.create('fuel_records', data);
  }

  static async updateFuelRecord(id: string, data: FuelRecord['Update']): Promise<ApiResponse<FuelRecord>> {
    return ApiService.update('fuel_records', id, data);
  }

  static async deleteFuelRecord(id: string): Promise<ApiResponse<boolean>> {
    return ApiService.delete('fuel_records', id);
  }

  static async getFuelRecordsByDriver(driverId: string): Promise<ApiResponse<FuelRecord[]>> {
    return ApiService.readAll('fuel_records', { driver_id: driverId });
  }

  static async getFuelRecordsByVehicle(vehicleId: string): Promise<ApiResponse<FuelRecord[]>> {
    return ApiService.readAll('fuel_records', { vehicle_id: vehicleId });
  }
}
