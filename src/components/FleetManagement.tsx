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
  Build,
  Warning,
  CheckCircle,
  Error,
  ArrowBack,
  Speed,
  Assignment,
  DirectionsCar,
  Settings,
  Add,
  Edit,
  Visibility,
  Circle,
  Home,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Vehicle, VehicleDefectReport, VehicleStatus } from '../store/slices/vehicleSlice';

interface FleetManagementProps {
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
      id={`fleet-tabpanel-${index}`}
      aria-labelledby={`fleet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FleetManagement: React.FC<FleetManagementProps> = ({ onClose }) => {
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
      setShowVehicleDialog(false);
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      setShowReportDialog(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(false);
  };

  const openVehicleDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDialog(true);
  };

  const openReportDialog = (report: any) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fleet Management
        </Typography>
                  <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
      </Box>

      {/* Fleet Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {fleetStatus.totalVehicles}
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
                  <TableCell>{report.vehicleFleetNumber}</TableCell>
                  <TableCell>{report.driverName}</TableCell>
                  <TableCell>{report.defects.reported}</TableCell>
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
                    {new Date(report.dateTime).toLocaleDateString()}
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
                    Last Service: {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Service: {vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : 'Not scheduled'}
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

export default FleetManagement;
