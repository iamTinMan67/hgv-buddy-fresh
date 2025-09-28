import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  PhotoCamera,
  Save,
  Home,
  Language,
  LocationOn,
  Phone,
  Email,
  Edit,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateCompany, fetchCompany, createCompany } from '../store/slices/companySlice';

interface CompanyInfoProps {
  onClose: () => void;
}

interface CompanyData {
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

const CompanyInfo: React.FC<CompanyInfoProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared TextField styling for white text
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
      '&.Mui-disabled': {
        color: 'white !important',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-focused': {
        color: 'primary.main',
      },
      '&.Mui-disabled': {
        color: 'rgba(255, 255, 255, 0.5)',
      },
    },
    '& .MuiInputBase-input': {
      color: 'white !important',
      '&.Mui-disabled': {
        color: 'white !important',
        WebkitTextFillColor: 'white !important',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'rgba(255, 255, 255, 0.5) !important',
    },
    '& input': {
      color: 'white !important',
      '&.Mui-disabled': {
        color: 'white !important',
        WebkitTextFillColor: 'white !important',
      },
    },
    '& textarea': {
      color: 'white !important',
      '&.Mui-disabled': {
        color: 'white !important',
        WebkitTextFillColor: 'white !important',
      },
    },
  };
  
  // Get company data from Redux store
  const { data: companyData, isLoading: isReduxLoading, error: reduxError } = useSelector((state: RootState) => state.company);
  
  const [formData, setFormData] = useState<CompanyData>({
    id: '1',
    name: '',
    logo: null,
    address: {
      line1: '',
      line2: '',
      city: '',
      postcode: '',
      country: 'UK',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    description: '',
    lastUpdated: new Date().toISOString(),
  });

  // Load company data on component mount
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
          // Supabase not configured, use localStorage only
          console.log('Supabase not configured, using localStorage');
          const storedData = localStorage.getItem('companyInfo');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setFormData(parsedData);
          }
          setIsLoading(false);
          return;
        }
        
        // Try to fetch from database first
        const result = await dispatch(fetchCompany());
        
        if (fetchCompany.fulfilled.match(result)) {
          // Data loaded successfully from database
          if (result.payload) {
            setFormData(result.payload);
          }
        } else if (fetchCompany.rejected.match(result)) {
          // No data in database, check localStorage as fallback
          const storedData = localStorage.getItem('companyInfo');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setFormData(parsedData);
            // Also save to database for future use
            dispatch(createCompany(parsedData));
          }
        }
      } catch (err) {
        console.error('Error loading company data:', err);
        setError('Failed to load company data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [dispatch]);

  // Update form data when Redux state changes
  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
    }
  }, [companyData]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyData],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          logo: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
        // Supabase not configured, use localStorage only
        console.log('Supabase not configured, saving to localStorage');
        localStorage.setItem('companyInfo', JSON.stringify(formData));
        setIsEditing(false);
        setShowSuccess(true);
        setIsLoading(false);
        return;
      }
      
      // Update company data
      console.log('Saving company data:', formData);
      const result = await dispatch(updateCompany(formData));
      
      if (updateCompany.fulfilled.match(result)) {
        console.log('Company saved successfully:', result.payload);
        setIsEditing(false);
        setShowSuccess(true);
        // Also save to localStorage as backup
        localStorage.setItem('companyInfo', JSON.stringify(formData));
      } else if (updateCompany.rejected.match(result)) {
        console.error('Company save failed:', result.payload);
        setError(result.payload as string || 'Failed to save company data');
      }
    } catch (err) {
      console.error('Error saving company data:', err);
      setError('Failed to save company data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyData || {
      id: '1',
      name: '',
      logo: null,
      address: {
        line1: '',
        line2: '',
        city: '',
        postcode: '',
        country: 'UK',
      },
      contact: {
        phone: '',
        email: '',
        website: '',
      },
      description: '',
      lastUpdated: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'yellow', mb: 2 }} />
        <Typography variant="h6">Loading company information...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          Company Information
        </Typography>
        <Box>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ mr: 2 }}
            >
              Edit
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ mr: 2, color: 'white', borderColor: 'white' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Company Logo Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
                Company Logo
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={formData.logo || undefined}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {!formData.logo && <Business />}
                </Avatar>
                
                {isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Upload Logo
                  </Button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Details Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
                Company Details
              </Typography>
              
              <Grid container spacing={3}>
                {/* Company Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="primary" />
                        </InputAdornment>
                      ),
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Company Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Brief description of your company..."
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Address Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                Address
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={formData.address.line1}
                    onChange={(e) => handleInputChange('address.line1', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    value={formData.address.line2}
                    onChange={(e) => handleInputChange('address.line2', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postcode"
                    value={formData.address.postcode}
                    onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
                Contact Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.contact.website}
                    onChange={(e) => handleInputChange('contact.website', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Language color="primary" />
                        </InputAdornment>
                      ),
                      style: { 
                        color: 'white',
                        WebkitTextFillColor: 'white',
                      },
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          Company information updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyInfo;
