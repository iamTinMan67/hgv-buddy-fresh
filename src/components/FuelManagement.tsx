import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { updateFuelRecordStatus, calculateFuelStatistics, addFuelRecordFromDriver, FuelRecord } from '../store/slices/fuelSlice';
import InteractiveStatusChip, { StatusOption } from './InteractiveStatusChip';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
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
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Menu,
} from '@mui/material';
import {
  LocalGasStation,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Warning,
  Error,
  Info,
  Download,
  Visibility,
  Add,
  DirectionsCar,
  Person,
  LocationOn,
  MoreVert,
  Home,
} from '@mui/icons-material';

interface FuelManagementProps {
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
      id={`fuel-tabpanel-${index}`}
      aria-labelledby={`fuel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}



const FuelManagement: React.FC<FuelManagementProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fuelRecords, statistics, loading } = useSelector((state: RootState) => state.fuel);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);
  const [newFuelRecord, setNewFuelRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    vehicleRegistration: '',
    driverId: '',
    driverName: '',
    odometerReading: 0,
    litres: 0,
    pricePerLitre: 0,
    totalCost: 0,
    receiptNumber: '',
    fuelStation: '',
    notes: '',
  });



  // Calculate statistics when component mounts or fuel records change
  useEffect(() => {
    dispatch(calculateFuelStatistics());
  }, [dispatch, fuelRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'rejected': return <Error />;
      default: return <Info />;
    }
  };



  const handleAddRecord = () => {
    setShowAddDialog(true);
  };

  const handleSaveFuelRecord = () => {
    const fuelData = {
      ...newFuelRecord,
      totalCost: newFuelRecord.litres * newFuelRecord.pricePerLitre,
      receiptNumber: newFuelRecord.receiptNumber || `REC-${Date.now()}`,
      uploadedBy: user?.id || 'EMP001',
    };

    dispatch(addFuelRecordFromDriver(fuelData));
    setShowAddDialog(false);
    setNewFuelRecord({
      date: new Date().toISOString().split('T')[0],
      vehicleId: '',
      vehicleRegistration: '',
      driverId: '',
      driverName: '',
      odometerReading: 0,
      litres: 0,
      pricePerLitre: 0,
      totalCost: 0,
      receiptNumber: '',
      fuelStation: '',
      notes: '',
    });
  };

  const openViewDialog = (record: FuelRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };



  const getStatusOptions = (): StatusOption[] => [
    { value: 'approved', label: 'Approved', icon: <CheckCircle />, color: 'success' },
    { value: 'rejected', label: 'Rejected', icon: <Error />, color: 'error' },
  ];

  const totalFuelCost = statistics.totalFuelCost;
  const totalLitres = statistics.totalLitres;
  const averagePricePerLitre = statistics.averagePricePerLitre;
  const pendingRecordsCount = statistics.pendingRecords;

  // Calculate fuel efficiency for each vehicle
  const vehicleEfficiency = fuelRecords.reduce((acc, record) => {
    if (!acc[record.vehicleId]) {
      acc[record.vehicleId] = {
        vehicleId: record.vehicleId,
        registration: record.vehicleRegistration,
        totalLitres: 0,
        totalCost: 0,
        records: 0,
      };
    }
    acc[record.vehicleId].totalLitres += record.litres;
    acc[record.vehicleId].totalCost += record.totalCost;
    acc[record.vehicleId].records += 1;
    return acc;
  }, {} as Record<string, any>);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fuel Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddRecord}
            sx={{ mr: 1 }}
          >
            Add Fuel Record
          </Button>
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
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
          <Tab label="All Records" />
          <Tab label="Vehicle Analysis" />
          <Tab label="Driver Analysis" />
          <Tab label="Cost Analysis" />
        </Tabs>
      </Box>

      {/* All Records Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Odometer</TableCell>
                <TableCell>Litres</TableCell>
                <TableCell>Price/Litre</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fuelRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.vehicleRegistration}</TableCell>
                  <TableCell>{record.driverName}</TableCell>
                  <TableCell>{record.odometerReading?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>{record.litres}L</TableCell>
                  <TableCell>£{record.pricePerLitre}</TableCell>
                  <TableCell>£{record.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <InteractiveStatusChip
                      status={record.status}
                      statusIcon={getStatusIcon(record.status)}
                      statusColor={getStatusColor(record.status)}
                      statusOptions={getStatusOptions()}
                      onStatusChange={(newStatus) => {
                        if (newStatus === 'approved' || newStatus === 'rejected') {
                          dispatch(updateFuelRecordStatus({
                            recordId: record.id,
                            status: newStatus as 'approved' | 'rejected',
                            approvedBy: user?.id || 'EMP001',
                          }));
                        }
                      }}
                      disabled={record.status === 'approved' || record.status === 'rejected'}
                      tooltipText={record.status === 'pending' ? 'Click to approve or reject' : 'Status cannot be changed'}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => openViewDialog(record)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {record.receiptImage && (
                      <Tooltip title="Download Receipt">
                        <IconButton>
                          <Download />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Vehicle Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {Object.values(vehicleEfficiency).map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.vehicleId}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {vehicle.registration}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Fuel Used
                      </Typography>
                      <Typography variant="h6">
                        {vehicle.totalLitres.toFixed(1)}L
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Cost
                      </Typography>
                      <Typography variant="h6">
                        £{vehicle.totalCost.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Records
                      </Typography>
                      <Typography variant="h6">
                        {vehicle.records}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Cost/Litre
                      </Typography>
                      <Typography variant="h6">
                        £{(vehicle.totalCost / vehicle.totalLitres).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Driver Analysis Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Driver Fuel Consumption
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Driver</TableCell>
                        <TableCell>Total Litres</TableCell>
                        <TableCell>Total Cost</TableCell>
                        <TableCell>Records</TableCell>
                        <TableCell>Avg Cost/Litre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fuelRecords.reduce((acc, record) => {
                        const existing = acc.find(d => d.driverId === record.driverId);
                        if (existing) {
                          existing.totalLitres += record.litres;
                          existing.totalCost += record.totalCost;
                          existing.records += 1;
                        } else {
                          acc.push({
                            driverId: record.driverId,
                            driverName: record.driverName,
                            totalLitres: record.litres,
                            totalCost: record.totalCost,
                            records: 1,
                          });
                        }
                        return acc;
                      }, [] as any[]).map((driver) => (
                        <TableRow key={driver.driverId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person sx={{ mr: 1, color: 'primary.main' }} />
                              {driver.driverName}
                            </Box>
                          </TableCell>
                          <TableCell>{driver.totalLitres.toFixed(1)}L</TableCell>
                          <TableCell>£{driver.totalCost.toFixed(2)}</TableCell>
                          <TableCell>{driver.records}</TableCell>
                          <TableCell>£{(driver.totalCost / driver.totalLitres).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Cost Analysis Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost Trends
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart visualization would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fuel Station Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Station</TableCell>
                        <TableCell>Records</TableCell>
                        <TableCell>Avg Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fuelRecords.reduce((acc, record) => {
                        const existing = acc.find(s => s.station === record.fuelStation);
                        if (existing) {
                          existing.records += 1;
                          existing.totalPrice += record.pricePerLitre;
                        } else {
                          acc.push({
                            station: record.fuelStation,
                            records: 1,
                            totalPrice: record.pricePerLitre,
                          });
                        }
                        return acc;
                      }, [] as any[]).map((station) => (
                        <TableRow key={station.station}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
                              {station.station}
                            </Box>
                          </TableCell>
                          <TableCell>{station.records}</TableCell>
                          <TableCell>£{(station.totalPrice / station.records).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* View Record Dialog */}
      <Dialog 
        open={showViewDialog} 
        onClose={() => setShowViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Fuel Record Details
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{selectedRecord.date}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Receipt Number</Typography>
                <Typography variant="body1">{selectedRecord.receiptNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                <Typography variant="body1">{selectedRecord.vehicleRegistration}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
                <Typography variant="body1">{selectedRecord.driverName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Odometer Reading</Typography>
                <Typography variant="body1">{selectedRecord.odometerReading?.toLocaleString() || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Litres</Typography>
                <Typography variant="body1">{selectedRecord.litres}L</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Price per Litre</Typography>
                <Typography variant="body1">£{selectedRecord.pricePerLitre}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                <Typography variant="h6">£{selectedRecord.totalCost.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  icon={getStatusIcon(selectedRecord.status)}
                  label={selectedRecord.status} 
                  color={getStatusColor(selectedRecord.status)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Fuel Station</Typography>
                <Typography variant="body1">{selectedRecord.fuelStation}</Typography>
              </Grid>
              {selectedRecord.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{selectedRecord.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Fuel Record Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Fuel Record
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newFuelRecord.date}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Registration"
                value={newFuelRecord.vehicleRegistration}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, vehicleRegistration: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={newFuelRecord.driverName}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, driverName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Odometer Reading"
                type="number"
                value={newFuelRecord.odometerReading}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, odometerReading: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Litres"
                type="number"
                value={newFuelRecord.litres}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, litres: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price per Litre (£)"
                type="number"
                value={newFuelRecord.pricePerLitre}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, pricePerLitre: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Cost (£)"
                type="number"
                value={newFuelRecord.litres * newFuelRecord.pricePerLitre}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fuel Station"
                value={newFuelRecord.fuelStation}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, fuelStation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={newFuelRecord.receiptNumber}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, receiptNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newFuelRecord.notes}
                onChange={(e) => setNewFuelRecord(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFuelRecord} variant="contained">Save Record</Button>
        </DialogActions>
      </Dialog>

      
    </Box>
  );
};

export default FuelManagement; 