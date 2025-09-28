import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wageReducer from './slices/wageSlice';
import vehicleReducer from './slices/vehicleSlice';
import jobReducer from './slices/jobSlice';
import fuelReducer from './slices/fuelSlice';
import driverVehicleAllocationReducer from './slices/driverVehicleAllocationSlice';
import deliveryAddressesReducer from './slices/deliveryAddressesSlice';
import companyReducer from './slices/companySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wage: wageReducer,
    vehicle: vehicleReducer,
    job: jobReducer,
    fuel: fuelReducer,
    driverVehicleAllocation: driverVehicleAllocationReducer,
    deliveryAddresses: deliveryAddressesReducer,
    company: companyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;