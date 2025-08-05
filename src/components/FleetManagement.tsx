import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  LocalShipping,
  Build,
  Warning,
  CheckCircle,
  Error,
  Edit,
  Visibility,
  ArrowBack,
  Add,
  Delete,
  Schedule,
  LocationOn,
  Person,
  Speed,
  Assignment,
  TrendingUp,
  TrendingDown,
  Circle,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { 
  Vehicle, 
  VehicleStatus, 
  VehicleDefectReport,
  updateVehicleStatus,
  updateDefectStatus,
  addDefectReport,
} from '../store/slices/vehicleSlice';

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
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedReport, setSelectedReport] = useState<VehicleDefectReport | null>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

  const [vehicleForm, setVehicleForm] = useState({
    status: 'Available' as VehicleStatus,
    notes: '',
  });

  const [reportForm, setReportForm] = useState({
    status: 'pending' as VehicleDefectReport['status'],
    priority: 'medium' as VehicleDefectReport['priority'],
    notes: '',
  });

  const [newVehicle, setNewVehicle] = useState({
    fleetNumber: '',
    registration: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'HGV' as Vehicle['type'],
    status: 'Available' as VehicleStatus,
  });

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return 'error';
      case 'Service':
      case 'MOT':
      case 'Repair':
        return 'warning';
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
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return <Error />;
      case 'Service':
      case 'MOT':
      case 'Repair':
        return <Build />;
      default:
        return <Circle />;
    }
  };

  const handleVehicleStatusUpdate = () => {
    if (selectedVehicle) {
      dispatch(updateVehicleStatus({
        vehicleId: selectedVehicle.id,
        status: vehicleForm.status,
        notes: vehicleForm.notes,
      }));
      setShowVehicleDialog(false);
      setSelectedVehicle(null);
      setVehicleForm({ status: 'Available', notes: '' });
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      dispatch(updateDefectStatus({
        reportId: selectedReport.id,
        status: reportForm.status,
        priority: reportForm.priority,
        notes: reportForm.notes,
      }));
      setShowReportDialog(false);
      setSelectedReport(null);
      setReportForm({ status: 'pending', priority: 'medium', notes: '' });
    }
  };

  const handleAddVehicle = () => {
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      lastInspection: new Date().toISOString().split('T')[0],
      nextMOT: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextService: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In a real app, you'd dispatch an action to add the vehicle
    console.log('Adding vehicle:', vehicle);
    setShowAddVehicleDialog(false);
    setNewVehicle({
      fleetNumber: '',
      registration: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'HGV',
      status: 'Available',
    });
  };

  const openVehicleDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({ status: vehicle.status, notes: vehicle.notes || '' });
    setShowVehicleDialog(true);
  };

  const openReportDialog = (report: VehicleDefectReport) => {
    setSelectedReport(report);
    setReportForm({
      status: report.status,
      priority: report.priority,
      notes: report.managementNotes || '',
    });
    setShowReportDialog(true);
  };

  const pendingReports = defectReports.filter(r => r.status === 'pending');
  const criticalReports = defectReports.filter(r => r.priority === 'critical');

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Fleet Management
        </Typography>
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowAddVehicleDialog(true)}
            sx={{ mr: 2 }}
          >
            Add Vehicle
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Fleet Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {fleetStatus.totalVehicles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Vehicles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {fleetStatus.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {fleetStatus.maintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {fleetStatus.offRoad}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Off Road
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {fleetStatus.criticalIssues}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {pendingReports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Alerts */}
      {criticalReports.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Critical Alert:</strong> {criticalReports.length} critical defect reports require immediate attention!
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Fleet Overview" />
          <Tab label="Defect Reports" />
          <Tab label="Maintenance Schedule" />
        </Tabs>
      </Box>

      {/* Fleet Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fleet #</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Make/Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Next MOT</TableCell>
                <TableCell>Next Service</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {vehicle.fleetNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.make} {vehicle.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {vehicle.year} • {vehicle.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vehicle.currentDriver ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ fontSize: 16, mr: 1 }} />
                        {vehicle.currentDriver}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                      {vehicle.location || 'Unknown'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(vehicle.nextMOT).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(vehicle.nextService).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info">
                        <Visibility />
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
        {defectReports.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              No defect reports have been submitted yet. Reports will appear here when drivers complete vehicle checks.
            </Typography>
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Failed Checks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defectReports.map((report) => {
                  const failedChecks = report.checkItems.filter(item => !item.checked);
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(report.dateTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(report.dateTime).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{report.driverName}</TableCell>
                      <TableCell>{report.vehicleFleetNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={report.status === 'resolved' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.priority}
                          color={getPriorityColor(report.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {failedChecks.length} items
                        </Typography>
                        {failedChecks.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {failedChecks.slice(0, 2).map(item => item.label).join(', ')}
                            {failedChecks.length > 2 && '...'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Review Report">
                          <IconButton
                            size="small"
                            onClick={() => openReportDialog(report)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Full Report">
                          <IconButton size="small" color="info">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Maintenance Schedule Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  MOT Due Soon
                </Typography>
                <List>
                  {vehicles
                    .filter(v => new Date(v.nextMOT) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                    .map(vehicle => (
                      <ListItem key={vehicle.id}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${vehicle.fleetNumber} - ${vehicle.registration}`}
                          secondary={`MOT due: ${new Date(vehicle.nextMOT).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Due Soon
                </Typography>
                <List>
                  {vehicles
                    .filter(v => new Date(v.nextService) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
                    .map(vehicle => (
                      <ListItem key={vehicle.id}>
                        <ListItemIcon>
                          <Build color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${vehicle.fleetNumber} - ${vehicle.registration}`}
                          secondary={`Service due: ${new Date(vehicle.nextService).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Vehicle Status Update Dialog */}
      <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Vehicle Status: {selectedVehicle?.fleetNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
                  label="Status"
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="V.O.R">V.O.R (Vehicle Off Road)</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="MOT">MOT</MenuItem>
                  <MenuItem value="Repair">Repair</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Off Road">Off Road</MenuItem>
                  <MenuItem value="Reserved">Reserved</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                  <MenuItem value="Breakdown">Breakdown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={vehicleForm.notes}
                onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                placeholder="Add notes about the status change..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVehicleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleVehicleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Defect Report Review Dialog */}
      <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Defect Report: {selectedReport?.vehicleFleetNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reportForm.status}
                  onChange={(e) => setReportForm({ ...reportForm, status: e.target.value as VehicleDefectReport['status'] })}
                  label="Status"
                >
                  <MenuItem value="pending">Pending Review</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="escalated">Escalated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={reportForm.priority}
                  onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value as VehicleDefectReport['priority'] })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Management Notes"
                multiline
                rows={4}
                value={reportForm.notes}
                onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                placeholder="Add management notes, action items, or resolution details..."
              />
            </Grid>
            {selectedReport && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Report Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Driver:</strong> {selectedReport.driverName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {new Date(selectedReport.dateTime).toLocaleString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Failed Checks:</strong> {selectedReport.checkItems.filter(item => !item.checked).length}
                </Typography>
                {selectedReport.defects.reported && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Defects Reported:</strong> {selectedReport.defects.reported}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleReportStatusUpdate} variant="contained">
            Update Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onClose={() => setShowAddVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fleet Number"
                value={newVehicle.fleetNumber}
                onChange={(e) => setNewVehicle({ ...newVehicle, fleetNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration"
                value={newVehicle.registration}
                onChange={(e) => setNewVehicle({ ...newVehicle, registration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Make"
                value={newVehicle.make}
                onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as Vehicle['type'] })}
                  label="Type"
                >
                  <MenuItem value="HGV">HGV</MenuItem>
                  <MenuItem value="Articulated">Articulated</MenuItem>
                  <MenuItem value="PCV">PCV</MenuItem>
                  <MenuItem value="PSV">PSV</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddVehicleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddVehicle} variant="contained">
            Add Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FleetManagement; 