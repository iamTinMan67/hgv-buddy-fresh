import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wageReducer from './slices/wageSlice';
import vehicleReducer from './slices/vehicleSlice';
import jobReducer from './slices/jobSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wage: wageReducer,
    vehicle: vehicleReducer,
    job: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;