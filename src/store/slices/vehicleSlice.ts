import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type VehicleStatus = 'Available' | 'V.O.R' | 'Service' | 'MOT' | 'Repair' | 'Accident' | 'Off Road' | 'Reserved' | 'Training' | 'Breakdown';

export interface VehicleDefectReport {
  id: string;
  driverId: string;
  driverName: string;
  vehicleFleetNumber: string;
  dateTime: string;
  speedoOdometer: string;
  checkItems: {
    id: number;
    label: string;
    category: 'general' | 'articulated' | 'pcv' | 'fors';
    checked: boolean;
    notes?: string;
  }[];
  defects: {
    reported: string;
    assessment: string;
  };
  signatures: {
    reportedTo: string;
    rectifiedBy: string;
    rectifiedDate: string;
    driverSignature: string;
  };
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'escalated';
  managementNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Vehicle {
  id: string;
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  type: 'HGV' | 'Articulated' | 'PCV' | 'PSV' | 'Van' | 'Car';
  status: VehicleStatus;
  capacity: number; // in tons
  lastInspection: string;
  nextMOT: string;
  nextService: string;
  currentDriver?: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FleetStatus {
  totalVehicles: number;
  available: number;
  inUse: number;
  maintenance: number;
  offRoad: number;
  criticalIssues: number;
}

interface VehicleState {
  vehicles: Vehicle[];
  defectReports: VehicleDefectReport[];
  fleetStatus: FleetStatus;
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [
    {
      id: '1',
      fleetNumber: 'HGV001',
      registration: 'AB12 CDE',
      make: 'Mercedes-Benz',
      model: 'Actros',
      year: 2022,
      type: 'HGV',
      status: 'Available',
      capacity: 26,
      lastInspection: '2024-01-15',
      nextMOT: '2024-07-15',
      nextService: '2024-03-15',
      currentDriver: 'Adam Mustafa',
      location: 'Main Depot',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      fleetNumber: 'HGV002',
      registration: 'EF34 FGH',
      make: 'Volvo',
      model: 'FH16',
      year: 2021,
      type: 'Articulated',
      status: 'Service',
      capacity: 44,
      lastInspection: '2024-01-10',
      nextMOT: '2024-06-10',
      nextService: '2024-02-10',
      currentDriver: 'Jane Manager',
      location: 'Service Center',
      notes: 'Routine service - brake system check',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: '3',
      fleetNumber: 'HGV003',
      registration: 'IJ56 KLM',
      make: 'Scania',
      model: 'R500',
      year: 2023,
      type: 'HGV',
      status: 'V.O.R',
      capacity: 26,
      lastInspection: '2024-01-05',
      nextMOT: '2024-08-05',
      nextService: '2024-04-05',
      location: 'Main Depot',
      notes: 'Vehicle off road - awaiting parts',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
    },
  ],
  defectReports: [],
  fleetStatus: {
    totalVehicles: 3,
    available: 1,
    inUse: 0,
    maintenance: 1,
    offRoad: 1,
    criticalIssues: 0,
  },
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    // Vehicle management
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.push(action.payload);
      vehicleSlice.caseReducers.updateFleetStatus(state);
    },
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const index = state.vehicles.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = { ...action.payload, updatedAt: new Date().toISOString() };
        vehicleSlice.caseReducers.updateFleetStatus(state);
      }
    },
    deleteVehicle: (state, action: PayloadAction<string>) => {
      state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      vehicleSlice.caseReducers.updateFleetStatus(state);
    },
    updateVehicleStatus: (state, action: PayloadAction<{ vehicleId: string; status: VehicleStatus; notes?: string }>) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.vehicleId);
      if (vehicle) {
        vehicle.status = action.payload.status;
        vehicle.notes = action.payload.notes;
        vehicle.updatedAt = new Date().toISOString();
        vehicleSlice.caseReducers.updateFleetStatus(state);
      }
    },

    // Defect report management
    addDefectReport: (state, action: PayloadAction<VehicleDefectReport>) => {
      state.defectReports.push(action.payload);
    },
    updateDefectReport: (state, action: PayloadAction<VehicleDefectReport>) => {
      const index = state.defectReports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.defectReports[index] = action.payload;
      }
    },
    updateDefectStatus: (state, action: PayloadAction<{ reportId: string; status: VehicleDefectReport['status']; priority: VehicleDefectReport['priority']; notes?: string }>) => {
      const report = state.defectReports.find(r => r.id === action.payload.reportId);
      if (report) {
        report.status = action.payload.status;
        report.priority = action.payload.priority;
        report.managementNotes = action.payload.notes;
      }
    },

    // Fleet status calculation
    updateFleetStatus: (state) => {
      const total = state.vehicles.length;
      const available = state.vehicles.filter(v => v.status === 'Available').length;
      const inUse = state.vehicles.filter(v => v.status === 'Available' && v.currentDriver).length;
      const maintenance = state.vehicles.filter(v => ['Service', 'MOT', 'Repair'].includes(v.status)).length;
      const offRoad = state.vehicles.filter(v => ['V.O.R', 'Off Road', 'Accident', 'Breakdown'].includes(v.status)).length;
      const criticalIssues = state.defectReports.filter(r => r.priority === 'critical' && r.status !== 'resolved').length;

      state.fleetStatus = {
        totalVehicles: total,
        available,
        inUse,
        maintenance,
        offRoad,
        criticalIssues,
      };
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
  addVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  addDefectReport,
  updateDefectReport,
  updateDefectStatus,
  updateFleetStatus,
  setLoading,
  setError,
} = vehicleSlice.actions;

export default vehicleSlice.reducer; 