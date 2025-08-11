import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface DeliveryAddress {
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
  async () => {
    // In a real app, this would be an API call
    // For now, return mock data
    const mockAddresses: DeliveryAddress[] = [
      {
        id: '1',
        name: 'Main Warehouse',
        address: {
          line1: '123 Industrial Estate',
          line2: 'Unit 15',
          line3: '',
          town: 'Manchester',
          city: 'Manchester',
          postcode: 'M1 1AA'
        },
        coordinates: { lat: 53.4808, lng: -2.2426 },
        contactPerson: 'John Smith',
        contactPhone: '0161 123 4567',
        deliveryInstructions: 'Deliver to loading bay 3',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      },
      {
        id: '2',
        name: 'Distribution Center',
        address: {
          line1: '456 Logistics Park',
          line2: 'Building B',
          line3: 'Floor 2',
          town: 'Birmingham',
          city: 'Birmingham',
          postcode: 'B1 1BB'
        },
        coordinates: { lat: 52.4862, lng: -1.8904 },
        contactPerson: 'Sarah Johnson',
        contactPhone: '0121 234 5678',
        deliveryInstructions: 'Security code required at gate',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      }
    ];
    return mockAddresses;
  }
);

export const addDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/add',
  async (address: Omit<DeliveryAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAddress: DeliveryAddress = {
      ...address,
      id: `addr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newAddress;
  }
);

export const updateDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/update',
  async (address: DeliveryAddress) => {
    const updatedAddress: DeliveryAddress = {
      ...address,
      updatedAt: new Date().toISOString()
    };
    return updatedAddress;
  }
);

export const deleteDeliveryAddress = createAsyncThunk(
  'deliveryAddresses/delete',
  async (id: string) => {
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
