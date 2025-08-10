import axios from 'axios';
import {
  DriverVehicleAllocation,
  AllocationSchedule,
  ManifestDetails,
  JobConsignmentDetails,
  VehicleAllocationDetails,
  DriverAllocationSummary,
  AllocationOverlap,
  CreateAllocationRequest,
  UpdateAllocationRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../store/slices/driverVehicleAllocationSlice';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// API Client with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class DriverVehicleAllocationService {
  // ============================================================================
  // DRIVER ALLOCATIONS
  // ============================================================================

  /**
   * Get all vehicle allocations for a specific driver
   */
  static async getDriverAllocations(driverId: string): Promise<DriverVehicleAllocation[]> {
    try {
      const response = await apiClient.get(`/drivers/${driverId}/allocations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver allocations:', error);
      throw new Error('Failed to fetch driver allocations');
    }
  }

  /**
   * Get active vehicle allocations for a driver
   */
  static async getDriverActiveAllocations(driverId: string): Promise<DriverVehicleAllocation[]> {
    try {
      const response = await apiClient.get(`/drivers/${driverId}/allocations/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active driver allocations:', error);
      throw new Error('Failed to fetch active driver allocations');
    }
  }

  /**
   * Get allocation history for a driver
   */
  static async getDriverAllocationHistory(
    driverId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DriverVehicleAllocation[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/drivers/${driverId}/allocations/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver allocation history:', error);
      throw new Error('Failed to fetch driver allocation history');
    }
  }

  /**
   * Get driver allocation summary with statistics
   */
  static async getDriverAllocationSummary(driverId: string): Promise<DriverAllocationSummary> {
    try {
      const response = await apiClient.get(`/drivers/${driverId}/allocations/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver allocation summary:', error);
      throw new Error('Failed to fetch driver allocation summary');
    }
  }

  // ============================================================================
  // VEHICLE ALLOCATIONS
  // ============================================================================

  /**
   * Get all driver allocations for a specific vehicle
   */
  static async getVehicleAllocations(vehicleId: string): Promise<DriverVehicleAllocation[]> {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/allocations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle allocations:', error);
      throw new Error('Failed to fetch vehicle allocations');
    }
  }

  /**
   * Get active driver allocations for a vehicle
   */
  static async getVehicleActiveAllocations(vehicleId: string): Promise<DriverVehicleAllocation[]> {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/allocations/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active vehicle allocations:', error);
      throw new Error('Failed to fetch active vehicle allocations');
    }
  }

  /**
   * Get allocation history for a vehicle
   */
  static async getVehicleAllocationHistory(
    vehicleId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DriverVehicleAllocation[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/vehicles/${vehicleId}/allocations/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle allocation history:', error);
      throw new Error('Failed to fetch vehicle allocation history');
    }
  }

  /**
   * Get vehicle allocation details with driver information
   */
  static async getVehicleAllocationDetails(vehicleId: string): Promise<VehicleAllocationDetails[]> {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/allocations/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle allocation details:', error);
      throw new Error('Failed to fetch vehicle allocation details');
    }
  }

  // ============================================================================
  // ALLOCATION MANAGEMENT
  // ============================================================================

  /**
   * Create a new driver-vehicle allocation
   */
  static async createAllocation(allocationData: CreateAllocationRequest): Promise<DriverVehicleAllocation> {
    try {
      const response = await apiClient.post('/allocations', allocationData);
      return response.data;
    } catch (error) {
      console.error('Error creating allocation:', error);
      throw new Error('Failed to create allocation');
    }
  }

  /**
   * Update an existing allocation
   */
  static async updateAllocation(
    allocationId: string,
    updateData: UpdateAllocationRequest
  ): Promise<DriverVehicleAllocation> {
    try {
      const response = await apiClient.put(`/allocations/${allocationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating allocation:', error);
      throw new Error('Failed to update allocation');
    }
  }

  /**
   * Deactivate an allocation (set end date)
   */
  static async deactivateAllocation(allocationId: string, endDate: string): Promise<DriverVehicleAllocation> {
    try {
      const response = await apiClient.patch(`/allocations/${allocationId}/deactivate`, { endDate });
      return response.data;
    } catch (error) {
      console.error('Error deactivating allocation:', error);
      throw new Error('Failed to deactivate allocation');
    }
  }

  /**
   * Delete an allocation
   */
  static async deleteAllocation(allocationId: string): Promise<void> {
    try {
      await apiClient.delete(`/allocations/${allocationId}`);
    } catch (error) {
      console.error('Error deleting allocation:', error);
      throw new Error('Failed to delete allocation');
    }
  }

  /**
   * Check for allocation overlaps
   */
  static async checkAllocationOverlaps(
    driverId?: string,
    vehicleId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AllocationOverlap[]> {
    try {
      const params = new URLSearchParams();
      if (driverId) params.append('driverId', driverId);
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/allocations/overlaps?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error checking allocation overlaps:', error);
      throw new Error('Failed to check allocation overlaps');
    }
  }

  // ============================================================================
  // SCHEDULES
  // ============================================================================

  /**
   * Get allocation schedule details
   */
  static async getAllocationSchedule(scheduleId: string): Promise<AllocationSchedule> {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching allocation schedule:', error);
      throw new Error('Failed to fetch allocation schedule');
    }
  }

  /**
   * Create a new allocation schedule
   */
  static async createSchedule(scheduleData: CreateScheduleRequest): Promise<AllocationSchedule> {
    try {
      const response = await apiClient.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  /**
   * Update an existing schedule
   */
  static async updateSchedule(
    scheduleId: string,
    updateData: UpdateScheduleRequest
  ): Promise<AllocationSchedule> {
    try {
      const response = await apiClient.put(`/schedules/${scheduleId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  /**
   * Get schedules for a specific driver
   */
  static async getDriverSchedules(
    driverId: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AllocationSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/drivers/${driverId}/schedules?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver schedules:', error);
      throw new Error('Failed to fetch driver schedules');
    }
  }

  /**
   * Get schedules for a specific vehicle
   */
  static async getVehicleSchedules(
    vehicleId: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AllocationSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/vehicles/${vehicleId}/schedules?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle schedules:', error);
      throw new Error('Failed to fetch vehicle schedules');
    }
  }

  // ============================================================================
  // MANIFESTS
  // ============================================================================

  /**
   * Get manifest details for a schedule
   */
  static async getManifestDetails(scheduleId: string): Promise<ManifestDetails> {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}/manifest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manifest details:', error);
      throw new Error('Failed to fetch manifest details');
    }
  }

  /**
   * Generate manifest PDF for a schedule
   */
  static async generateManifestPDF(scheduleId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}/manifest/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error generating manifest PDF:', error);
      throw new Error('Failed to generate manifest PDF');
    }
  }

  /**
   * Get manifest history for a driver
   */
  static async getDriverManifestHistory(
    driverId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ManifestDetails[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/drivers/${driverId}/manifests?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver manifest history:', error);
      throw new Error('Failed to fetch driver manifest history');
    }
  }

  // ============================================================================
  // JOB CONSIGNMENTS
  // ============================================================================

  /**
   * Get job consignment details for a schedule
   */
  static async getJobConsignments(scheduleId: string): Promise<JobConsignmentDetails[]> {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}/consignments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job consignments:', error);
      throw new Error('Failed to fetch job consignments');
    }
  }

  /**
   * Get consignment details for a specific job
   */
  static async getJobConsignmentDetails(jobId: string): Promise<JobConsignmentDetails> {
    try {
      const response = await apiClient.get(`/jobs/${jobId}/consignment`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job consignment details:', error);
      throw new Error('Failed to fetch job consignment details');
    }
  }

  /**
   * Get consignment history for a driver
   */
  static async getDriverConsignmentHistory(
    driverId: string,
    startDate?: string,
    endDate?: string
  ): Promise<JobConsignmentDetails[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/drivers/${driverId}/consignments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver consignment history:', error);
      throw new Error('Failed to fetch driver consignment history');
    }
  }

  // ============================================================================
  // ADVANCED QUERIES
  // ============================================================================

  /**
   * Get comprehensive allocation report
   */
  static async getAllocationReport(filters: {
    startDate?: string;
    endDate?: string;
    driverIds?: string[];
    vehicleIds?: string[];
    statuses?: string[];
    includeSchedules?: boolean;
    includeManifests?: boolean;
    includeConsignments?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/allocations/report', filters);
      return response.data;
    } catch (error) {
      console.error('Error generating allocation report:', error);
      throw new Error('Failed to generate allocation report');
    }
  }

  /**
   * Get allocation analytics and statistics
   */
  static async getAllocationAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'driver' | 'vehicle' | 'date' | 'status';
  }): Promise<any> {
    try {
      const response = await apiClient.post('/allocations/analytics', filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching allocation analytics:', error);
      throw new Error('Failed to fetch allocation analytics');
    }
  }

  /**
   * Search allocations with complex criteria
   */
  static async searchAllocations(searchCriteria: {
    query?: string;
    driverIds?: string[];
    vehicleIds?: string[];
    dateRange?: { start: string; end: string };
    statuses?: string[];
    scheduleTitles?: string[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    allocations: DriverVehicleAllocation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.post('/allocations/search', searchCriteria);
      return response.data;
    } catch (error) {
      console.error('Error searching allocations:', error);
      throw new Error('Failed to search allocations');
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk create allocations
   */
  static async bulkCreateAllocations(allocations: CreateAllocationRequest[]): Promise<{
    success: DriverVehicleAllocation[];
    failed: { data: CreateAllocationRequest; error: string }[];
  }> {
    try {
      const response = await apiClient.post('/allocations/bulk', { allocations });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating allocations:', error);
      throw new Error('Failed to bulk create allocations');
    }
  }

  /**
   * Bulk update allocations
   */
  static async bulkUpdateAllocations(updates: { id: string; data: UpdateAllocationRequest }[]): Promise<{
    success: DriverVehicleAllocation[];
    failed: { id: string; error: string }[];
  }> {
    try {
      const response = await apiClient.put('/allocations/bulk', { updates });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating allocations:', error);
      throw new Error('Failed to bulk update allocations');
    }
  }

  /**
   * Bulk deactivate allocations
   */
  static async bulkDeactivateAllocations(
    allocationIds: string[],
    endDate: string
  ): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
  }> {
    try {
      const response = await apiClient.patch('/allocations/bulk/deactivate', {
        allocationIds,
        endDate,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deactivating allocations:', error);
      throw new Error('Failed to bulk deactivate allocations');
    }
  }

  // ============================================================================
  // EXPORT OPERATIONS
  // ============================================================================

  /**
   * Export allocations to CSV
   */
  static async exportAllocationsToCSV(filters: {
    startDate?: string;
    endDate?: string;
    driverIds?: string[];
    vehicleIds?: string[];
    statuses?: string[];
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> {
    try {
      const response = await apiClient.post('/allocations/export', filters, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting allocations:', error);
      throw new Error('Failed to export allocations');
    }
  }

  /**
   * Export manifest to PDF
   */
  static async exportManifestToPDF(scheduleId: string, options?: {
    includeRoute?: boolean;
    includeConsignments?: boolean;
    format?: 'pdf' | 'docx';
  }): Promise<Blob> {
    try {
      const response = await apiClient.post(`/schedules/${scheduleId}/export`, options, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting manifest:', error);
      throw new Error('Failed to export manifest');
    }
  }

  // ============================================================================
  // NOTIFICATION AND ALERTS
  // ============================================================================

  /**
   * Get allocation alerts (overlaps, expiring licenses, etc.)
   */
  static async getAllocationAlerts(): Promise<{
    overlaps: AllocationOverlap[];
    expiringLicenses: any[];
    maintenanceDue: any[];
    scheduleConflicts: any[];
  }> {
    try {
      const response = await apiClient.get('/allocations/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching allocation alerts:', error);
      throw new Error('Failed to fetch allocation alerts');
    }
  }

  /**
   * Subscribe to allocation notifications
   */
  static async subscribeToNotifications(subscription: {
    type: 'email' | 'sms' | 'push';
    events: string[];
    driverIds?: string[];
    vehicleIds?: string[];
  }): Promise<void> {
    try {
      await apiClient.post('/allocations/notifications/subscribe', subscription);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw new Error('Failed to subscribe to notifications');
    }
  }
}

export default DriverVehicleAllocationService;
