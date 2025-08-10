import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Core interfaces for the many-to-many relationship
export interface DriverVehicleAllocation {
  id: string;
  driverId: string;
  vehicleId: string;
  allocationDate: string;
  deallocationDate?: string;
  scheduleTitle: string;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAllocationDetails {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  allocationDate: string;
  deallocationDate?: string;
  scheduleTitle: string;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled';
  totalJobs: number;
  completedJobs: number;
  totalDistance: number;
  totalDuration: number;
  notes?: string;
}

export interface DriverAllocationDetails {
  id: string;
  driverId: string;
  driverName: string;
  employeeNumber: string;
  allocationDate: string;
  deallocationDate?: string;
  scheduleTitle: string;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled';
  totalJobs: number;
  completedJobs: number;
  totalHours: number;
  totalMiles: number;
  notes?: string;
}

export interface AllocationSchedule {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  driverId: string;
  vehicleId: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  jobs: string[];
  routePlanId?: string;
  totalJobs: number;
  estimatedDistance: number;
  estimatedDuration: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManifestDetails {
  id: string;
  scheduleId: string;
  scheduleTitle: string;
  date: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  jobs: {
    jobId: string;
    jobNumber: string;
    customerName: string;
    pickupLocation: string;
    deliveryLocation: string;
    scheduledTime: string;
    estimatedDuration: number;
    status: string;
    cargoType: string;
    cargoWeight: number;
    specialRequirements?: string;
  }[];
  totalJobs: number;
  totalWeight: number;
  totalVolume: number;
  routeNotes?: string;
  driverNotes?: string;
  managementNotes?: string;
}

export interface JobConsignmentDetails {
  id: string;
  jobId: string;
  jobNumber: string;
  scheduleId: string;
  scheduleTitle: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: string;
  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  specialRequirements?: string;
  consignmentItems: {
    itemId: string;
    description: string;
    quantity: number;
    unit: string;
    weight: number;
    volume: number;
    isFragile: boolean;
    isOversized: boolean;
    specialHandling?: string;
  }[];
  totalItems: number;
  totalWeight: number;
  totalVolume: number;
  notes?: string;
  driverNotes?: string;
  managementNotes?: string;
}

// State interface
interface DriverVehicleAllocationState {
  allocations: DriverVehicleAllocation[];
  schedules: AllocationSchedule[];
  manifests: ManifestDetails[];
  jobConsignments: JobConsignmentDetails[];
  loading: boolean;
  error: string | null;
  selectedDriverId: string | null;
  selectedVehicleId: string | null;
  selectedScheduleId: string | null;
}

const initialState: DriverVehicleAllocationState = {
  allocations: [],
  schedules: [],
  manifests: [],
  jobConsignments: [],
  loading: false,
  error: null,
  selectedDriverId: null,
  selectedVehicleId: null,
  selectedScheduleId: null,
};

// Async thunks for API calls
export const fetchDriverAllocations = createAsyncThunk(
  'driverVehicleAllocation/fetchDriverAllocations',
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/drivers/${driverId}/allocations`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch driver allocations');
    }
  }
);

export const fetchVehicleAllocations = createAsyncThunk(
  'driverVehicleAllocation/fetchVehicleAllocations',
  async (vehicleId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}/allocations`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch vehicle allocations');
    }
  }
);

export const fetchAllocationSchedule = createAsyncThunk(
  'driverVehicleAllocation/fetchAllocationSchedule',
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch schedule');
    }
  }
);

export const fetchManifestDetails = createAsyncThunk(
  'driverVehicleAllocation/fetchManifestDetails',
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/schedules/${scheduleId}/manifest`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch manifest');
    }
  }
);

export const fetchJobConsignments = createAsyncThunk(
  'driverVehicleAllocation/fetchJobConsignments',
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/schedules/${scheduleId}/consignments`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch job consignments');
    }
  }
);

export const createAllocation = createAsyncThunk(
  'driverVehicleAllocation/createAllocation',
  async (allocationData: Omit<DriverVehicleAllocation, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/allocations', allocationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create allocation');
    }
  }
);

export const updateAllocation = createAsyncThunk(
  'driverVehicleAllocation/updateAllocation',
  async (allocationData: Partial<DriverVehicleAllocation> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/allocations/${allocationData.id}`, allocationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update allocation');
    }
  }
);

export const deactivateAllocation = createAsyncThunk(
  'driverVehicleAllocation/deactivateAllocation',
  async (allocationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/allocations/${allocationId}/deactivate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to deactivate allocation');
    }
  }
);

// Slice
const driverVehicleAllocationSlice = createSlice({
  name: 'driverVehicleAllocation',
  initialState,
  reducers: {
    setSelectedDriver: (state, action: PayloadAction<string | null>) => {
      state.selectedDriverId = action.payload;
    },
    setSelectedVehicle: (state, action: PayloadAction<string | null>) => {
      state.selectedVehicleId = action.payload;
    },
    setSelectedSchedule: (state, action: PayloadAction<string | null>) => {
      state.selectedScheduleId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch driver allocations
      .addCase(fetchDriverAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload.allocations || [];
        state.schedules = action.payload.schedules || [];
      })
      .addCase(fetchDriverAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch vehicle allocations
      .addCase(fetchVehicleAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload.allocations || [];
        state.schedules = action.payload.schedules || [];
      })
      .addCase(fetchVehicleAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch allocation schedule
      .addCase(fetchAllocationSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocationSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const schedule = action.payload;
        const existingIndex = state.schedules.findIndex(s => s.id === schedule.id);
        if (existingIndex >= 0) {
          state.schedules[existingIndex] = schedule;
        } else {
          state.schedules.push(schedule);
        }
      })
      .addCase(fetchAllocationSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch manifest details
      .addCase(fetchManifestDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManifestDetails.fulfilled, (state, action) => {
        state.loading = false;
        const manifest = action.payload;
        const existingIndex = state.manifests.findIndex(m => m.id === manifest.id);
        if (existingIndex >= 0) {
          state.manifests[existingIndex] = manifest;
        } else {
          state.manifests.push(manifest);
        }
      })
      .addCase(fetchManifestDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch job consignments
      .addCase(fetchJobConsignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobConsignments.fulfilled, (state, action) => {
        state.loading = false;
        state.jobConsignments = action.payload || [];
      })
      .addCase(fetchJobConsignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create allocation
      .addCase(createAllocation.fulfilled, (state, action) => {
        state.allocations.push(action.payload);
      })
      // Update allocation
      .addCase(updateAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(a => a.id === action.payload.id);
        if (index >= 0) {
          state.allocations[index] = action.payload;
        }
      })
      // Deactivate allocation
      .addCase(deactivateAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(a => a.id === action.payload.id);
        if (index >= 0) {
          state.allocations[index] = action.payload;
        }
      });
  },
});

export const { setSelectedDriver, setSelectedVehicle, setSelectedSchedule, clearError } = driverVehicleAllocationSlice.actions;
export default driverVehicleAllocationSlice.reducer;
