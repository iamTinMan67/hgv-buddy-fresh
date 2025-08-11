import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchDeliveryAddresses,
  addDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setFilters,
  clearFilters,
  DeliveryAddress,
  DeliveryAddressFilters
} from '../store/slices/deliveryAddressesSlice';

interface DeliveryAddressesProps {
  onSelectAddress?: (address: DeliveryAddress) => void;
  selectionMode?: boolean;
}

const DeliveryAddresses: React.FC<DeliveryAddressesProps> = ({
  onSelectAddress,
  selectionMode = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, filteredAddresses, filters, loading, error } = useSelector(
    (state: RootState) => state.deliveryAddresses
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState<Omit<DeliveryAddress, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: {
      line1: '',
      line2: '',
      line3: '',
      town: '',
      city: '',
      postcode: ''
    },
    coordinates: undefined,
    contactPerson: '',
    contactPhone: '',
    deliveryInstructions: '',
    isActive: true,
    createdBy: 'admin'
  });

  useEffect(() => {
    dispatch(fetchDeliveryAddresses());
  }, [dispatch]);

  const handleOpenDialog = (address?: DeliveryAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        address: address.address,
        coordinates: address.coordinates,
        contactPerson: address.contactPerson || '',
        contactPhone: address.contactPhone || '',
        deliveryInstructions: address.deliveryInstructions || '',
        isActive: address.isActive,
        createdBy: address.createdBy
      });
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        address: {
          line1: '',
          line2: '',
          line3: '',
          town: '',
          city: '',
          postcode: ''
        },
        coordinates: undefined,
        contactPerson: '',
        contactPhone: '',
        deliveryInstructions: '',
        isActive: true,
        createdBy: 'admin'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      address: {
        line1: '',
        line2: '',
        line3: '',
        town: '',
        city: '',
        postcode: ''
      },
      coordinates: undefined,
      contactPerson: '',
      contactPhone: '',
      deliveryInstructions: '',
      isActive: true,
      createdBy: 'admin'
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingAddress) {
        await dispatch(updateDeliveryAddress({
          ...editingAddress,
          ...formData
        })).unwrap();
      } else {
        await dispatch(addDeliveryAddress(formData)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save delivery address:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery address?')) {
      try {
        await dispatch(deleteDeliveryAddress(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete delivery address:', error);
      }
    }
  };

  const handleFilterChange = (field: keyof DeliveryAddressFilters, value: any) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSelectAddress = (address: DeliveryAddress) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Delivery Addresses
            </Typography>
            {!selectionMode && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: 'primary.main' }}
              >
                Add New Address
              </Button>
            )}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Addresses"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'grey.400' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'grey.400' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Postcode"
                  value={filters.postcode}
                  onChange={(e) => handleFilterChange('postcode', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'grey.400' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'grey.400' }}>Status</InputLabel>
                  <Select
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  >
                    <MenuItem value={null}>All</MenuItem>
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{ color: 'grey.400', borderColor: 'grey.600' }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Addresses Table */}
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAddresses.map((address) => (
                  <TableRow key={address.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ color: 'primary.main' }} />
                        {address.name}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Typography variant="body2">{address.address.line1}</Typography>
                        {address.address.line2 && (
                          <Typography variant="body2" sx={{ color: 'grey.400' }}>
                            {address.address.line2}
                          </Typography>
                        )}
                        {address.address.line3 && (
                          <Typography variant="body2" sx={{ color: 'grey.400' }}>
                            {address.address.line3}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: 'grey.400' }}>
                          {address.address.town}
                          {address.address.city && `, ${address.address.city}`}
                          {`, ${address.address.postcode}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        {address.contactPerson && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2">{address.contactPerson}</Typography>
                          </Box>
                        )}
                        {address.contactPhone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2">{address.contactPhone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={address.isActive ? 'Active' : 'Inactive'}
                        color={address.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {selectionMode ? (
                          <Tooltip title="Select Address">
                            <IconButton
                              size="small"
                              onClick={() => handleSelectAddress(address)}
                              sx={{ color: 'success.main' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="View Address">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(address)}
                                sx={{ color: 'info.main' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Address">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(address)}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Address">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(address.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAddresses.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'grey.400' }}>
                No delivery addresses found matching the current filters
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: 'white', backgroundColor: 'grey.800' }}>
          {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'grey.800', pt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    sx={{ color: 'primary.main' }}
                  />
                }
                label="Active"
                sx={{ color: 'white' }}
              />
            </Grid>

            {/* Address Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'grey.600' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Address Details
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.address.line1}
                onChange={(e) => handleInputChange('address.line1', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={formData.address.line2}
                onChange={(e) => handleInputChange('address.line2', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 3"
                value={formData.address.line3}
                onChange={(e) => handleInputChange('address.line3', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Town"
                value={formData.address.town}
                onChange={(e) => handleInputChange('address.town', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postcode"
                value={formData.address.postcode}
                onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'grey.600' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Instructions"
                value={formData.deliveryInstructions}
                onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'grey.800' }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'grey.400' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim() || !formData.address.line1.trim() || !formData.address.town.trim() || !formData.address.postcode.trim()}
            sx={{ bgcolor: 'primary.main' }}
          >
            {editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryAddresses;
