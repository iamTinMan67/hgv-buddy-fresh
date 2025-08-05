import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WageSettings {
  id: string;
  driverId: string;
  driverName: string;
  standardHours: number; // Standard hours per week (e.g., 40)
  hourlyRate: number; // Standard hourly rate
  overtimeRate: number; // Overtime hourly rate
  standardStartTime: string; // Standard start time (e.g., "08:00")
  standardEndTime: string; // Standard end time (e.g., "16:00")
  isActive: boolean;
}

interface WageCalculation {
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  standardMinutes: number;
  overtimeMinutes: number;
  standardPay: number;
  overtimePay: number;
  totalPay: number;
}

interface WageState {
  wageSettings: WageSettings[];
  wageCalculations: WageCalculation[];
  loading: boolean;
}

const initialState: WageState = {
  wageSettings: [
    {
      id: '1',
      driverId: '1',
      driverName: 'John Driver',
      standardHours: 40,
      hourlyRate: 15.50,
      overtimeRate: 23.25, // 1.5x standard rate
      standardStartTime: '08:00',
      standardEndTime: '16:00',
      isActive: true,
    },
    {
      id: '2',
      driverId: '2',
      driverName: 'Jane Manager',
      standardHours: 40,
      hourlyRate: 18.00,
      overtimeRate: 27.00,
      standardStartTime: '08:00',
      standardEndTime: '16:00',
      isActive: true,
    },
  ],
  wageCalculations: [],
  loading: false,
};

const wageSlice = createSlice({
  name: 'wage',
  initialState,
  reducers: {
    addWageSetting: (state, action: PayloadAction<WageSettings>) => {
      state.wageSettings.push(action.payload);
    },
    updateWageSetting: (state, action: PayloadAction<WageSettings>) => {
      const index = state.wageSettings.findIndex(setting => setting.id === action.payload.id);
      if (index !== -1) {
        state.wageSettings[index] = action.payload;
      }
    },
    deleteWageSetting: (state, action: PayloadAction<string>) => {
      state.wageSettings = state.wageSettings.filter(setting => setting.id !== action.payload);
    },
    addWageCalculation: (state, action: PayloadAction<WageCalculation>) => {
      state.wageCalculations.push(action.payload);
    },
    updateWageCalculation: (state, action: PayloadAction<WageCalculation>) => {
      const index = state.wageCalculations.findIndex(calc => 
        calc.driverId === action.payload.driverId && calc.date === action.payload.date
      );
      if (index !== -1) {
        state.wageCalculations[index] = action.payload;
      } else {
        state.wageCalculations.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { 
  addWageSetting, 
  updateWageSetting, 
  deleteWageSetting, 
  addWageCalculation, 
  updateWageCalculation, 
  setLoading 
} = wageSlice.actions;

export default wageSlice.reducer; 