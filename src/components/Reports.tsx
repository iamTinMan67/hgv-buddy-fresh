import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Print,
  Visibility,
  TrendingUp,
  Person,
  CalendarToday,
  DirectionsCar,
  Receipt,
  Assessment,
  FileDownload,
  Home,
} from '@mui/icons-material';

interface ReportsProps {
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface WageSlip {
  id: string;
  driverId: string;
  driverName: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  hourlyRate: number;
  totalPay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

interface FuelRecord {
  id: string;
  date: string;
  vehicleId: string;
  vehicleRegistration: string;
  driverId: string;
  driverName: string;
  odometerReading: number;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  receiptNumber: string;
  fuelStation: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface VehicleFuelConsumption {
  vehicleId: string;
  vehicleRegistration: string;
  startDate: string;
  endDate: string;
  startOdometer: number;
  endOdometer: number;
  totalDistance: number;
  totalLitres: number;
  totalCost: number;
  averageConsumption: number; // litres per 100km
  costPerKm: number;
  records: FuelRecord[];
}

const Reports: React.FC<ReportsProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState('');
  const [fuelStartDate, setFuelStartDate] = useState('');
  const [fuelEndDate, setFuelEndDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showWageSlipDialog, setShowWageSlipDialog] = useState(false);
  const [showFuelReportDialog, setShowFuelReportDialog] = useState(false);
  const [selectedWageSlip, setSelectedWageSlip] = useState<WageSlip | null>(null);
  const [selectedFuelReport, setSelectedFuelReport] = useState<VehicleFuelConsumption | null>(null);

  // Mock wage slip data
  const [wageSlips] = useState<WageSlip[]>([
    {
      id: '1',
      driverId: 'EMP001',
      driverName: 'Adam Mustafa',
      weekNumber: 1,
      weekStartDate: '2024-01-01',
      weekEndDate: '2024-01-07',
      totalHours: 45.5,
      hourlyRate: 15.50,
      totalPay: 705.25,
      deductions: 0,
      netPay: 705.25,
      status: 'paid',
      paidDate: '2024-01-08',
    },
    {
      id: '2',
      driverId: 'EMP002',
      driverName: 'Jane Manager',
      weekNumber: 1,
      weekStartDate: '2024-01-01',
      weekEndDate: '2024-01-07',
      totalHours: 42.0,
      hourlyRate: 16.00,
      totalPay: 672.00,
      deductions: 0,
      netPay: 672.00,
      status: 'paid',
      paidDate: '2024-01-08',
    },
    {
      id: '3',
      driverId: 'EMP001',
      driverName: 'Adam Mustafa',
      weekNumber: 2,
      weekStartDate: '2024-01-08',
      weekEndDate: '2024-01-14',
      totalHours: 48.0,
      hourlyRate: 15.50,
      totalPay: 744.00,
      deductions: 0,
      netPay: 744.00,
      status: 'pending',
    },
    {
      id: '4',
      driverId: 'EMP003',
      driverName: 'Mike Wilson',
      weekNumber: 1,
      weekStartDate: '2024-01-01',
      weekEndDate: '2024-01-07',
      totalHours: 38.5,
      hourlyRate: 14.75,
      totalPay: 567.88,
      deductions: 0,
      netPay: 567.88,
      status: 'overdue',
    },
  ]);

  // Mock fuel records data
  const [fuelRecords] = useState<FuelRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP001',
      driverName: 'Adam Mustafa',
      odometerReading: 125450,
      litres: 150.5,
      pricePerLitre: 1.85,
      totalCost: 278.43,
      receiptNumber: 'REC-2024-001',
      fuelStation: 'BP Fuel Station - London',
      status: 'approved',
    },
    {
      id: '2',
      date: '2024-01-10',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP001',
      driverName: 'Adam Mustafa',
      odometerReading: 125200,
      litres: 180.0,
      pricePerLitre: 1.88,
      totalCost: 338.40,
      receiptNumber: 'REC-2024-002',
      fuelStation: 'Esso Station - Birmingham',
      status: 'approved',
    },
    {
      id: '3',
      date: '2024-01-05',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP002',
      driverName: 'Jane Manager',
      odometerReading: 124950,
      litres: 165.0,
      pricePerLitre: 1.82,
      totalCost: 300.30,
      receiptNumber: 'REC-2024-003',
      fuelStation: 'Shell Station - Manchester',
      status: 'approved',
    },
    {
      id: '4',
      date: '2024-01-20',
      vehicleId: 'HGV002',
      vehicleRegistration: 'XY34 FGH',
      driverId: 'EMP002',
      driverName: 'Jane Manager',
      odometerReading: 98750,
      litres: 120.0,
      pricePerLitre: 1.82,
      totalCost: 218.40,
      receiptNumber: 'REC-2024-004',
      fuelStation: 'Shell Station - Manchester',
      status: 'approved',
    },
    {
      id: '5',
      date: '2024-01-12',
      vehicleId: 'HGV002',
      vehicleRegistration: 'XY34 FGH',
      driverId: 'EMP003',
      driverName: 'Mike Wilson',
      odometerReading: 98630,
      litres: 95.5,
      pricePerLitre: 1.80,
      totalCost: 171.90,
      receiptNumber: 'REC-2024-005',
      fuelStation: 'Tesco Fuel - Leeds',
      status: 'approved',
    },
  ]);

  // Mock vehicles data
  const [vehicles] = useState([
    { id: 'HGV001', registration: 'AB12 CDE' },
    { id: 'HGV002', registration: 'XY34 FGH' },
    { id: 'HGV003', registration: 'PQ56 RST' },
  ]);

  // Mock drivers data
  const [drivers] = useState([
    { id: 'EMP001', name: 'Adam Mustafa' },
    { id: 'EMP002', name: 'Jane Manager' },
    { id: 'EMP003', name: 'Mike Wilson' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <Receipt />;
      case 'pending': return <Assessment />;
      case 'overdue': return <TrendingUp />;
      default: return <Assessment />;
    }
  };

  // Filter wage slips based on search criteria
  const filteredWageSlips = wageSlips.filter(slip => {
    const driverMatch = !selectedDriver || slip.driverId === selectedDriver;
    const weekMatch = !selectedWeek || slip.weekStartDate === selectedWeek;
    const weekNumberMatch = !selectedWeekNumber || slip.weekNumber.toString() === selectedWeekNumber;
    return driverMatch && weekMatch && weekNumberMatch;
  });

  // Calculate fuel consumption for vehicles
  const calculateFuelConsumption = (): VehicleFuelConsumption[] => {
    const vehicleConsumption: Record<string, VehicleFuelConsumption> = {};

    // Group fuel records by vehicle
    fuelRecords.forEach(record => {
      if (!vehicleConsumption[record.vehicleId]) {
        vehicleConsumption[record.vehicleId] = {
          vehicleId: record.vehicleId,
          vehicleRegistration: record.vehicleRegistration,
          startDate: record.date,
          endDate: record.date,
          startOdometer: record.odometerReading,
          endOdometer: record.odometerReading,
          totalDistance: 0,
          totalLitres: 0,
          totalCost: 0,
          averageConsumption: 0,
          costPerKm: 0,
          records: [],
        };
      }

      const consumption = vehicleConsumption[record.vehicleId];
      consumption.records.push(record);
      consumption.totalLitres += record.litres;
      consumption.totalCost += record.totalCost;

      // Update date range
      if (record.date < consumption.startDate) {
        consumption.startDate = record.date;
        consumption.startOdometer = record.odometerReading;
      }
      if (record.date > consumption.endDate) {
        consumption.endDate = record.date;
        consumption.endOdometer = record.odometerReading;
      }
    });

    // Calculate consumption metrics
    Object.values(vehicleConsumption).forEach(consumption => {
      consumption.totalDistance = consumption.endOdometer - consumption.startOdometer;
      consumption.averageConsumption = consumption.totalDistance > 0 
        ? (consumption.totalLitres / consumption.totalDistance) * 100 
        : 0;
      consumption.costPerKm = consumption.totalDistance > 0 
        ? consumption.totalCost / consumption.totalDistance 
        : 0;
    });

    return Object.values(vehicleConsumption);
  };

  const vehicleFuelConsumption = calculateFuelConsumption();

  // Filter fuel consumption by date range and vehicle
  const filteredFuelConsumption = vehicleFuelConsumption.filter(consumption => {
    const vehicleMatch = !selectedVehicle || consumption.vehicleId === selectedVehicle;
    const startDateMatch = !fuelStartDate || consumption.startDate >= fuelStartDate;
    const endDateMatch = !fuelEndDate || consumption.endDate <= fuelEndDate;
    return vehicleMatch && startDateMatch && endDateMatch;
  });

  const handlePrintWageSlip = (wageSlip: WageSlip) => {
    setSelectedWageSlip(wageSlip);
    setShowWageSlipDialog(true);
  };

  const handleViewFuelReport = (consumption: VehicleFuelConsumption) => {
    setSelectedFuelReport(consumption);
    setShowFuelReportDialog(true);
  };

  const handlePrintFuelReport = (consumption: VehicleFuelConsumption) => {
    // In a real application, this would generate and print a PDF
    console.log('Printing fuel report for vehicle:', consumption.vehicleRegistration);
    alert(`Printing fuel report for ${consumption.vehicleRegistration}`);
  };

  const handlePrintAllWageSlips = () => {
    // In a real application, this would generate and print all wage slips
    console.log('Printing all wage slips');
    alert(`Printing ${filteredWageSlips.length} wage slips`);
  };

  const handleExportFuelReport = () => {
    // In a real application, this would export to CSV/Excel
    console.log('Exporting fuel report');
    alert('Exporting fuel consumption report to CSV');
  };

  return (
    <Box sx={{ py: 2, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'white',
              '&.Mui-selected': {
                color: 'yellow',
              },
              '&:hover': {
                color: 'yellow',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'yellow',
            }
          }}
        >
          <Tab label="Wage Slips" />
          <Tab label="Fuel Consumption" />
        </Tabs>
      </Box>

      {/* Wage Slips Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Wage Slip Reports
            </Typography>
            
            {/* Search Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Driver</InputLabel>
                  <Select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">All Drivers</MenuItem>
                    {drivers.map(driver => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Week Start Date"
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Week Number"
                  value={selectedWeekNumber}
                  onChange={(e) => setSelectedWeekNumber(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assessment />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrintAllWageSlips}
                  sx={{ height: 56 }}
                >
                  Print All
                </Button>
              </Grid>
            </Grid>

            {/* Results Summary */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Found {filteredWageSlips.length} wage slip(s) matching your criteria
            </Alert>

            {/* Wage Slips Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Driver</TableCell>
                    <TableCell>Week #</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Total Pay</TableCell>
                    <TableCell>Net Pay</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWageSlips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'primary.main' }} />
                          {slip.driverName}
                        </Box>
                      </TableCell>
                      <TableCell>Week {slip.weekNumber}</TableCell>
                      <TableCell>
                        {new Date(slip.weekStartDate).toLocaleDateString()} - {new Date(slip.weekEndDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{slip.totalHours}h</TableCell>
                      <TableCell>£{slip.hourlyRate}</TableCell>
                      <TableCell>£{slip.totalPay.toFixed(2)}</TableCell>
                      <TableCell>£{slip.netPay.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(slip.status)}
                          label={slip.status} 
                          color={getStatusColor(slip.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Print Wage Slip">
                          <IconButton onClick={() => handlePrintWageSlip(slip)}>
                            <Print />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton>
                            <FileDownload />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Fuel Consumption Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fuel Consumption Reports
            </Typography>
            
            {/* Search Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <DirectionsCar />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">All Vehicles</MenuItem>
                    {vehicles.map(vehicle => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={fuelStartDate}
                  onChange={(e) => setFuelStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={fuelEndDate}
                  onChange={(e) => setFuelEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={handleExportFuelReport}
                  sx={{ height: 56 }}
                >
                  Export Report
                </Button>
              </Grid>
            </Grid>

            {/* Results Summary */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Found {filteredFuelConsumption.length} vehicle(s) with fuel consumption data
            </Alert>

            {/* Fuel Consumption Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Distance (km)</TableCell>
                    <TableCell>Fuel Used (L)</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Consumption (L/100km)</TableCell>
                    <TableCell>Cost per km</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFuelConsumption.map((consumption) => (
                    <TableRow key={consumption.vehicleId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                          {consumption.vehicleRegistration}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(consumption.startDate).toLocaleDateString()} - {new Date(consumption.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{consumption.totalDistance.toLocaleString()}</TableCell>
                      <TableCell>{consumption.totalLitres.toFixed(1)}L</TableCell>
                      <TableCell>£{consumption.totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${consumption.averageConsumption.toFixed(1)} L/100km`}
                          color={consumption.averageConsumption > 35 ? 'error' : consumption.averageConsumption > 30 ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>£{consumption.costPerKm.toFixed(3)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton onClick={() => handleViewFuelReport(consumption)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Report">
                          <IconButton onClick={() => handlePrintFuelReport(consumption)}>
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Wage Slip Print Dialog */}
      <Dialog 
        open={showWageSlipDialog} 
        onClose={() => setShowWageSlipDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Wage Slip - {selectedWageSlip?.driverName}
        </DialogTitle>
        <DialogContent>
          {selectedWageSlip && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    HGV Buddy - Wage Slip
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employee Name</Typography>
                  <Typography variant="body1">{selectedWageSlip.driverName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                  <Typography variant="body1">{selectedWageSlip.driverId}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Pay Period</Typography>
                  <Typography variant="body1">
                    Week {selectedWageSlip.weekNumber} ({new Date(selectedWageSlip.weekStartDate).toLocaleDateString()} - {new Date(selectedWageSlip.weekEndDate).toLocaleDateString()})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    icon={getStatusIcon(selectedWageSlip.status)}
                    label={selectedWageSlip.status} 
                    color={getStatusColor(selectedWageSlip.status)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="h6">{selectedWageSlip.totalHours}h</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Hourly Rate</Typography>
                  <Typography variant="h6">£{selectedWageSlip.hourlyRate}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Gross Pay</Typography>
                  <Typography variant="h6">£{selectedWageSlip.totalPay.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Deductions</Typography>
                  <Typography variant="h6">£{selectedWageSlip.deductions.toFixed(2)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h5" color="primary">
                    Net Pay: £{selectedWageSlip.netPay.toFixed(2)}
                  </Typography>
                </Grid>
                
                {selectedWageSlip.paidDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Paid on: {new Date(selectedWageSlip.paidDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWageSlipDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => {
            alert('Printing wage slip...');
            setShowWageSlipDialog(false);
          }}>
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fuel Report Dialog */}
      <Dialog 
        open={showFuelReportDialog} 
        onClose={() => setShowFuelReportDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Fuel Consumption Report - {selectedFuelReport?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          {selectedFuelReport && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    Vehicle Fuel Consumption Report
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                  <Typography variant="body1">{selectedFuelReport.vehicleRegistration}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Period</Typography>
                  <Typography variant="body1">
                    {new Date(selectedFuelReport.startDate).toLocaleDateString()} - {new Date(selectedFuelReport.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Start Odometer</Typography>
                  <Typography variant="body1">{selectedFuelReport.startOdometer.toLocaleString()} km</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">End Odometer</Typography>
                  <Typography variant="body1">{selectedFuelReport.endOdometer.toLocaleString()} km</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Total Distance</Typography>
                  <Typography variant="h6">{selectedFuelReport.totalDistance.toLocaleString()} km</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Fuel Used</Typography>
                  <Typography variant="h6">{selectedFuelReport.totalLitres.toFixed(1)}L</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h6">£{selectedFuelReport.totalCost.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Consumption</Typography>
                  <Typography variant="h6">{selectedFuelReport.averageConsumption.toFixed(1)} L/100km</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Fuel Records
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Driver</TableCell>
                          <TableCell>Odometer</TableCell>
                          <TableCell>Litres</TableCell>
                          <TableCell>Price/L</TableCell>
                          <TableCell>Total Cost</TableCell>
                          <TableCell>Station</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFuelReport.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.driverName}</TableCell>
                            <TableCell>{record.odometerReading.toLocaleString()}</TableCell>
                            <TableCell>{record.litres}L</TableCell>
                            <TableCell>£{record.pricePerLitre}</TableCell>
                            <TableCell>£{record.totalCost.toFixed(2)}</TableCell>
                            <TableCell>{record.fuelStation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFuelReportDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => {
            alert('Printing fuel report...');
            setShowFuelReportDialog(false);
          }}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 