import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'attempted' | 'rescheduled' | 'completed' | 'failed' | 'refused' | 'cancelled' | 'scheduled';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface JobLocation {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    line3?: string;
    town: string;
    city?: string;
    postcode: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactPerson?: string;
  contactPhone?: string;
  deliveryInstructions?: string;
}

export interface JobAssignment {
  id: string;
  jobNumber: string;
  title: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  priority: JobPriority;
  status: JobStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // in minutes
  actualStartTime?: string;
  actualEndTime?: string;
  pickupLocation: JobLocation;
  deliveryLocation: JobLocation;
  useDifferentDeliveryAddress: boolean;
  alternativeDeliveryAddress?: JobLocation;
  cargoType: string;
  cargoWeight: number;
  specialRequirements?: string;
  notes?: string;
  driverNotes?: string;
  managementNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  authorizedBy: string;
  // New load dimension fields
  loadDimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
    weight: number; // kg
    volume: number; // cubic meters (calculated)
    isOversized: boolean;
    isProtruding: boolean;
    isBalanced: boolean;
    isFragile: boolean;
    plotAllocation?: string; // Plot ID for trailer positioning
    loadNotes?: string;
  };
  // Delivery notes and route information
  deliveryNotes?: string;
  routeNotes?: string;
  alternativeRoute?: {
    waypoints: string[];
    estimatedDistance: number;
    estimatedDuration: number;
    reason: string;
  };
}

export interface RoutePlan {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  jobs: string[]; // Array of job IDs in order
  totalDistance: number; // in miles
  estimatedDuration: number; // in minutes
  startLocation: string;
  endLocation: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailySchedule {
  id: string;
  vehicleId?: string;
  driverId?: string;
  date: string;
  routePlanId?: string;
  jobs: {
    jobId: string;
    scheduledTime: string;
    estimatedDuration: number;
    status: JobStatus;
    actualStartTime?: string;
    actualEndTime?: string;
    notes?: string;
  }[];
  totalJobs: number;
  completedJobs: number;
  totalDistance: number;
  totalDuration: number;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobState {
  jobs: JobAssignment[];
  routePlans: RoutePlan[];
  dailySchedules: DailySchedule[];
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [
    {
      id: '1',
      jobNumber: 'JOB-2024-001',
      title: 'London to Manchester Delivery',
      description: 'Urgent delivery of automotive parts to Manchester distribution center',
      customerName: 'AutoParts Ltd',
      customerPhone: '+44 161 123 4567',
      customerEmail: 'orders@autoparts.co.uk',
      priority: 'urgent',
      status: 'assigned',
      assignedDriver: '1',
      assignedVehicle: 'HGV001',
      scheduledDate: '2024-01-25',
      scheduledTime: '08:00',
      estimatedDuration: 240,
      pickupLocation: {
        id: 'loc1',
        name: 'London Warehouse',
        address: {
          line1: '123 Industrial Estate',
          line2: 'Unit 15',
          line3: 'Floor 2',
          town: 'London',
          city: 'London',
          postcode: 'E1 1AA'
        },
        contactPerson: 'John Smith',
        contactPhone: '+44 20 1234 5678',
        deliveryInstructions: 'Load from dock 3, security pass required'
      },
      deliveryLocation: {
        id: 'loc2',
        name: 'Manchester Distribution Center',
        address: {
          line1: '456 Business Park',
          line2: 'Building C',
          line3: 'Suite 200',
          town: 'Manchester',
          city: 'Manchester',
          postcode: 'M1 1AA'
        },
        contactPerson: 'Sarah Johnson',
        contactPhone: '+44 161 9876 5432',
        deliveryInstructions: 'Deliver to receiving bay 2, call 30 minutes before arrival'
      },
             cargoType: 'Automotive Parts',
       cargoWeight: 2500,
       specialRequirements: 'Temperature controlled, fragile items',
       notes: 'Customer requires delivery before 14:00',
       deliveryNotes: 'Call 30 minutes before arrival. Deliver to receiving bay 2. Security pass required.',
       routeNotes: 'Avoid M25 during rush hour. Use A1M alternative route.',
       loadDimensions: {
         length: 300,
         width: 200,
         height: 150,
         weight: 2500,
         volume: 9.0,
         isOversized: false,
         isProtruding: false,
         isBalanced: true,
         isFragile: true,
         loadNotes: 'Handle with care - fragile automotive parts',
       },
       createdAt: '2024-01-20T10:00:00Z',
       updatedAt: '2024-01-20T10:00:00Z',
       createdBy: 'management'
    },
    {
      id: '2',
      jobNumber: 'JOB-2024-002',
      title: 'Birmingham to Leeds Collection',
      description: 'Collection of electronics from Birmingham factory',
      customerName: 'TechCorp Industries',
      customerPhone: '+44 121 234 5678',
      customerEmail: 'logistics@techcorp.com',
      priority: 'high',
      status: 'pending',
      scheduledDate: '2024-01-25',
      scheduledTime: '10:30',
      estimatedDuration: 180,
      pickupLocation: {
        id: 'loc3',
        name: 'Birmingham Factory',
        address: {
          line1: '789 Industrial Way',
          line2: 'Factory Building A',
          line3: 'Loading Zone 1',
          town: 'Birmingham',
          city: 'Birmingham',
          postcode: 'B1 1AA'
        },
        contactPerson: 'Mike Wilson',
        contactPhone: '+44 121 3456 7890',
        deliveryInstructions: 'Collection from loading bay 1, pallets ready'
      },
      deliveryLocation: {
        id: 'loc4',
        name: 'Leeds Warehouse',
        address: {
          line1: '321 Storage Lane',
          line2: 'Warehouse Complex',
          line3: 'Unit 3',
          town: 'Leeds',
          city: 'Leeds',
          postcode: 'LS1 1AA'
        },
        contactPerson: 'Emma Davis',
        contactPhone: '+44 113 4567 8901',
        deliveryInstructions: 'Deliver to warehouse 3, unload with forklift'
      },
             cargoType: 'Electronics',
       cargoWeight: 1800,
       specialRequirements: 'Handle with care, anti-static packaging',
       deliveryNotes: 'Anti-static packaging required. Unload with forklift at warehouse 3.',
       routeNotes: 'Direct route via M1. No special requirements.',
       loadDimensions: {
         length: 250,
         width: 180,
         height: 120,
         weight: 1800,
         volume: 5.4,
         isOversized: false,
         isProtruding: false,
         isBalanced: true,
         isFragile: false,
         loadNotes: 'Electronics - standard handling',
       },
       createdAt: '2024-01-21T09:00:00Z',
       updatedAt: '2024-01-21T09:00:00Z',
       createdBy: 'management'
    },
    {
      id: '3',
      jobNumber: 'JOB-2024-003',
      title: 'Liverpool to Bristol Transport',
      description: 'Regular delivery of textiles to Bristol retail center',
      customerName: 'Fashion Forward Ltd',
      customerPhone: '+44 151 345 6789',
      customerEmail: 'supply@fashionforward.co.uk',
      priority: 'medium',
      status: 'pending',
      scheduledDate: '2024-01-26',
      scheduledTime: '09:00',
      estimatedDuration: 300,
      pickupLocation: {
        id: 'loc5',
        name: 'Liverpool Textile Mill',
        address: {
          line1: '654 Factory Road',
          line2: 'Textile Mill Complex',
          line3: 'Warehouse A, Loading Dock 2',
          town: 'Liverpool',
          city: 'Liverpool',
          postcode: 'L1 1AA'
        },
        contactPerson: 'David Brown',
        contactPhone: '+44 151 4567 8901',
        deliveryInstructions: 'Load from warehouse A, use loading dock 2'
      },
      deliveryLocation: {
        id: 'loc6',
        name: 'Bristol Retail Center',
        address: {
          line1: '987 Shopping District',
          line2: 'Retail Complex',
          line3: 'Back Entrance',
          town: 'Bristol',
          city: 'Bristol',
          postcode: 'BS1 1AA'
        },
        contactPerson: 'Lisa Green',
        contactPhone: '+44 117 5678 9012',
        deliveryInstructions: 'Deliver to back entrance, security code: 1234'
      },
             cargoType: 'Textiles',
       cargoWeight: 3200,
       deliveryNotes: 'Deliver to back entrance. Security code: 1234. Standard textile handling.',
       routeNotes: 'Via M6 and M5. Standard route.',
       loadDimensions: {
         length: 400,
         width: 250,
         height: 200,
         weight: 3200,
         volume: 20.0,
         isOversized: true,
         isProtruding: false,
         isBalanced: true,
         isFragile: false,
         loadNotes: 'Large textile shipment - oversized load',
       },
       createdAt: '2024-01-22T11:00:00Z',
       updatedAt: '2024-01-22T11:00:00Z',
       createdBy: 'management'
    }
  ],
  routePlans: [
    {
      id: 'route1',
      vehicleId: 'HGV001',
      driverId: '1',
      date: '2024-01-25',
      jobs: ['1'],
      totalDistance: 200,
      estimatedDuration: 240,
      startLocation: 'London Warehouse',
      endLocation: 'Manchester Distribution Center',
      status: 'planned',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    }
  ],
  dailySchedules: [
    {
      id: 'schedule1',
      vehicleId: 'HGV001',
      driverId: '1',
      date: '2024-01-25',
      routePlanId: 'route1',
      jobs: [
        {
          jobId: '1',
          scheduledTime: '08:00',
          estimatedDuration: 240,
          status: 'assigned'
        }
      ],
      totalJobs: 1,
      completedJobs: 0,
      totalDistance: 200,
      totalDuration: 240,
      status: 'scheduled',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    }
  ],
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    // Job management
    addJob: (state, action: PayloadAction<JobAssignment>) => {
      state.jobs.push(action.payload);
    },
    updateJob: (state, action: PayloadAction<JobAssignment>) => {
      const index = state.jobs.findIndex(job => job.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = { ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    deleteJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter(job => job.id !== action.payload);
    },
    updateJobStatus: (state, action: PayloadAction<{ jobId: string; status: JobStatus; driverNotes?: string; actualStartTime?: string; actualEndTime?: string }>) => {
      const job = state.jobs.find(j => j.id === action.payload.jobId);
      if (job) {
        job.status = action.payload.status;
        job.driverNotes = action.payload.driverNotes;
        job.actualStartTime = action.payload.actualStartTime;
        job.actualEndTime = action.payload.actualEndTime;
        job.updatedAt = new Date().toISOString();
      }
    },
    assignJobToDriver: (state, action: PayloadAction<{ jobId: string; driverId: string; vehicleId: string }>) => {
      const job = state.jobs.find(j => j.id === action.payload.jobId);
      if (job) {
        job.assignedDriver = action.payload.driverId;
        job.assignedVehicle = action.payload.vehicleId;
        job.status = 'assigned';
        job.updatedAt = new Date().toISOString();
      }
    },

    // Route planning
    addRoutePlan: (state, action: PayloadAction<RoutePlan>) => {
      state.routePlans.push(action.payload);
    },
    updateRoutePlan: (state, action: PayloadAction<RoutePlan>) => {
      const index = state.routePlans.findIndex(route => route.id === action.payload.id);
      if (index !== -1) {
        state.routePlans[index] = { ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    deleteRoutePlan: (state, action: PayloadAction<string>) => {
      state.routePlans = state.routePlans.filter(route => route.id !== action.payload);
    },

    // Daily scheduling
    addDailySchedule: (state, action: PayloadAction<DailySchedule>) => {
      state.dailySchedules.push(action.payload);
    },
    updateDailySchedule: (state, action: PayloadAction<DailySchedule>) => {
      const index = state.dailySchedules.findIndex(schedule => schedule.id === action.payload.id);
      if (index !== -1) {
        state.dailySchedules[index] = { ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    deleteDailySchedule: (state, action: PayloadAction<string>) => {
      state.dailySchedules = state.dailySchedules.filter(schedule => schedule.id !== action.payload);
    },
    updateScheduleJobStatus: (state, action: PayloadAction<{ scheduleId: string; jobId: string; status: JobStatus; actualStartTime?: string; actualEndTime?: string; notes?: string }>) => {
      const schedule = state.dailySchedules.find(s => s.id === action.payload.scheduleId);
      if (schedule) {
        const job = schedule.jobs.find(j => j.jobId === action.payload.jobId);
        if (job) {
          job.status = action.payload.status;
          job.actualStartTime = action.payload.actualStartTime;
          job.actualEndTime = action.payload.actualEndTime;
          job.notes = action.payload.notes;
        }
        schedule.updatedAt = new Date().toISOString();
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  assignJobToDriver,
  addRoutePlan,
  updateRoutePlan,
  deleteRoutePlan,
  addDailySchedule,
  updateDailySchedule,
  deleteDailySchedule,
  updateScheduleJobStatus,
  setLoading,
  setError,
} = jobSlice.actions;

export default jobSlice.reducer; 