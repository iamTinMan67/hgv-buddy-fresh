import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Home,
  Print,
  DateRange,
  LocalShipping,
  DirectionsCar,
  Description,
  Search,
} from '@mui/icons-material';

interface ManifestsReportProps {
  onClose: () => void;
}

interface ManifestFilter {
  type: 'date' | 'vehicle' | 'fleet';
  date?: string;
  vehicleId?: string;
  fleetId?: string;
}

interface ManifestData {
  id: string;
  date: string;
  vehicle: string;
  driver: string;
  route: string;
  stops: number;
  status: 'pending' | 'in_progress' | 'completed';
}

const ManifestsReport: React.FC<ManifestsReportProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<ManifestFilter>({ type: 'date' });
  const [manifestData, setManifestData] = useState<ManifestData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockVehicles = [
    { id: 'v1', name: 'Truck 001', fleet: 'Main Fleet' },
    { id: 'v2', name: 'Truck 002', fleet: 'Main Fleet' },
    { id: 'v3', name: 'Van 001', fleet: 'Express Fleet' },
  ];

  const mockFleets = [
    { id: 'f1', name: 'Main Fleet' },
    { id: 'f2', name: 'Express Fleet' },
    { id: 'f3', name: 'Specialized Fleet' },
  ];

  const mockManifestData: ManifestData[] = [
    {
      id: 'm1',
      date: '2024-01-15',
      vehicle: 'Truck 001',
      driver: 'John Smith',
      route: 'London - Manchester - Birmingham',
      stops: 8,
      status: 'pending',
    },
    {
      id: 'm2',
      date: '2024-01-15',
      vehicle: 'Van 001',
      driver: 'Sarah Johnson',
      route: 'London - Oxford - Reading',
      stops: 5,
      status: 'in_progress',
    },
  ];

  const handleFilterChange = (field: keyof ManifestFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setManifestData(mockManifestData);
      setIsLoading(false);
    }, 1000);
  };

  const handlePrint = (manifestId: string) => {
    // Simulate printing
    console.log(`Printing manifest: ${manifestId}`);
    alert(`Printing manifest: ${manifestId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
          Manifests Report
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter Manifests
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={filter.type}
                  label="Filter Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="date">
                    <DateRange sx={{ mr: 1 }} />
                    By Date
                  </MenuItem>
                  <MenuItem value="vehicle">
                    <LocalShipping sx={{ mr: 1 }} />
                    By Vehicle
                  </MenuItem>
                  <MenuItem value="fleet">
                    <DirectionsCar sx={{ mr: 1 }} />
                    By Fleet
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {filter.type === 'date' && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Select Date"
                  value={filter.date || ''}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {filter.type === 'vehicle' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Vehicle</InputLabel>
                  <Select
                    value={filter.vehicleId || ''}
                    label="Select Vehicle"
                    onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                  >
                    {mockVehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.fleet}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {filter.type === 'fleet' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Fleet</InputLabel>
                  <Select
                    value={filter.fleetId || ''}
                    label="Select Fleet"
                    onChange={(e) => handleFilterChange('fleetId', e.target.value)}
                  >
                    {mockFleets.map((fleet) => (
                      <MenuItem key={fleet.id} value={fleet.id}>
                        {fleet.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSearch}
                disabled={isLoading}
                startIcon={<Search />}
              >
                {isLoading ? 'Searching...' : 'Search Manifests'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Section */}
      {manifestData.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Manifest Results ({manifestData.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => manifestData.forEach(m => handlePrint(m.id))}
              >
                Print All
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Stops</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {manifestData.map((manifest) => (
                    <TableRow key={manifest.id}>
                      <TableCell>{manifest.date}</TableCell>
                      <TableCell>{manifest.vehicle}</TableCell>
                      <TableCell>{manifest.driver}</TableCell>
                      <TableCell>{manifest.route}</TableCell>
                      <TableCell>{manifest.stops}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(manifest.status)}
                          color={getStatusColor(manifest.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<Print />}
                          onClick={() => handlePrint(manifest.id)}
                        >
                          Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {manifestData.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Use the filters above to search for manifests. No results will be displayed until you perform a search.
        </Alert>
      )}
    </Box>
  );
};

export default ManifestsReport;
