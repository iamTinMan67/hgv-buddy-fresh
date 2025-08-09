import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface FuelRecord {
  id: string;
  date: string;
  vehicleId: string;
  vehicleRegistration: string;
  driverId: string;
  driverName: string;
  odometerReading?: number;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  receiptNumber: string;
  fuelStation: string;
  receiptImage?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  uploadedBy: string;
  uploadedAt: string;
  source: 'driver_upload' | 'manual_entry';
}

export interface FuelStatistics {
  totalFuelCost: number;
  totalLitres: number;
  averagePricePerLitre: number;
  totalRecords: number;
  pendingRecords: number;
  approvedRecords: number;
  rejectedRecords: number;
  monthlyData: {
    month: string;
    cost: number;
    litres: number;
  }[];
  vehicleEfficiency: {
    vehicleId: string;
    vehicleRegistration: string;
    totalCost: number;
    totalLitres: number;
    averagePrice: number;
  }[];
}

interface FuelState {
  fuelRecords: FuelRecord[];
  statistics: FuelStatistics;
  loading: boolean;
  error: string | null;
}

const initialState: FuelState = {
  fuelRecords: [
    {
      id: '1',
      date: '2024-01-15',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP001',
      driverName: 'Adam Mustafa',
      odometerReading: 125450,
      litres: 150.5,
      pricePerLitre: 1.85,
      totalCost: 278.43,
      receiptNumber: 'REC-2024-001',
      fuelStation: 'BP Fuel Station - London',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-16',
      uploadedBy: 'EMP001',
      uploadedAt: '2024-01-15T10:30:00Z',
      source: 'driver_upload',
    },
    {
      id: '2',
      date: '2024-01-14',
      vehicleId: 'HGV002',
      vehicleRegistration: 'XY34 FGH',
      driverId: 'EMP002',
      driverName: 'Jane Manager',
      odometerReading: 98750,
      litres: 120.0,
      pricePerLitre: 1.82,
      totalCost: 218.40,
      receiptNumber: 'REC-2024-002',
      fuelStation: 'Shell Station - Manchester',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-15',
      uploadedBy: 'EMP002',
      uploadedAt: '2024-01-14T14:20:00Z',
      source: 'driver_upload',
    },
  ],
  statistics: {
    totalFuelCost: 0,
    totalLitres: 0,
    averagePricePerLitre: 0,
    totalRecords: 0,
    pendingRecords: 0,
    approvedRecords: 0,
    rejectedRecords: 0,
    monthlyData: [],
    vehicleEfficiency: [],
  },
  loading: false,
  error: null,
};

// Async thunk to add fuel record from driver upload
export const addFuelRecordFromDriver = createAsyncThunk(
  'fuel/addFuelRecordFromDriver',
  async (fuelData: Omit<FuelRecord, 'id' | 'uploadedAt' | 'status' | 'source'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRecord: FuelRecord = {
      ...fuelData,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      source: 'driver_upload',
    };
    
    return newRecord;
  }
);

// Async thunk to approve/reject fuel record
export const updateFuelRecordStatus = createAsyncThunk(
  'fuel/updateFuelRecordStatus',
  async ({ recordId, status, approvedBy, notes }: {
    recordId: string;
    status: 'approved' | 'rejected';
    approvedBy: string;
    notes?: string;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      recordId,
      status,
      approvedBy,
      approvedDate: new Date().toISOString(),
      notes,
    };
  }
);

// Async thunk to calculate statistics
export const calculateFuelStatistics = createAsyncThunk(
  'fuel/calculateStatistics',
  async (_, { getState }) => {
    const state = getState() as { fuel: FuelState };
    const records = state.fuel.fuelRecords;
    
    // Calculate basic statistics
    const totalFuelCost = records.reduce((sum, record) => sum + record.totalCost, 0);
    const totalLitres = records.reduce((sum, record) => sum + record.litres, 0);
    const averagePricePerLitre = totalLitres > 0 ? totalFuelCost / totalLitres : 0;
    
    const pendingRecords = records.filter(r => r.status === 'pending').length;
    const approvedRecords = records.filter(r => r.status === 'approved').length;
    const rejectedRecords = records.filter(r => r.status === 'rejected').length;
    
    // Calculate monthly data
    const monthlyData = records.reduce((acc, record) => {
      const month = new Date(record.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, cost: 0, litres: 0 };
      }
      acc[month].cost += record.totalCost;
      acc[month].litres += record.litres;
      return acc;
    }, {} as Record<string, { month: string; cost: number; litres: number }>);
    
    // Calculate vehicle efficiency
    const vehicleEfficiency = records.reduce((acc, record) => {
      if (!acc[record.vehicleId]) {
        acc[record.vehicleId] = {
          vehicleId: record.vehicleId,
          vehicleRegistration: record.vehicleRegistration,
          totalCost: 0,
          totalLitres: 0,
          averagePrice: 0,
        };
      }
      acc[record.vehicleId].totalCost += record.totalCost;
      acc[record.vehicleId].totalLitres += record.litres;
      acc[record.vehicleId].averagePrice = acc[record.vehicleId].totalCost / acc[record.vehicleId].totalLitres;
      return acc;
    }, {} as Record<string, { vehicleId: string; vehicleRegistration: string; totalCost: number; totalLitres: number; averagePrice: number }>);
    
    return {
      totalFuelCost,
      totalLitres,
      averagePricePerLitre,
      totalRecords: records.length,
      pendingRecords,
      approvedRecords,
      rejectedRecords,
      monthlyData: Object.values(monthlyData),
      vehicleEfficiency: Object.values(vehicleEfficiency),
    };
  }
);

const fuelSlice = createSlice({
  name: 'fuel',
  initialState,
  reducers: {
    addFuelRecord: (state, action: PayloadAction<FuelRecord>) => {
      state.fuelRecords.push(action.payload);
    },
    updateFuelRecord: (state, action: PayloadAction<Partial<FuelRecord> & { id: string }>) => {
      const index = state.fuelRecords.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.fuelRecords[index] = { ...state.fuelRecords[index], ...action.payload };
      }
    },
    deleteFuelRecord: (state, action: PayloadAction<string>) => {
      state.fuelRecords = state.fuelRecords.filter(record => record.id !== action.payload);
    },
    clearFuelError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add fuel record from driver
      .addCase(addFuelRecordFromDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFuelRecordFromDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.fuelRecords.push(action.payload);
      })
      .addCase(addFuelRecordFromDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add fuel record';
      })
      
      // Update fuel record status
      .addCase(updateFuelRecordStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFuelRecordStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.fuelRecords.findIndex(record => record.id === action.payload.recordId);
        if (index !== -1) {
          state.fuelRecords[index] = {
            ...state.fuelRecords[index],
            status: action.payload.status,
            approvedBy: action.payload.approvedBy,
            approvedDate: action.payload.approvedDate,
            notes: action.payload.notes,
          };
        }
      })
      .addCase(updateFuelRecordStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update fuel record status';
      })
      
      // Calculate statistics
      .addCase(calculateFuelStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculateFuelStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(calculateFuelStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to calculate statistics';
      });
  },
});

export const { addFuelRecord, updateFuelRecord, deleteFuelRecord, clearFuelError } = fuelSlice.actions;
export default fuelSlice.reducer;
