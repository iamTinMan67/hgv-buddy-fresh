import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
  receiptImage?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
}

const FuelManagement: React.FC<FuelManagementProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);

  // Mock fuel data
  const [fuelRecords] = useState<FuelRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP001',
      driverName: 'John Driver',
      odometerReading: 125450,
      litres: 150.5,
      pricePerLitre: 1.85,
      totalCost: 278.43,
      receiptNumber: 'REC-2024-001',
      fuelStation: 'BP Fuel Station - London',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-16',
    },
    {
      id: '2',
      date: '2024-01-14',
      vehicleId: 'HGV002',
      vehicleRegistration: 'XY34 FGH',
      driverId: 'EMP002',
      driverName: 'Jane Manager',
      odometerReading: 98750,
      litres: 120.0,
      pricePerLitre: 1.82,
      totalCost: 218.40,
      receiptNumber: 'REC-2024-002',
      fuelStation: 'Shell Station - Manchester',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-15',
    },
    {
      id: '3',
      date: '2024-01-13',
      vehicleId: 'HGV001',
      vehicleRegistration: 'AB12 CDE',
      driverId: 'EMP001',
      driverName: 'John Driver',
      odometerReading: 125200,
      litres: 180.0,
      pricePerLitre: 1.88,
      totalCost: 338.40,
      receiptNumber: 'REC-2024-003',
      fuelStation: 'Esso Station - Birmingham',
      status: 'pending',
    },
    {
      id: '4',
      date: '2024-01-12',
      vehicleId: 'HGV003',
      vehicleRegistration: 'PQ56 RST',
      driverId: 'EMP003',
      driverName: 'Mike Wilson',
      odometerReading: 45680,
      litres: 95.5,
      pricePerLitre: 1.80,
      totalCost: 171.90,
      receiptNumber: 'REC-2024-004',
      fuelStation: 'Tesco Fuel - Leeds',
      status: 'rejected',
      notes: 'Receipt not provided',
    },
  ]);

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

  const openViewDialog = (record: FuelRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  const totalFuelCost = fuelRecords.reduce((sum, record) => sum + record.totalCost, 0);
  const totalLitres = fuelRecords.reduce((sum, record) => sum + record.litres, 0);
  const averagePricePerLitre = totalLitres > 0 ? totalFuelCost / totalLitres : 0;
  const pendingRecords = fuelRecords.filter(r => r.status === 'pending');

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
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalGasStation sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {totalLitres.toFixed(1)}L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Fuel Used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalFuelCost.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Fuel Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{averagePricePerLitre.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Price/Litre
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={pendingRecords.length} color="warning">
                <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              </Badge>
              <Typography variant="h4" component="div">
                {pendingRecords.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#FFD700',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
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
                  <TableCell>{record.odometerReading.toLocaleString()}</TableCell>
                  <TableCell>{record.litres}L</TableCell>
                  <TableCell>£{record.pricePerLitre}</TableCell>
                  <TableCell>£{record.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(record.status)}
                      label={record.status} 
                      color={getStatusColor(record.status)}
                      size="small"
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
                <Typography variant="body1">{selectedRecord.odometerReading.toLocaleString()}</Typography>
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
    </Box>
  );
};

export default FuelManagement; 