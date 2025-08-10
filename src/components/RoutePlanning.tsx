import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  DirectionsCar,
  CheckCircle,
  Pending,
  PlayArrow,
  Stop,
  Assignment,
  Home,
  Person,
  Route,
  Map,
  Timeline,
  Business,
  LocalShipping,
  Receipt,
  TrendingUp,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  RoutePlan,
  addRoutePlan,
  JobAssignment as JobAssignmentType,
  JobStatus,
} from '../store/slices/jobSlice';

interface RoutePlanningProps {
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
      id={`route-tabpanel-${index}`}
      aria-labelledby={`route-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { routePlans, jobs } = useSelector((state: RootState) => state.job);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showJobAllocationDialog, setShowJobAllocationDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const [newRoute, setNewRoute] = useState({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    jobs: [] as string[],
    totalDistance: 0,
    estimatedDuration: 0,
    startLocation: '',
    endLocation: '',
    notes: '',
  });

  const [jobAllocation, setJobAllocation] = useState({
    selectedJobs: [] as string[],
    startTime: '08:00',
    endTime: '17:00',
  });

  // Filter routes based on user role
  const filteredRoutes = user?.role === 'driver' 
    ? routePlans.filter(route => route.driverId === user.id)
    : routePlans;

  // Get pending jobs for allocation
  const pendingJobs = jobs.filter(job => job.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Pending />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const handleAddRoute = () => {
    const route: RoutePlan = {
      id: Date.now().toString(),
      ...newRoute,
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addRoutePlan(route));
    setShowAddDialog(false);
    setNewRoute({
      vehicleId: '',
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      jobs: [],
      totalDistance: 0,
      estimatedDuration: 0,
      startLocation: '',
      endLocation: '',
      notes: '',
    });
  };

  const openViewDialog = (route: RoutePlan) => {
    setSelectedRoute(route);
    setShowViewDialog(true);
  };

  const openJobAllocationDialog = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setShowJobAllocationDialog(true);
  };

  const handleJobAllocation = () => {
    // Here you would implement the logic to assign jobs to the vehicle
    // For now, we'll just close the dialog
    setShowJobAllocationDialog(false);
    setJobAllocation({
      selectedJobs: [],
      startTime: '08:00',
      endTime: '17:00',
    });
  };

  // Calculate statistics
  const totalRoutes = filteredRoutes.length;
  const plannedRoutes = filteredRoutes.filter(route => route.status === 'planned').length;
  const inProgressRoutes = filteredRoutes.filter(route => route.status === 'in_progress').length;
  const completedRoutes = filteredRoutes.filter(route => route.status === 'completed').length;
  const totalJobsInRoutes = filteredRoutes.reduce((sum, route) => sum + route.jobs.length, 0);

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Route Planning
        </Typography>
        <Box>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setShowAddDialog(true)}
              sx={{ mr: 2 }}
            >
              Create Route
            </Button>
          )}
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      {/* Route Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalRoutes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Routes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {plannedRoutes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Planned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {inProgressRoutes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {completedRoutes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {totalJobsInRoutes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jobs in Routes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {vehicles.filter(v => v.status === 'Available').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Vehicles
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
              color: 'white',
              fontWeight: 'bold',
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
          <Tab label="All Routes" />
          <Tab label="Vehicle Assignment" />
          <Tab label="Route Optimization" />
        </Tabs>
      </Box>

      {/* All Routes Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route ID</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Jobs</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {route.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<DirectionsCar />}
                      label={route.vehicleId}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Person />}
                      label={`Driver ${route.driverId}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(route.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {route.jobs.length} jobs
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {route.totalDistance} miles
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {Math.round(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(route.status)}
                      label={route.status.replace('_', ' ')}
                      color={getStatusColor(route.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(route)}
                        color="info"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <>
                        <Tooltip title="Edit Route">
                          <IconButton size="small" color="primary">
                            <Assignment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Route">
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Vehicle Assignment Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} md={6} lg={4} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {vehicle.registration}
                    </Typography>
                    <Chip
                      label={vehicle.status}
                      color={vehicle.status === 'Available' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body2">
                        {vehicle.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Capacity
                      </Typography>
                      <Typography variant="body2">
                        {vehicle.capacity} tons
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Jobs
                      </Typography>
                      <Typography variant="body2">
                        {jobs.filter(job => job.assignedVehicle === vehicle.id).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Driver
                      </Typography>
                      <Typography variant="body2">
                        {vehicle.currentDriver || 'Unassigned'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Available Drivers
                      </Typography>
                      <Typography variant="body2">
                        {/* This would show drivers assigned to this vehicle */}
                        {vehicle.currentDriver ? vehicle.currentDriver : 'No drivers assigned'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Assignment />}
                          onClick={() => openJobAllocationDialog(vehicle.id)}
                          fullWidth
                          sx={{ mb: 1 }}
                        >
                          Allocate Jobs to Vehicle
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Person />}
                          fullWidth
                        >
                          Assign Driver to Vehicle
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Route Planning Staff Information */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Route Planning & Job Allocation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Business Rules:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Drivers can be assigned to multiple vehicles"
                    secondary="A driver can operate different vehicles as needed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Jobs are allocated to one vehicle only"
                    secondary="Each job is assigned to a specific vehicle during route planning"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Route planning staff handle allocations"
                    secondary="Authorized staff determine vehicle-job assignments based on capacity and requirements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Database policies control permissions"
                    secondary="Access to job allocation is controlled by database-level policies and permissions"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Route Optimization Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Route Optimization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Optimize routes for maximum efficiency and fuel savings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Route />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Optimize All Routes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Map />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  View Route Map
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Timeline />}
                  fullWidth
                >
                  Performance Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Optimization Metrics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Route Distance
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {filteredRoutes.length > 0 
                      ? Math.round(filteredRoutes.reduce((sum, route) => sum + route.totalDistance, 0) / filteredRoutes.length)
                      : 0} miles
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Route Duration
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {filteredRoutes.length > 0 
                      ? Math.round(filteredRoutes.reduce((sum, route) => sum + route.estimatedDuration, 0) / filteredRoutes.length / 60)
                      : 0} hours
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fuel Efficiency
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    85%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create Route Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Route</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={newRoute.vehicleId}
                  onChange={(e) => setNewRoute({ ...newRoute, vehicleId: e.target.value })}
                  label="Vehicle"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} - {vehicle.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver ID"
                value={newRoute.driverId}
                onChange={(e) => setNewRoute({ ...newRoute, driverId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newRoute.date}
                onChange={(e) => setNewRoute({ ...newRoute, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Location"
                value={newRoute.startLocation}
                onChange={(e) => setNewRoute({ ...newRoute, startLocation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Location"
                value={newRoute.endLocation}
                onChange={(e) => setNewRoute({ ...newRoute, endLocation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Distance (miles)"
                type="number"
                value={newRoute.totalDistance}
                onChange={(e) => setNewRoute({ ...newRoute, totalDistance: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={newRoute.estimatedDuration}
                onChange={(e) => setNewRoute({ ...newRoute, estimatedDuration: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newRoute.notes}
                onChange={(e) => setNewRoute({ ...newRoute, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddRoute} variant="contained">
            Create Route
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Allocation Dialog */}
      <Dialog open={showJobAllocationDialog} onClose={() => setShowJobAllocationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Allocate Jobs to Vehicle: {vehicles.find(v => v.id === selectedVehicle)?.registration}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Route Planning Allocation:</strong> Jobs are allocated to vehicles based on capacity, 
                  requirements, and route optimization. Each job can only be assigned to one vehicle.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Jobs to Allocate to Vehicle
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Available pending jobs that can be allocated to this vehicle
              </Typography>
              <List>
                {pendingJobs.map((job) => (
                  <ListItem key={job.id}>
                    <ListItemIcon>
                      <Checkbox
                        checked={jobAllocation.selectedJobs.includes(job.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobAllocation({
                              ...jobAllocation,
                              selectedJobs: [...jobAllocation.selectedJobs, job.id]
                            });
                          } else {
                            setJobAllocation({
                              ...jobAllocation,
                              selectedJobs: jobAllocation.selectedJobs.filter(id => id !== job.id)
                            });
                          }
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {job.customerName} - {new Date(job.scheduledDate).toLocaleDateString()} {job.scheduledTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cargo: {job.cargoType} ({job.cargoWeight} tons) | Priority: {job.priority}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Schedule Start Time"
                type="time"
                value={jobAllocation.startTime}
                onChange={(e) => setJobAllocation({ ...jobAllocation, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="When the vehicle will start its route"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Schedule End Time"
                type="time"
                value={jobAllocation.endTime}
                onChange={(e) => setJobAllocation({ ...jobAllocation, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="When the vehicle will complete its route"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> This allocation will be subject to database policies and permissions. 
                  Only authorized route planning staff can finalize job-to-vehicle allocations.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJobAllocationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleJobAllocation} variant="contained">
            Allocate Jobs to Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Route Dialog */}
      {selectedRoute && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Route Details: {selectedRoute.id}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Route Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Vehicle:</strong> {selectedRoute.vehicleId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Driver:</strong> Driver {selectedRoute.driverId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {new Date(selectedRoute.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    icon={getStatusIcon(selectedRoute.status)}
                    label={selectedRoute.status.replace('_', ' ')}
                    color={getStatusColor(selectedRoute.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Route Metrics
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Distance:</strong> {selectedRoute.totalDistance} miles
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Estimated Duration:</strong> {Math.round(selectedRoute.estimatedDuration / 60)}h {selectedRoute.estimatedDuration % 60}m
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Number of Jobs:</strong> {selectedRoute.jobs.length}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Start Location:</strong> {selectedRoute.startLocation}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>End Location:</strong> {selectedRoute.endLocation}
                </Typography>
              </Grid>
              {selectedRoute.jobs.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Assigned Jobs
                  </Typography>
                  <List>
                    {selectedRoute.jobs.map((jobId, index) => {
                      const job = jobs.find(j => j.id === jobId);
                      return job ? (
                        <ListItem key={jobId}>
                          <ListItemIcon>
                            <Typography variant="h6" color="primary">
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={job.title}
                            secondary={`${job.customerName} - ${new Date(job.scheduledDate).toLocaleDateString()} ${job.scheduledTime}`}
                          />
                        </ListItem>
                      ) : null;
                    })}
                  </List>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <Button variant="contained">
                Edit Route
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default RoutePlanning; 