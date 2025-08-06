import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  LocalShipping,
  LocalGasStation,
  Build,
  Warning,
  CheckCircle,
  Error,
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Speed,
  Assignment,
  DirectionsCar,
  Settings,
  Analytics,
  Report,
  Add,
  Edit,
  Visibility,
  Download,
  Info,
  Circle,
  AttachMoney,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface FleetManagementProps {
  onClose: () => void;
}

interface FleetDashboardProps {
  onClose: () => void;
  onNavigateToFuel: () => void;
}

interface FuelDashboardProps {
  onClose: () => void;
  onNavigateToFleet: () => void;
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
      id={`fleet-tabpanel-${index}`}
      aria-labelledby={`fleet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FleetManagement: React.FC<FleetManagementProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'fleet' | 'fuel'>('main');
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);

  const handleNavigateToFleet = () => setCurrentView('fleet');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'fleet') {
    return <FleetDashboard onClose={onClose} onNavigateToFuel={handleNavigateToFuel} />;
  }

  if (currentView === 'fuel') {
    return <FuelDashboard onClose={onClose} onNavigateToFleet={handleNavigateToFleet} />;
  }

  // Main Fleet Management Dashboard
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fleet Management
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={onClose}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Fleet Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Vehicles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.maintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.offRoad}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Off Road
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sub-Dashboard Navigation */}
      <Grid container spacing={3}>
        {/* Fleet Dashboard Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToFleet}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Fleet Dashboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle management and defect tracking
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {vehicles.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vehicles
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      {defectReports.filter(r => r.status === 'pending').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Reports
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<Settings />} 
                  label="Vehicle Status" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Build />} 
                  label="Defect Reports" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assignment />} 
                  label="Maintenance" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Management Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToFuel}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <LocalGasStation />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Fuel Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuel tracking and cost analysis
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      £2,450
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      1,250L
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fuel Used
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Cost Tracking" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Efficiency" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Reports" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              fullWidth
              onClick={handleNavigateToFleet}
            >
              Add Vehicle
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Build />}
              fullWidth
              onClick={handleNavigateToFleet}
            >
              Report Defect
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<LocalGasStation />}
              fullWidth
              onClick={handleNavigateToFuel}
            >
              Add Fuel Record
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              fullWidth
              onClick={handleNavigateToFuel}
            >
              Fuel Report
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Fleet Dashboard Component (renamed from current FleetManagement)
const FleetDashboard: React.FC<FleetDashboardProps> = ({ onClose, onNavigateToFuel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedReport, setSelectedReport] = useState<VehicleDefectReport | null>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Service':
      case 'MOT':
      case 'Repair':
        return 'warning';
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return 'error';
      case 'Reserved':
      case 'Training':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return <CheckCircle />;
      case 'Service':
      case 'MOT':
      case 'Repair':
        return <Build />;
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return <Error />;
      case 'Reserved':
      case 'Training':
        return <Speed />;
      default:
        return <Circle />;
    }
  };

  const handleVehicleStatusUpdate = () => {
    if (selectedVehicle) {
      // Handle status update logic
      setShowVehicleDialog(false);
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      // Handle report status update logic
      setShowReportDialog(false);
    }
  };

  const handleAddVehicle = () => {
    // Handle add vehicle logic
    setShowAddVehicleDialog(false);
  };

  const openVehicleDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDialog(true);
  };

  const openReportDialog = (report: VehicleDefectReport) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fleet Dashboard
        </Typography>
        <Box>
          <Button
            startIcon={<LocalGasStation />}
            variant="outlined"
            onClick={onNavigateToFuel}
            sx={{ mr: 2 }}
          >
            Fuel Management
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Fleet Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Vehicles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {defectReports.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {defectReports.filter(r => r.priority === 'critical').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#FFD700', // Yellow color for inactive tabs
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="Fleet Overview" />
          <Tab label="Defect Reports" />
          <Tab label="Maintenance Schedule" />
        </Tabs>
      </Box>

      {/* Fleet Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Vehicle Fleet</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddVehicleDialog(true)}
          >
            Add Vehicle
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Last Service</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.year}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vehicle.currentDriver || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                                         {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Vehicle">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Defect Reports Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Defect Reports</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Add defect report handler */}}
          >
            Add Defect Report
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Defect Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defectReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.vehicleRegistration}</TableCell>
                  <TableCell>{report.driverName}</TableCell>
                  <TableCell>{report.defectType}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      color={getPriorityColor(report.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'resolved' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Maintenance Schedule Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Maintenance Schedule
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Maintenance Schedule:</strong> Track scheduled maintenance, MOT tests, and service intervals for all vehicles.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{vehicle.make} {vehicle.model}</Typography>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registration: {vehicle.registration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Service: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Service: {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : 'Not scheduled'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onClose={() => setShowAddVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Vehicle addition form will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddVehicleDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained">Add Vehicle</Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Details Dialog */}
      {selectedVehicle && (
        <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Vehicle Details: {selectedVehicle.make} {selectedVehicle.model}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Vehicle details and status update form will be implemented here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onClick={handleVehicleStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Defect Report Dialog */}
      {selectedReport && (
        <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Defect Report Details</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Defect report details and status update form will be implemented here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={handleReportStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Fuel Dashboard Component (moved from FuelManagement)
const FuelDashboard: React.FC<FuelDashboardProps> = ({ onClose, onNavigateToFleet }) => {
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
      driverId: 'DRV001',
      driverName: 'John Driver',
      odometerReading: 125000,
      litres: 150,
      pricePerLitre: 1.45,
      totalCost: 217.50,
      receiptNumber: 'REC001',
      fuelStation: 'Shell Station - London',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-15',
    },
    {
      id: '2',
      date: '2024-01-14',
      vehicleId: 'HGV002',
      vehicleRegistration: 'EF34 GHI',
      driverId: 'DRV002',
      driverName: 'Jane Manager',
      odometerReading: 98000,
      litres: 120,
      pricePerLitre: 1.42,
      totalCost: 170.40,
      receiptNumber: 'REC002',
      fuelStation: 'BP Station - Manchester',
      status: 'pending',
    },
    {
      id: '3',
      date: '2024-01-13',
      vehicleId: 'HGV003',
      vehicleRegistration: 'JK56 LMN',
      driverId: 'DRV003',
      driverName: 'Mike Wilson',
      odometerReading: 156000,
      litres: 180,
      pricePerLitre: 1.48,
      totalCost: 266.40,
      receiptNumber: 'REC003',
      fuelStation: 'Esso Station - Birmingham',
      status: 'approved',
      approvedBy: 'Manager',
      approvedDate: '2024-01-13',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Warning />;
      case 'rejected':
        return <Error />;
      default:
        return <Info />;
    }
  };

  const handleAddRecord = () => {
    setShowAddDialog(true);
  };

  const openViewDialog = (record: FuelRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  // Calculate totals
  const totalCost = fuelRecords.reduce((sum, record) => sum + record.totalCost, 0);
  const totalLitres = fuelRecords.reduce((sum, record) => sum + record.litres, 0);
  const averagePrice = totalLitres > 0 ? totalCost / totalLitres : 0;
  const pendingRecords = fuelRecords.filter(record => record.status === 'pending').length;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <LocalGasStation sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fuel Management
        </Typography>
        <Box>
          <Button
            startIcon={<DirectionsCar />}
            variant="outlined"
            onClick={onNavigateToFleet}
            sx={{ mr: 2 }}
          >
            Fleet Dashboard
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Fuel Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalCost.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalGasStation sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {totalLitres}L
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Fuel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{averagePrice.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Price/L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {pendingRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#FFD700', // Yellow color for inactive tabs
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="Fuel Records" />
          <Tab label="Cost Analysis" />
          <Tab label="Efficiency Report" />
        </Tabs>
      </Box>

      {/* Fuel Records Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Fuel Records</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddRecord}
          >
            Add Fuel Record
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Litres</TableCell>
                <TableCell>Price/L</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fuelRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCar sx={{ mr: 1 }} />
                      {record.vehicleRegistration}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      {record.driverName}
                    </Box>
                  </TableCell>
                  <TableCell>{record.litres}L</TableCell>
                  <TableCell>£{record.pricePerLitre.toFixed(2)}</TableCell>
                  <TableCell>£{record.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status}
                      color={getStatusColor(record.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(record)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Receipt">
                      <IconButton size="small">
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Cost Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Fuel Cost Analysis
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Cost Analysis:</strong> Track fuel costs by vehicle, driver, and time period to identify trends and optimize fuel usage.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost by Vehicle
                </Typography>
                <List>
                  {Array.from(new Set(fuelRecords.map(r => r.vehicleRegistration))).map(vehicle => {
                    const vehicleRecords = fuelRecords.filter(r => r.vehicleRegistration === vehicle);
                    const totalCost = vehicleRecords.reduce((sum, r) => sum + r.totalCost, 0);
                    return (
                      <ListItem key={vehicle}>
                        <ListItemIcon>
                          <DirectionsCar />
                        </ListItemIcon>
                        <ListItemText
                          primary={vehicle}
                          secondary={`£${totalCost.toFixed(2)}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost by Driver
                </Typography>
                <List>
                  {Array.from(new Set(fuelRecords.map(r => r.driverName))).map(driver => {
                    const driverRecords = fuelRecords.filter(r => r.driverName === driver);
                    const totalCost = driverRecords.reduce((sum, r) => sum + r.totalCost, 0);
                    return (
                      <ListItem key={driver}>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary={driver}
                          secondary={`£${totalCost.toFixed(2)}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Efficiency Report Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Fuel Efficiency Report
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Efficiency Report:</strong> Monitor fuel efficiency metrics and identify opportunities for improvement.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {((totalLitres / fuelRecords.length) * 100).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Litres per Fill
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingDown sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  £{(totalCost / fuelRecords.length).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Cost per Fill
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocalGasStation sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {fuelRecords.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Fills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Fuel Record Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Fuel Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Fuel record addition form will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRecord} variant="contained">Add Record</Button>
        </DialogActions>
      </Dialog>

      {/* View Fuel Record Dialog */}
      {selectedRecord && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Fuel Record Details</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Fuel record details will be displayed here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button startIcon={<Download />} variant="contained">Download Receipt</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Add missing interfaces and imports
import { Vehicle, VehicleDefectReport, VehicleStatus } from '../store/slices/vehicleSlice';

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

// Add missing imports
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';

export default FleetManagement; 