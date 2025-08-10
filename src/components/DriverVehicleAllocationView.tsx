import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Visibility,
  Schedule,
  LocalShipping,
  Person,
  DirectionsCar,
  Assignment,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  Download,
  Print,
  Share,
  History,
  Timeline,
  Work,
  Inventory,
  Route,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchDriverAllocations,
  fetchAllocationSchedule,
  fetchManifestDetails,
  fetchJobConsignments,
  setSelectedDriver,
  setSelectedSchedule,
  DriverVehicleAllocation,
  AllocationSchedule,
  ManifestDetails,
  JobConsignmentDetails,
} from '../store/slices/driverVehicleAllocationSlice';

interface DriverVehicleAllocationViewProps {
  driverId?: string;
  onClose?: () => void;
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
      id={`allocation-tabpanel-${index}`}
      aria-labelledby={`allocation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DriverVehicleAllocationView: React.FC<DriverVehicleAllocationViewProps> = ({ 
  driverId, 
  onClose 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);
  const [showManifestDialog, setShowManifestDialog] = useState(false);
  const [showConsignmentDialog, setShowConsignmentDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const {
    allocations,
    schedules,
    manifests,
    jobConsignments,
    loading,
    error,
    selectedDriverId,
    selectedScheduleId,
  } = useSelector((state: RootState) => state.driverVehicleAllocation);

  // Mock data for demonstration - replace with actual API calls
  const mockDrivers = [
    { id: '1', firstName: 'John', lastName: 'Driver', employeeNumber: 'EMP-2024-001' },
    { id: '2', firstName: 'Jane', lastName: 'Operator', employeeNumber: 'EMP-2024-002' },
    { id: '3', firstName: 'Mike', lastName: 'Hauler', employeeNumber: 'EMP-2024-003' },
  ];

  const mockVehicles = [
    { id: '1', registration: 'AB12 CDE', make: 'Mercedes', model: 'Actros', type: 'HGV' },
    { id: '2', registration: 'FG34 HIJ', make: 'Volvo', model: 'FH16', type: 'Articulated' },
    { id: '3', registration: 'KL56 MNO', make: 'Scania', model: 'R500', type: 'HGV' },
  ];

  const mockAllocations: DriverVehicleAllocation[] = [
    {
      id: '1',
      driverId: '1',
      vehicleId: '1',
      allocationDate: '2024-01-15',
      deallocationDate: '2024-01-20',
      scheduleTitle: 'Weekend Deliveries',
      status: 'completed',
      notes: 'Weekend delivery route completed successfully',
      createdBy: 'admin',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-20T18:00:00Z',
    },
    {
      id: '2',
      driverId: '1',
      vehicleId: '2',
      allocationDate: '2024-01-22',
      scheduleTitle: 'Long Haul Route',
      status: 'active',
      notes: 'Current long haul assignment',
      createdBy: 'admin',
      createdAt: '2024-01-22T08:00:00Z',
      updatedAt: '2024-01-22T08:00:00Z',
    },
    {
      id: '3',
      driverId: '2',
      vehicleId: '3',
      allocationDate: '2024-01-20',
      scheduleTitle: 'Local Deliveries',
      status: 'active',
      notes: 'Local delivery route in progress',
      createdBy: 'admin',
      createdAt: '2024-01-20T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z',
    },
  ];

  const mockSchedules: AllocationSchedule[] = [
    {
      id: '1',
      title: 'Weekend Deliveries',
      description: 'Weekend delivery route for major customers',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      driverId: '1',
      vehicleId: '1',
      status: 'completed',
      jobs: ['job1', 'job2', 'job3'],
      totalJobs: 3,
      estimatedDistance: 450,
      estimatedDuration: 480,
      notes: 'Route completed on time',
      createdBy: 'admin',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-20T18:00:00Z',
    },
    {
      id: '2',
      title: 'Long Haul Route',
      description: 'Long distance haulage route',
      startDate: '2024-01-22',
      endDate: '2024-01-25',
      driverId: '1',
      vehicleId: '2',
      status: 'active',
      jobs: ['job4', 'job5'],
      totalJobs: 2,
      estimatedDistance: 800,
      estimatedDuration: 720,
      notes: 'Route in progress',
      createdBy: 'admin',
      createdAt: '2024-01-22T08:00:00Z',
      updatedAt: '2024-01-22T08:00:00Z',
    },
  ];

  const mockManifest: ManifestDetails = {
    id: '1',
    scheduleId: '2',
    scheduleTitle: 'Long Haul Route',
    date: '2024-01-22',
    driverId: '1',
    driverName: 'John Driver',
    vehicleId: '2',
    vehicleRegistration: 'FG34 HIJ',
    jobs: [
      {
        jobId: 'job4',
        jobNumber: 'JOB-2024-001',
        customerName: 'ABC Logistics',
        pickupLocation: 'Manchester Depot',
        deliveryLocation: 'London Distribution Center',
        scheduledTime: '08:00',
        estimatedDuration: 240,
        status: 'in_progress',
        cargoType: 'General Freight',
        cargoWeight: 15.5,
        specialRequirements: 'Temperature controlled',
      },
      {
        jobId: 'job5',
        jobNumber: 'JOB-2024-002',
        customerName: 'XYZ Transport',
        pickupLocation: 'London Distribution Center',
        deliveryLocation: 'Birmingham Hub',
        scheduledTime: '14:00',
        estimatedDuration: 180,
        status: 'scheduled',
        cargoType: 'Electronics',
        cargoWeight: 8.2,
        specialRequirements: 'Fragile handling required',
      },
    ],
    totalJobs: 2,
    totalWeight: 23.7,
    totalVolume: 45.8,
    routeNotes: 'Route follows M6 motorway with planned rest stops',
    driverNotes: 'Driver has completed route briefing',
    managementNotes: 'Route approved by operations manager',
  };

  const mockJobConsignments: JobConsignmentDetails[] = [
    {
      id: '1',
      jobId: 'job4',
      jobNumber: 'JOB-2024-001',
      scheduleId: '2',
      scheduleTitle: 'Long Haul Route',
      driverId: '1',
      driverName: 'John Driver',
      vehicleId: '2',
      vehicleRegistration: 'FG34 HIJ',
      customerName: 'ABC Logistics',
      pickupLocation: 'Manchester Depot',
      deliveryLocation: 'London Distribution Center',
      scheduledDate: '2024-01-22',
      scheduledTime: '08:00',
      estimatedDuration: 240,
      status: 'in_progress',
      cargoType: 'General Freight',
      cargoWeight: 15.5,
      cargoVolume: 25.6,
      specialRequirements: 'Temperature controlled',
      consignmentItems: [
        {
          itemId: 'item1',
          description: 'Electronics Components',
          quantity: 50,
          unit: 'boxes',
          weight: 12.0,
          volume: 20.0,
          isFragile: true,
          isOversized: false,
          specialHandling: 'Handle with care, keep upright',
        },
        {
          itemId: 'item2',
          description: 'Automotive Parts',
          quantity: 25,
          unit: 'packages',
          weight: 3.5,
          volume: 5.6,
          isFragile: false,
          isOversized: false,
        },
      ],
      totalItems: 75,
      totalWeight: 15.5,
      totalVolume: 25.6,
      notes: 'Priority delivery for customer',
      driverNotes: 'All items loaded and secured',
      managementNotes: 'Customer has been notified of delivery time',
    },
  ];

  useEffect(() => {
    if (driverId) {
      dispatch(setSelectedDriver(driverId));
      // In real implementation, dispatch fetchDriverAllocations(driverId)
    }
  }, [driverId, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleViewManifest = (scheduleId: string) => {
    dispatch(setSelectedSchedule(scheduleId));
    setShowManifestDialog(true);
    // In real implementation, dispatch fetchManifestDetails(scheduleId)
  };

  const handleViewConsignments = (scheduleId: string) => {
    dispatch(setSelectedSchedule(scheduleId));
    setShowConsignmentDialog(true);
    // In real implementation, dispatch fetchJobConsignments(scheduleId)
  };

  const handleViewSchedule = (scheduleId: string) => {
    dispatch(setSelectedSchedule(scheduleId));
    setShowScheduleDialog(true);
    // In real implementation, dispatch fetchAllocationSchedule(scheduleId)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <ErrorIcon />;
      case 'scheduled': return <Schedule />;
      default: return <Circle />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
        Driver-Vehicle Allocation Management
      </Typography>

      {/* Driver Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Driver
          </Typography>
          <Grid container spacing={2}>
            {mockDrivers.map((driver) => (
              <Grid item key={driver.id}>
                <Button
                  variant={selectedDriverId === driver.id ? 'contained' : 'outlined'}
                  onClick={() => dispatch(setSelectedDriver(driver.id))}
                  startIcon={<Person />}
                >
                  {driver.firstName} {driver.lastName}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {selectedDriverId && (
        <>
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Vehicle Allocations" icon={<DirectionsCar />} />
              <Tab label="Schedules" icon={<Schedule />} />
              <Tab label="Manifests" icon={<Assignment />} />
              <Tab label="Job Consignments" icon={<Work />} />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={selectedTab} index={0}>
            {/* Vehicle Allocations */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vehicle Allocations for {mockDrivers.find(d => d.id === selectedDriverId)?.firstName} {mockDrivers.find(d => d.id === selectedDriverId)?.lastName}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Allocation Date</TableCell>
                        <TableCell>Deallocation Date</TableCell>
                        <TableCell>Schedule Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockAllocations
                        .filter(allocation => allocation.driverId === selectedDriverId)
                        .map((allocation) => {
                          const vehicle = mockVehicles.find(v => v.id === allocation.vehicleId);
                          return (
                            <TableRow key={allocation.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {vehicle?.registration}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {vehicle?.make} {vehicle?.model} ({vehicle?.type})
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{formatDate(allocation.allocationDate)}</TableCell>
                              <TableCell>
                                {allocation.deallocationDate ? formatDate(allocation.deallocationDate) : 'Active'}
                              </TableCell>
                              <TableCell>{allocation.scheduleTitle}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getStatusIcon(allocation.status)}
                                  label={allocation.status}
                                  color={getStatusColor(allocation.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Schedule">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewSchedule(allocation.id)}
                                  >
                                    <Schedule />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Manifest">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewManifest(allocation.id)}
                                  >
                                    <Assignment />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Consignments">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewConsignments(allocation.id)}
                                  >
                                    <Work />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            {/* Schedules */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Allocation Schedules
                </Typography>
                <Grid container spacing={2}>
                  {mockSchedules
                    .filter(schedule => schedule.driverId === selectedDriverId)
                    .map((schedule) => {
                      const vehicle = mockVehicles.find(v => v.id === schedule.vehicleId);
                      return (
                        <Grid item xs={12} md={6} key={schedule.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {schedule.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {schedule.description}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={schedule.status}
                                  color={getStatusColor(schedule.status) as any}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Chip
                                  icon={<DirectionsCar />}
                                  label={vehicle?.registration}
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                              <Grid container spacing={1} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Start Date
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDate(schedule.startDate)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    End Date
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDate(schedule.endDate)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Total Jobs
                                  </Typography>
                                  <Typography variant="body2">
                                    {schedule.totalJobs}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Est. Distance
                                  </Typography>
                                  <Typography variant="body2">
                                    {schedule.estimatedDistance} miles
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Assignment />}
                                  onClick={() => handleViewManifest(schedule.id)}
                                >
                                  View Manifest
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Work />}
                                  onClick={() => handleViewConsignments(schedule.id)}
                                >
                                  View Consignments
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            {/* Manifests */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manifests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on a schedule to view its detailed manifest
                </Typography>
                <Grid container spacing={2}>
                  {mockSchedules
                    .filter(schedule => schedule.driverId === selectedDriverId)
                    .map((schedule) => (
                      <Grid item xs={12} md={6} key={schedule.id}>
                        <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleViewManifest(schedule.id)}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {schedule.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {schedule.description}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Chip
                                icon={getStatusIcon(schedule.status)}
                                label={schedule.status}
                                color={getStatusColor(schedule.status) as any}
                                size="small"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={selectedTab} index={3}>
            {/* Job Consignments */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Consignments
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on a schedule to view its job consignments
                </Typography>
                <Grid container spacing={2}>
                  {mockSchedules
                    .filter(schedule => schedule.driverId === selectedDriverId)
                    .map((schedule) => (
                      <Grid item xs={12} md={6} key={schedule.id}>
                        <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleViewConsignments(schedule.id)}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {schedule.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {schedule.description}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Chip
                                icon={getStatusIcon(schedule.status)}
                                label={schedule.status}
                                color={getStatusColor(schedule.status) as any}
                                size="small"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </>
      )}

      {/* Manifest Dialog */}
      <Dialog
        open={showManifestDialog}
        onClose={() => setShowManifestDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment />
            Manifest: {mockManifest.scheduleTitle}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Schedule Information</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Driver"
                    secondary={mockManifest.driverName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Vehicle"
                    secondary={mockManifest.vehicleRegistration}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date"
                    secondary={formatDate(mockManifest.date)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Jobs"
                    secondary={mockManifest.totalJobs}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Weight"
                    secondary={`${mockManifest.totalWeight} tons`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Volume"
                    secondary={`${mockManifest.totalVolume} m³`}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Route Notes</Typography>
              <Typography variant="body2" paragraph>
                {mockManifest.routeNotes}
              </Typography>
              <Typography variant="h6" gutterBottom>Driver Notes</Typography>
              <Typography variant="body2" paragraph>
                {mockManifest.driverNotes}
              </Typography>
              <Typography variant="h6" gutterBottom>Management Notes</Typography>
              <Typography variant="body2" paragraph>
                {mockManifest.managementNotes}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Job Details</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Number</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Pickup</TableCell>
                      <TableCell>Delivery</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Cargo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockManifest.jobs.map((job) => (
                      <TableRow key={job.jobId}>
                        <TableCell>{job.jobNumber}</TableCell>
                        <TableCell>{job.customerName}</TableCell>
                        <TableCell>{job.pickupLocation}</TableCell>
                        <TableCell>{job.deliveryLocation}</TableCell>
                        <TableCell>{formatTime(job.scheduledTime)}</TableCell>
                        <TableCell>{job.estimatedDuration} min</TableCell>
                        <TableCell>
                          <Chip
                            label={job.status}
                            size="small"
                            color={job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {job.cargoType}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.cargoWeight} tons
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManifestDialog(false)}>Close</Button>
          <Button startIcon={<Download />} variant="contained">
            Download Manifest
          </Button>
          <Button startIcon={<Print />} variant="outlined">
            Print Manifest
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Consignments Dialog */}
      <Dialog
        open={showConsignmentDialog}
        onClose={() => setShowConsignmentDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Work />
            Job Consignments: {mockJobConsignments[0]?.scheduleTitle}
          </Box>
        </DialogTitle>
        <DialogContent>
          {mockJobConsignments.map((consignment) => (
            <Accordion key={consignment.id} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6">{consignment.jobNumber}</Typography>
                  <Chip
                    label={consignment.status}
                    size="small"
                    color={consignment.status === 'completed' ? 'success' : consignment.status === 'in_progress' ? 'warning' : 'default'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {consignment.customerName}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Job Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Customer"
                          secondary={consignment.customerName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Pickup Location"
                          secondary={consignment.pickupLocation}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Delivery Location"
                          secondary={consignment.deliveryLocation}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Scheduled Date"
                          secondary={formatDate(consignment.scheduledDate)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Scheduled Time"
                          secondary={formatTime(consignment.scheduledTime)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Estimated Duration"
                          secondary={`${consignment.estimatedDuration} minutes`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Cargo Details</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Cargo Type"
                          secondary={consignment.cargoType}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Weight"
                          secondary={`${consignment.totalWeight} tons`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Volume"
                          secondary={`${consignment.totalVolume} m³`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Items"
                          secondary={consignment.totalItems}
                        />
                      </ListItem>
                      {consignment.specialRequirements && (
                        <ListItem>
                          <ListItemText
                            primary="Special Requirements"
                            secondary={consignment.specialRequirements}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Consignment Items</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Weight (tons)</TableCell>
                            <TableCell>Volume (m³)</TableCell>
                            <TableCell>Special Handling</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {consignment.consignmentItems.map((item) => (
                            <TableRow key={item.itemId}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {item.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    {item.isFragile && (
                                      <Chip label="Fragile" size="small" color="warning" />
                                    )}
                                    {item.isOversized && (
                                      <Chip label="Oversized" size="small" color="error" />
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{item.weight}</TableCell>
                              <TableCell>{item.volume}</TableCell>
                              <TableCell>
                                {item.specialHandling || 'Standard handling'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Notes</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Driver Notes
                        </Typography>
                        <Typography variant="body2">
                          {consignment.driverNotes || 'No driver notes'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Management Notes
                        </Typography>
                        <Typography variant="body2">
                          {consignment.managementNotes || 'No management notes'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          General Notes
                        </Typography>
                        <Typography variant="body2">
                          {consignment.notes || 'No general notes'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConsignmentDialog(false)}>Close</Button>
          <Button startIcon={<Download />} variant="contained">
            Download Consignments
          </Button>
          <Button startIcon={<Print />} variant="outlined">
            Print Consignments
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Details Dialog */}
      <Dialog
        open={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            Schedule Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedScheduleId && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Schedule Information
              </Typography>
              <Typography variant="body2" paragraph>
                Detailed schedule information would be displayed here, including route planning, 
                job sequencing, and timing details.
              </Typography>
              <Typography variant="body2" paragraph>
                This would integrate with the existing route planning system to show the complete 
                schedule breakdown, estimated arrival times, and any route optimizations.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Close</Button>
          <Button startIcon={<Route />} variant="contained">
            View Route
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverVehicleAllocationView;
