import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CompanyService } from '../../services/api';

export interface CompanyData {
  id: string;
  name: string;
  logo: string | null;
  address: {
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  description: string;
  lastUpdated: string;
}

interface CompanyState {
  data: CompanyData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  data: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCompany = createAsyncThunk(
  'company/fetchCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.getCompany();

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to fetch company data');
      }

      // Transform database format to app format
      return {
        id: response.data.id,
        name: response.data.name,
        logo: response.data.logo_url,
        address: {
          line1: response.data.address_line1,
          line2: response.data.address_line2 || '',
          city: response.data.city,
          postcode: response.data.postcode,
          country: response.data.country,
        },
        contact: {
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || '',
        },
        description: response.data.description || '',
        lastUpdated: response.data.updated_at,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch company data');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (companyData: Partial<CompanyData>, { rejectWithValue }) => {
    try {
      // Transform app format to database format
      const dbData = {
        name: companyData.name,
        logo_url: companyData.logo,
        description: companyData.description,
        address_line1: companyData.address?.line1,
        address_line2: companyData.address?.line2,
        city: companyData.address?.city,
        postcode: companyData.address?.postcode,
        country: companyData.address?.country,
        phone: companyData.contact?.phone,
        email: companyData.contact?.email,
        website: companyData.contact?.website,
      };

      const response = await CompanyService.updateCompany(dbData);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to update company data');
      }

      // Transform database format to app format
      return {
        id: response.data.id,
        name: response.data.name,
        logo: response.data.logo_url,
        address: {
          line1: response.data.address_line1,
          line2: response.data.address_line2 || '',
          city: response.data.city,
          postcode: response.data.postcode,
          country: response.data.country,
        },
        contact: {
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || '',
        },
        description: response.data.description || '',
        lastUpdated: response.data.updated_at,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update company data');
    }
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData: Omit<CompanyData, 'id' | 'lastUpdated'>, { rejectWithValue }) => {
    try {
      // Transform app format to database format
      const dbData = {
        name: companyData.name,
        logo_url: companyData.logo,
        description: companyData.description,
        address_line1: companyData.address.line1,
        address_line2: companyData.address.line2,
        city: companyData.address.city,
        postcode: companyData.address.postcode,
        country: companyData.address.country,
        phone: companyData.contact.phone,
        email: companyData.contact.email,
        website: companyData.contact.website,
      };

      const response = await CompanyService.createCompany(dbData);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to create company data');
      }

      // Transform database format to app format
      return {
        id: response.data.id,
        name: response.data.name,
        logo: response.data.logo_url,
        address: {
          line1: response.data.address_line1,
          line2: response.data.address_line2 || '',
          city: response.data.city,
          postcode: response.data.postcode,
          country: response.data.country,
        },
        contact: {
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || '',
        },
        description: response.data.description || '',
        lastUpdated: response.data.updated_at,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create company data');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyData: (state, action: PayloadAction<CompanyData>) => {
      state.data = action.payload;
      state.error = null;
    },
    updateCompanyInfo: (state, action: PayloadAction<Partial<CompanyData>>) => {
      if (state.data) {
        state.data = {
          ...state.data,
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        state.data = action.payload as CompanyData;
      }
      state.error = null;
    },
    clearCompanyData: (state) => {
      state.data = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch company
      .addCase(fetchCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCompanyData,
  updateCompanyInfo,
  clearCompanyData,
  setLoading,
  setError,
  clearError,
} = companySlice.actions;

export default companySlice.reducer;
