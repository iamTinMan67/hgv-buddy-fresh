import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface VehicleCheck {
  id: string;
  date: string;
  status: 'completed' | 'issue';
  notes: string;
}

interface VehicleChecksState {
  checks: VehicleCheck[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleChecksState = {
  checks: [
    { id: '1', date: '2024-06-01', status: 'completed', notes: 'All good' },
    { id: '2', date: '2024-05-31', status: 'completed', notes: 'Tyre pressure low' },
    { id: '3', date: '2024-05-30', status: 'issue', notes: 'Brake warning light on' },
  ],
  loading: false,
  error: null,
};

export const fetchVehicleChecks = createAsyncThunk(
  'vehicleChecks/fetchVehicleChecks',
  async (_, { rejectWithValue }) => {
    // TODO: Replace with real API call
    return initialState.checks;
  }
);

export const submitVehicleCheck = createAsyncThunk(
  'vehicleChecks/submitVehicleCheck',
  async (check: Omit<VehicleCheck, 'id'>, { rejectWithValue }) => {
    // TODO: Replace with real API call
    return { ...check, id: Date.now().toString() };
  }
);

const vehicleChecksSlice = createSlice({
  name: 'vehicleChecks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleChecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleChecks.fulfilled, (state, action) => {
        state.loading = false;
        state.checks = action.payload;
      })
      .addCase(fetchVehicleChecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitVehicleCheck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVehicleCheck.fulfilled, (state, action) => {
        state.loading = false;
        state.checks = [action.payload, ...state.checks];
      })
      .addCase(submitVehicleCheck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default vehicleChecksSlice.reducer;