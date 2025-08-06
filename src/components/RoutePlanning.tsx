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
  Alert,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Route,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  Schedule,
  LocalShipping,
  Person,
  LocationOn,
  AccessTime,
  DirectionsCar,
  CheckCircle,
  Pending,
  PlayArrow,
  Stop,
  Warning,
  TrendingUp,
  Map,
  Timeline,
  Speed,
  Assignment,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  RoutePlan,
  JobAssignment,
  addRoutePlan,
  updateRoutePlan,
  deleteRoutePlan,
  assignJobToDriver,
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

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);

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

  const openEditDialog = (route: RoutePlan) => {
    setSelectedRoute(route);
    setShowEditDialog(true);
  };

  const openViewDialog = (route: RoutePlan) => {
    setSelectedRoute(route);
    setShowViewDialog(true);
  };

  // Calculate statistics
  const totalRoutes = routePlans.length;
  const plannedRoutes = routePlans.filter(route => route.status === 'planned').length;
  const inProgressRoutes = routePlans.filter(route => route.status === 'in_progress').length;
  const completedRoutes = routePlans.filter(route => route.status === 'completed').length;
  const totalDistance = routePlans.reduce((sum, route) => sum + route.totalDistance, 0);
  const totalDuration = routePlans.reduce((sum, route) => sum + route.estimatedDuration, 0);

  // Get available jobs for assignment
  const availableJobs = jobs.filter(job => job.status === 'pending' || job.status === 'assigned');

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Route Planning
        </Typography>
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowAddDialog(true)}
            sx={{ mr: 2 }}
          >
            Create Route
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
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
                {totalDistance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Miles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Math.round(totalDuration / 60)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
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
          <Tab label="All Routes" />
          <Tab label="Planned Routes" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
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
              {routePlans.map((route) => (
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
                    <Chip
                      label={`${route.jobs.length} jobs`}
                      size="small"
                      color="info"
                    />
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
                    <Tooltip title="Edit Route">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(route)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Route">
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Planned Routes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {routePlans
            .filter(route => route.status === 'planned')
            .map(route => (
              <Grid item xs={12} md={6} lg={4} key={route.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Route {route.id}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(route.status)}
                        label={route.status}
                        color={getStatusColor(route.status) as any}
                        size="small"
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle
                        </Typography>
                        <Typography variant="body2">
                          {route.vehicleId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Driver
                        </Typography>
                        <Typography variant="body2">
                          Driver {route.driverId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body2">
                          {new Date(route.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Jobs
                        </Typography>
                        <Typography variant="body2">
                          {route.jobs.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography variant="body2">
                          {route.totalDistance} miles
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2">
                          {Math.round(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => openViewDialog(route)}
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      {/* Add Route Dialog */}
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
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.fleetNumber}>
                      {vehicle.fleetNumber} - {vehicle.registration}
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
                label="Total Distance (miles)"
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
                  <strong>Start Location:</strong> {selectedRoute.startLocation}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>End Location:</strong> {selectedRoute.endLocation}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Assigned Jobs ({selectedRoute.jobs.length})
                </Typography>
                <List>
                  {selectedRoute.jobs.map((jobId, index) => {
                    const job = jobs.find(j => j.id === jobId);
                    return job ? (
                      <ListItem key={jobId}>
                        <ListItemIcon>
                          <Assignment />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${index + 1}. ${job.title}`}
                          secondary={`${job.customerName} - ${job.scheduledTime}`}
                        />
                      </ListItem>
                    ) : null;
                  })}
                </List>
              </Grid>
              {selectedRoute.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedRoute.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => openEditDialog(selectedRoute)} variant="contained">
              Edit Route
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default RoutePlanning; 