import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Job {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDateTime: string;
  deliveryDateTime: string;
  cargoType: string;
  weight: number;
  specialInstructions?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleRegistration?: string;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [
    {
      id: '1',
      customerName: 'ABC Logistics',
      customerPhone: '+44 123 456 7890',
      customerEmail: 'contact@abclogistics.com',
      pickupLocation: 'Manchester Warehouse, Unit 15, Industrial Estate',
      deliveryLocation: 'London Distribution Center, Docklands',
      pickupDateTime: '2024-06-01T10:00:00Z',
      deliveryDateTime: '2024-06-01T18:00:00Z',
      cargoType: 'General Freight',
      weight: 12.5,
      specialInstructions: 'Handle with care - fragile items',
      priority: 'high',
      status: 'pending',
      createdAt: '2024-06-01T08:00:00Z',
    },
    {
      id: '2',
      customerName: 'XYZ Transport',
      customerPhone: '+44 987 654 3210',
      customerEmail: 'info@xyztransport.co.uk',
      pickupLocation: 'Birmingham Depot, Port Road',
      deliveryLocation: 'Leeds Factory, Industrial Park',
      pickupDateTime: '2024-05-31T14:30:00Z',
      deliveryDateTime: '2024-06-01T09:00:00Z',
      cargoType: 'Machinery Parts',
      weight: 8.2,
      priority: 'normal',
      status: 'in_progress',
      driverId: 'driver1',
      driverName: 'John Smith',
      vehicleId: 'vehicle1',
      vehicleRegistration: 'AB12 CDE',
      createdAt: '2024-05-31T12:00:00Z',
      assignedAt: '2024-05-31T13:00:00Z',
      startedAt: '2024-05-31T14:30:00Z',
    },
    {
      id: '3',
      customerName: 'Global Shipping Ltd',
      customerPhone: '+44 555 123 4567',
      customerEmail: 'dispatch@globalshipping.com',
      pickupLocation: 'Liverpool Port, Container Terminal',
      deliveryLocation: 'Edinburgh Warehouse, Leith Docks',
      pickupDateTime: '2024-05-30T06:00:00Z',
      deliveryDateTime: '2024-05-31T16:00:00Z',
      cargoType: 'Container Goods',
      weight: 22.0,
      specialInstructions: 'Time-critical delivery',
      priority: 'urgent',
      status: 'completed',
      driverId: 'driver2',
      driverName: 'Sarah Johnson',
      vehicleId: 'vehicle2',
      vehicleRegistration: 'CD34 FGH',
      createdAt: '2024-05-30T04:00:00Z',
      assignedAt: '2024-05-30T05:00:00Z',
      startedAt: '2024-05-30T06:00:00Z',
      completedAt: '2024-05-31T15:30:00Z',
    },
  ],
  selectedJob: null,
  loading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async () => {
    // TODO: Replace with real API call
    return initialState.jobs;
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    // TODO: Replace with real API call
    const job = initialState.jobs.find(j => j.id === jobId);
    if (!job) {
      return rejectWithValue('Job not found');
    }
    return job;
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    // TODO: Replace with real API call
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return newJob;
  }
);

export const assignJob = createAsyncThunk(
  'jobs/assignJob',
  async ({ jobId, driverId, vehicleId }: { jobId: string; driverId: string; vehicleId: string }, { getState, rejectWithValue }) => {
    // TODO: Replace with real API call
    const state = getState() as any;
    const job = state.jobs.jobs.find((j: Job) => j.id === jobId);
    const driver = state.drivers.drivers.find((d: any) => d.id === driverId);
    const vehicle = state.vehicles.vehicles.find((v: any) => v.id === vehicleId);
    
    if (!job || !driver || !vehicle) {
      return rejectWithValue('Invalid assignment data');
    }
    
    return {
      jobId,
      driverId,
      driverName: `${driver.firstName} ${driver.lastName}`,
      vehicleId,
      vehicleRegistration: vehicle.registration,
      assignedAt: new Date().toISOString(),
    };
  }
);

export const updateJobStatus = createAsyncThunk(
  'jobs/updateJobStatus',
  async ({ jobId, status }: { jobId: string; status: string; notes?: string }) => {
    // TODO: Replace with real API call
    const updateData: any = { jobId, status };
    
    if (status === 'in_progress') {
      updateData.startedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completedAt = new Date().toISOString();
    }
    
    return updateData;
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = [action.payload, ...state.jobs];
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignJob.fulfilled, (state, action) => {
        state.loading = false;
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.driverId = action.payload.driverId;
          job.driverName = action.payload.driverName;
          job.vehicleId = action.payload.vehicleId;
          job.vehicleRegistration = action.payload.vehicleRegistration;
          job.assignedAt = action.payload.assignedAt;
          job.status = 'in_progress';
        }
        if (state.selectedJob && state.selectedJob.id === action.payload.jobId) {
          state.selectedJob = { ...state.selectedJob, ...action.payload, status: 'in_progress' };
        }
      })
      .addCase(assignJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.status = action.payload.status;
          if (action.payload.startedAt) job.startedAt = action.payload.startedAt;
          if (action.payload.completedAt) job.completedAt = action.payload.completedAt;
        }
        if (state.selectedJob && state.selectedJob.id === action.payload.jobId) {
          state.selectedJob = { ...state.selectedJob, ...action.payload };
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default jobsSlice.reducer; 