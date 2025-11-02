import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchAllDeliveryAddresses,
  fetchDeliveryAddressesByClient,
  createDeliveryAddress,
  updateDeliveryAddressRecord,
  deleteDeliveryAddressRecord,
  DeliveryAddressRecord,
  CreateDeliveryAddressInput,
} from '../../services/deliveryAddressesService';

export interface DeliveryAddress {
  id: string;
  name: string;
  clientId?: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DeliveryAddressFilters {
  searchTerm: string;
  city: string;
  postcode: string;
  isActive: boolean | null;
}

interface DeliveryAddressesState {
  addresses: DeliveryAddress[];
  filteredAddresses: DeliveryAddress[];
  filters: DeliveryAddressFilters;
  loading: boolean;
  error: string | null;
  selectedAddress: DeliveryAddress | null;
}

const initialState: DeliveryAddressesState = {
  addresses: [],
  filteredAddresses: [],
  filters: {
    searchTerm: '',
    city: '',
    postcode: '',
    isActive: null
  },
  loading: false,
  error: null,
  selectedAddress: null
};

// Async thunks
export const fetchDeliveryAddresses = createAsyncThunk(
  'deliveryAddresses/fetchAll',
  async (clientId?: string): Promise<DeliveryAddress[]> => {
    console.log('🔍 fetchDeliveryAddresses called with clientId:', clientId);
    
    const rows = clientId
      ? await fetchDeliveryAddressesByClient(clientId)
      : await fetchAllDeliveryAddresses();
    
    console.log('🔍 Raw addresses from database:', rows.map(r => ({
      id: r.id,
      name: r.name,
      clientId: r.clientId
    })));
    
    const mapped: DeliveryAddress[] = rows.map((r: DeliveryAddressRecord) => ({
      id: r.id,
      name: r.name,
      clientId: (r as any).clientId,
      address: r.address,
      coordinates: r.coordinates && r.coordinates.lat != null && r.coordinates.lng != null ? {
        lat: r.coordinates.lat as number,
        lng: r.coordinates.lng as number,
      } : undefined,
      contactPerson: r.contactPerson ?? undefined,
      contactPhone: r.contactPhone ?? undefined,
      deliveryInstructions: r.deliveryInstructions ?? undefined,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      createdBy: r.createdBy ?? 'system',
    }));
    
    console.log('🔍 Mapped addresses:', mapped.map(addr => ({
      id: addr.id,
      name: addr.name,
      clientId: addr.clientId
    })));
    
    return mapped;
  }
);

export const addDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/add',
  async (address: Omit<DeliveryAddress, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> & { clientId?: string }) => {
    const payload: CreateDeliveryAddressInput = {
      name: address.name,
      clientId: (address as any).clientId,
      address: address.address,
      contactPerson: address.contactPerson,
      contactPhone: address.contactPhone,
      deliveryInstructions: address.deliveryInstructions,
    };
    const created = await createDeliveryAddress(payload);
    const mapped: DeliveryAddress = {
      id: created.id,
      name: created.name,
      clientId: created.clientId,
      address: created.address,
      coordinates: created.coordinates && created.coordinates.lat != null && created.coordinates.lng != null ? {
        lat: created.coordinates.lat as number,
        lng: created.coordinates.lng as number,
      } : undefined,
      contactPerson: created.contactPerson ?? undefined,
      contactPhone: created.contactPhone ?? undefined,
      deliveryInstructions: created.deliveryInstructions ?? undefined,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      createdBy: created.createdBy ?? 'system',
    };
    return mapped;
  }
);

export const updateDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/update',
  async (address: DeliveryAddress) => {
    const updated = await updateDeliveryAddressRecord(address.id, {
      name: address.name,
      address: address.address,
      contactPerson: address.contactPerson,
      contactPhone: address.contactPhone,
      deliveryInstructions: address.deliveryInstructions,
    });
    const mapped: DeliveryAddress = {
      id: updated.id,
      name: updated.name,
      address: updated.address,
      coordinates: updated.coordinates && updated.coordinates.lat != null && updated.coordinates.lng != null ? {
        lat: updated.coordinates.lat as number,
        lng: updated.coordinates.lng as number,
      } : undefined,
      contactPerson: updated.contactPerson ?? undefined,
      contactPhone: updated.contactPhone ?? undefined,
      deliveryInstructions: updated.deliveryInstructions ?? undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      createdBy: updated.createdBy ?? 'system',
    };
    return mapped;
  }
);

export const deleteDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/delete',
  async (id: string) => {
    await deleteDeliveryAddressRecord(id);
    return id;
  }
);

const deliveryAddressesSlice = createSlice({
  name: 'deliveryAddresses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DeliveryAddressesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters
      state.filteredAddresses = state.addresses.filter(address => {
        const matchesSearch = !state.filters.searchTerm || 
          address.name.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ||
          address.address.line1.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ||
          address.address.town.toLowerCase().includes(state.filters.searchTerm.toLowerCase());
        
        const matchesCity = !state.filters.city || 
          address.address.city?.toLowerCase().includes(state.filters.city.toLowerCase());
        
        const matchesPostcode = !state.filters.postcode || 
          address.address.postcode.toLowerCase().includes(state.filters.postcode.toLowerCase());
        
        const matchesActive = state.filters.isActive === null || 
          address.isActive === state.filters.isActive;
        
        return matchesSearch && matchesCity && matchesPostcode && matchesActive;
      });
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredAddresses = state.addresses;
    },
    setSelectedAddress: (state, action: PayloadAction<DeliveryAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    resetState: (state) => {
      state.addresses = [];
      state.filteredAddresses = [];
      state.filters = initialState.filters;
      state.selectedAddress = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.filteredAddresses = action.payload;
      })
      .addCase(fetchDeliveryAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch delivery addresses';
      })
      .addCase(addDeliveryAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
        state.filteredAddresses.push(action.payload);
      })
      .addCase(updateDeliveryAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
          const filteredIndex = state.filteredAddresses.findIndex(addr => addr.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredAddresses[filteredIndex] = action.payload;
          }
        }
      })
      .addCase(deleteDeliveryAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        state.filteredAddresses = state.filteredAddresses.filter(addr => addr.id !== action.payload);
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  setSelectedAddress, 
  resetState 
} = deliveryAddressesSlice.actions;

export default deliveryAddressesSlice.reducer;
