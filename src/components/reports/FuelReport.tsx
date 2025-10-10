import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  LocalGasStation,
  FilterList,
  PictureAsPdf,
  TableChart,
  GridOn,
  Home,
  Search,
      Clear,
    AttachMoney,
    Speed,
} from '@mui/icons-material';

interface FuelReportProps {
  onClose: () => void;
}

interface FuelRecord {
  id: string;
  vehicleRegistration: string;
  driverName: string;
  date: string;
  fuelType: 'Diesel' | 'Petrol' | 'AdBlue';
  quantity: number;
  costPerLitre: number;
  totalCost: number;
  mileage: number;
  mpg: number;
  location: string;
  supplier: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: 'driver' | 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security';
  type: 'driver' | 'staff';
}

const FuelReport: React.FC<FuelReportProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    vehicleRegistration: '',
    driverName: '',
    fuelType: '',
    supplier: '',
    startDate: '',
    endDate: '',
  });

  // Combined staff and driver data for dropdown
  const [staffMembers] = useState<StaffMember[]>([
    // Drivers
    { id: '1', name: 'John Smith', role: 'driver', type: 'driver' },
    { id: '2', name: 'Mike Johnson', role: 'driver', type: 'driver' },
    { id: '3', name: 'Lisa Driver', role: 'driver', type: 'driver' },
    { id: '4', name: 'Tom Wilson', role: 'driver', type: 'driver' },
    { id: '5', name: 'Sarah Brown', role: 'driver', type: 'driver' },
    // Staff
    { id: '6', name: 'Jane Manager', role: 'manager', type: 'staff' },
    { id: '7', name: 'Bob Manager', role: 'manager', type: 'staff' },
    { id: '8', name: 'Alice Mechanic', role: 'mechanic', type: 'staff' },
    { id: '9', name: 'Mike Mechanic', role: 'mechanic', type: 'staff' },
    { id: '10', name: 'Sarah Dispatcher', role: 'dispatcher', type: 'staff' },
    { id: '11', name: 'Tom Admin', role: 'admin', type: 'staff' },
    { id: '12', name: 'Sarah Johnson', role: 'manager', type: 'staff' },
    { id: '13', name: 'David Accountant', role: 'accountant', type: 'staff' },
    { id: '14', name: 'Emma HR', role: 'hr', type: 'staff' },
    { id: '15', name: 'Frank Receptionist', role: 'receptionist', type: 'staff' },
  ]);

  const [fuelRecords] = useState<FuelRecord[]>([
    {
      id: '1',
      vehicleRegistration: 'AB12 CDE',
      driverName: 'John Smith',
      date: '2025-01-15',
      fuelType: 'Diesel',
      quantity: 150,
      costPerLitre: 1.45,
      totalCost: 217.50,
      mileage: 125000,
      mpg: 8.5,
      location: 'London',
      supplier: 'BP',
    },
    {
      id: '2',
      vehicleRegistration: 'XY34 FGH',
      driverName: 'Mike Johnson',
      date: '2025-01-14',
      fuelType: 'Diesel',
      quantity: 120,
      costPerLitre: 1.42,
      totalCost: 170.40,
      mileage: 89000,
      mpg: 9.2,
      location: 'Manchester',
      supplier: 'Shell',
    },
    {
      id: '3',
      vehicleRegistration: 'AB12 CDE',
      driverName: 'Sarah Wilson',
      date: '2025-01-13',
      fuelType: 'AdBlue',
      quantity: 20,
      costPerLitre: 0.85,
      totalCost: 17.00,
      mileage: 124800,
      mpg: 8.5,
      location: 'Birmingham',
      supplier: 'Esso',
    },
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleRegistration: '',
      driverName: '',
      fuelType: '',
      supplier: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting fuel report as ${format.toUpperCase()}`);
    alert(`Fuel report exported as ${format.toUpperCase()}`);
  };

  const filteredFuelRecords = fuelRecords.filter(record => {
    if (filters.vehicleRegistration && !record.vehicleRegistration.toLowerCase().includes(filters.vehicleRegistration.toLowerCase())) return false;
    if (filters.driverName && !record.driverName.toLowerCase().includes(filters.driverName.toLowerCase())) return false;
    if (filters.fuelType && record.fuelType !== filters.fuelType) return false;
    if (filters.supplier && !record.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    return true;
  });

  const totalQuantity = filteredFuelRecords.reduce((sum, record) => sum + record.quantity, 0);
  const totalCost = filteredFuelRecords.reduce((sum, record) => sum + record.totalCost, 0);
  const averageMpg = filteredFuelRecords.length > 0 
    ? filteredFuelRecords.reduce((sum, record) => sum + record.mpg, 0) / filteredFuelRecords.length 
    : 0;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <LocalGasStation sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fuel Report
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Filter Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Vehicle Registration"
                value={filters.vehicleRegistration}
                onChange={(e) => handleFilterChange('vehicleRegistration', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Staff Name</InputLabel>
                <Select
                  value={filters.driverName}
                  label="Staff Name"
                  onChange={(e) => handleFilterChange('driverName', e.target.value)}
                >
                  <MenuItem value="">All Staff & Drivers</MenuItem>
                  <MenuItem value="drivers" disabled>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Drivers
                    </Typography>
                  </MenuItem>
                  {staffMembers.filter(member => member.type === 'driver').map((member) => (
                    <MenuItem key={member.id} value={member.name} sx={{ pl: 3 }}>
                      {member.name} - Driver
                    </MenuItem>
                  ))}
                  <MenuItem value="staff" disabled>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      Staff
                    </Typography>
                  </MenuItem>
                  {staffMembers.filter(member => member.type === 'staff').map((member) => (
                    <MenuItem key={member.id} value={member.name} sx={{ pl: 3 }}>
                      {member.name} - {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  value={filters.fuelType}
                  label="Fuel Type"
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Petrol">Petrol</MenuItem>
                  <MenuItem value="AdBlue">AdBlue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Supplier"
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              size="small"
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              size="small"
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Results ({filteredFuelRecords.length} records)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={() => handleExport('pdf')}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<TableChart />}
            onClick={() => handleExport('csv')}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<GridOn />}
            onClick={() => handleExport('excel')}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalGasStation sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {totalQuantity}L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Fuel Used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalCost.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {averageMpg.toFixed(1)} MPG
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Fuel Type</TableCell>
              <TableCell align="right">Quantity (L)</TableCell>
              <TableCell align="right">Cost/Litre</TableCell>
              <TableCell align="right">Total Cost</TableCell>
              <TableCell align="right">Mileage</TableCell>
              <TableCell align="right">MPG</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Supplier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFuelRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.vehicleRegistration}</TableCell>
                <TableCell>{record.driverName}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={record.fuelType}
                    color={record.fuelType === 'Diesel' ? 'primary' : record.fuelType === 'Petrol' ? 'secondary' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{record.quantity}</TableCell>
                <TableCell align="right">£{record.costPerLitre}</TableCell>
                <TableCell align="right">£{record.totalCost}</TableCell>
                <TableCell align="right">{record.mileage.toLocaleString()}</TableCell>
                <TableCell align="right">{record.mpg}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{record.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FuelReport;
