import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import JobConsignmentForm from './JobAllocationForm';
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
  FormHelperText,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Alert,
  Checkbox,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  DirectionsCar,
  CheckCircle,
  Pending,
  PlayArrow,
  Stop,
  Warning,
  Assignment,
  Update,
  Refresh,
  Home,
  ErrorOutline,
  Schedule,
  Cancel,
  LocalShipping,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  DailySchedule,
  JobStatus,
  updateScheduleJobStatus,
  updateJobStatus,
  addDailySchedule,
} from '../store/slices/jobSlice';

interface DailyPlannerProps {
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface NewSchedule {
  vehicleId: string;
  runTitle: string;
  date: string;
  routePlanId: string;
  jobs: string[];
  notes: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dailySchedules, jobs } = useSelector((state: RootState) => state.job);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DailySchedule | null>(null);
  const [selectedJob, setSelectedJob] = useState<{ scheduleId: string; jobId: string } | null>(null);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const [showEditJobDialog, setShowEditJobDialog] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    vehicleId: 'V001', // Default to Vehicle 1
    runTitle: 'City', // Default to "City" as requested
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Today + 1
    routePlanId: '',
    jobs: [],
    notes: '',
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'in_progress' as JobStatus,
    actualStartTime: '',
    actualEndTime: '',
    notes: '',
  });

  // Mock data for vehicles (in a real app, this would come from Redux store)
  const vehicles = [
    { id: 'V001', name: 'HGV-001', type: 'Rigid Truck' },
    { id: 'V002', name: 'HGV-002', type: 'Articulated Lorry' },
    { id: 'V003', name: 'HGV-003', type: 'Box Van' },
  ];

  // Mock data for available jobs (pending jobs that can be scheduled)
  const availableJobs = jobs.filter(job => job.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Schedule />;
      case 'in_progress':
        return <Assignment />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      case 'pending':
        return <Pending />;
      default:
        return <Schedule />;
    }
  };

  const getJobStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'attempted':
        return 'info';
      case 'rescheduled':
        return 'secondary';
      case 'refused':
        return 'error';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getJobStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return <Pending />;
      case 'scheduled':
        return <Schedule />;
      case 'in_progress':
        return <Assignment />;
      case 'completed':
        return <CheckCircle />;
      case 'failed':
        return <Cancel />;
      case 'attempted':
        return <Update />;
      case 'rescheduled':
        return <Schedule />;
      case 'refused':
        return <Cancel />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const openEditDialog = (schedule: DailySchedule) => {
    setSelectedSchedule(schedule);
    setShowEditDialog(true);
  };

  const openViewDialog = (schedule: DailySchedule) => {
    setSelectedSchedule(schedule);
    setShowViewDialog(true);
  };

  const openStatusDialog = (scheduleId: string, jobId: string) => {
    setSelectedJob({ scheduleId, jobId });
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = () => {
    if (selectedJob) {
      // Update schedule job status
      dispatch(updateScheduleJobStatus({
        scheduleId: selectedJob.scheduleId,
        jobId: selectedJob.jobId,
        status: statusUpdate.status,
        actualStartTime: statusUpdate.actualStartTime,
        actualEndTime: statusUpdate.actualEndTime,
        notes: statusUpdate.notes,
      }));

      // Update main job status
      dispatch(updateJobStatus({
        jobId: selectedJob.jobId,
        status: statusUpdate.status,
        driverNotes: statusUpdate.notes,
        actualStartTime: statusUpdate.actualStartTime,
        actualEndTime: statusUpdate.actualEndTime,
      }));

      setShowStatusDialog(false);
      setSelectedJob(null);
      setStatusUpdate({
        status: 'in_progress',
        actualStartTime: '',
        actualEndTime: '',
        notes: '',
      });
    }
  };

  // Function to auto-populate run title from first selected job's city
  const updateRunTitle = (selectedJobIds: string[]) => {
    if (selectedJobIds.length > 0) {
      const firstJob = availableJobs.find(job => job.id === selectedJobIds[0]);
      if (firstJob && firstJob.deliveryLocation && firstJob.deliveryLocation.address) {
        // Extract city from address structure
        const city = firstJob.deliveryLocation.address.city || firstJob.deliveryLocation.address.town;
        if (city) {
          setNewSchedule(prev => ({ ...prev, runTitle: city }));
        }
      }
    } else {
      setNewSchedule(prev => ({ ...prev, runTitle: '' }));
    }
  };

  const handleAddSchedule = () => {
    const schedule: DailySchedule = {
      id: Date.now().toString(),
      vehicleId: newSchedule.vehicleId,
      driverId: undefined, // No driver assigned initially
      date: newSchedule.date,
      routePlanId: newSchedule.routePlanId,
      jobs: newSchedule.jobs.map(jobId => ({
        jobId,
        scheduledTime: '09:00', // Default time, would be configurable
        estimatedDuration: 120, // Default duration, would come from job
        status: 'scheduled' as JobStatus,
      })),
      totalJobs: newSchedule.jobs.length,
      completedJobs: 0,
      totalDistance: 0,
      totalDuration: newSchedule.jobs.length * 120, // Default calculation
      status: 'scheduled',
      notes: newSchedule.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addDailySchedule(schedule));
    setShowAddDialog(false);
    setNewSchedule({
      vehicleId: 'V001', // Reset to default Vehicle 1
      runTitle: 'City', // Reset to default "City"
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Reset to Today + 1
      routePlanId: '',
      jobs: [],
      notes: '',
    });
  };

  const handleEditJob = (job: any) => {
    setJobToEdit(job);
    setShowEditJobDialog(true);
    setShowJobDetailsDialog(false);
  };

  // Calculate statistics
  const totalSchedules = dailySchedules.length;
  const pendingSchedules = dailySchedules.filter(schedule => schedule.status === 'pending').length;
  const scheduledSchedules = dailySchedules.filter(schedule => schedule.status === 'scheduled').length;
  const inProgressSchedules = dailySchedules.filter(schedule => schedule.status === 'in_progress').length;
  const completedSchedules = dailySchedules.filter(schedule => schedule.status === 'completed').length;
  const totalJobs = dailySchedules.reduce((sum, schedule) => sum + schedule.totalJobs, 0);
  const completedJobs = dailySchedules.reduce((sum, schedule) => sum + schedule.completedJobs, 0);

  // Filter schedules for current user if driver
  const userSchedules = user?.role === 'driver' 
    ? dailySchedules.filter(schedule => schedule.driverId === user.id)
    : dailySchedules;

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Planner
        </Typography>
        <Box>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setShowAddDialog(true)}
              sx={{ mr: 2 }}
            >
              Create Schedule
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
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
          <Tab label="Today's Schedules" />
          <Tab label="All Schedules" />
          <Tab label="Pending Deliveries" />
          <Tab label="Vehicle Assignment" />
        </Tabs>
      </Box>

      {/* Today's Schedules Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {userSchedules
            .filter(schedule => schedule.date === new Date().toISOString().split('T')[0])
            .map(schedule => (
              <Grid item xs={12} md={6} lg={4} key={schedule.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {schedule.vehicleId}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(schedule.status)}
                        label={schedule.status.replace('_', ' ')}
                        color={getStatusColor(schedule.status) as any}
                        size="small"
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Driver
                        </Typography>
                        <Typography variant="body2">
                          Driver {schedule.driverId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Jobs
                        </Typography>
                        <Typography variant="body2">
                          {schedule.completedJobs}/{schedule.totalJobs}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2">
                          {Math.round(schedule.totalDuration / 60)}h {schedule.totalDuration % 60}m
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={schedule.totalJobs > 0 ? (schedule.completedJobs / schedule.totalJobs) * 100 : 0}
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => openViewDialog(schedule)}
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

      {/* All Schedules Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Schedule ID</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Jobs</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {schedule.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<DirectionsCar />}
                      label={schedule.vehicleId}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Person />}
                      label={`Driver ${schedule.driverId}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {schedule.completedJobs}/{schedule.totalJobs}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress
                        variant="determinate"
                        value={schedule.totalJobs > 0 ? (schedule.completedJobs / schedule.totalJobs) * 100 : 0}
                        sx={{ width: 60, mr: 1 }}
                      />
                      <Typography variant="caption">
                        {Math.round((schedule.completedJobs / schedule.totalJobs) * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(schedule.status)}
                      label={schedule.status.replace('_', ' ')}
                      color={getStatusColor(schedule.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(schedule)}
                        color="info"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <>
                        <Tooltip title="Edit Schedule">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(schedule)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Schedule">
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

      {/* Pending Deliveries Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Jobs Available for Scheduling
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These jobs are ready to be assigned to vehicles and drivers. Select jobs to create a new schedule.
          </Typography>
        </Box>
        
        {availableJobs.length === 0 ? (
          <Alert severity="info">
            No pending jobs available for scheduling. All jobs have been assigned or completed.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {availableJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        {job.jobNumber}
                      </Typography>
                      <Chip
                        icon={<Pending />}
                        label="Pending"
                        color="default"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body2">
                          {job.customerName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Priority
                        </Typography>
                        <Chip
                          label={job.priority}
                          size="small"
                          color={job.priority === 'high' ? 'error' : job.priority === 'medium' ? 'warning' : 'success'}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Pickup
                        </Typography>
                        <Typography variant="body2">
                          {job.pickupLocation.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery
                        </Typography>
                        <Typography variant="body2">
                          {job.deliveryLocation.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Weight
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {job.cargoWeight || job.loadDimensions?.weight || 'N/A'} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Volume
                        </Typography>
                        <Typography variant="body2">
                          {job.loadDimensions?.volume || 'N/A'} m³
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedJobForDetails(job);
                          setShowJobDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<LocalShipping />}
                        onClick={() => {
                          // Add to schedule creation
                          setNewSchedule(prev => ({
                            ...prev,
                            jobs: [...prev.jobs, job.id]
                          }));
                          setShowAddDialog(true);
                        }}
                      >
                        Add to Schedule
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Vehicle Assignment Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vehicle Assignment Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign vehicles to drivers and manage vehicle-driver allocations for daily schedules.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Vehicle Assignment Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Assign Vehicle to Driver
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Driver</InputLabel>
                      <Select
                        value="driver1"
                        onChange={() => {}}
                        label="Driver"
                      >
                        <MenuItem value="driver1">Adam Mustafa</MenuItem>
                        <MenuItem value="driver2">Jane Manager</MenuItem>
                        <MenuItem value="driver3">Mike Wilson</MenuItem>
                        <MenuItem value="driver4">Sarah Johnson</MenuItem>
                        <MenuItem value="driver5">David Davis</MenuItem>
                        <MenuItem value="driver6">Emma Taylor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Vehicle</InputLabel>
                      <Select
                        value="HGV001"
                        onChange={() => {}}
                        label="Vehicle"
                      >
                        <MenuItem value="HGV001">HGV-001 (Rigid Truck)</MenuItem>
                        <MenuItem value="HGV002">HGV-002 (Articulated Lorry)</MenuItem>
                        <MenuItem value="HGV003">HGV-003 (Box Van)</MenuItem>
                        <MenuItem value="HGV004">HGV-004 (Flatbed)</MenuItem>
                        <MenuItem value="HGV005">HGV-005 (Refrigerated)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Assignment Date"
                      type="date"
                      defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={2}
                      placeholder="Any special instructions or notes for this assignment..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Assignment />}
                    >
                      Assign Vehicle
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Assignments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Current Vehicle Assignments
                </Typography>
                <List dense>
                  <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DirectionsCar />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Adam Mustafa"
                      secondary={
                        <Box>
                          <Typography variant="body2" color="primary">
                            HGV-001 (Rigid Truck)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: Today | Status: Active
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <DirectionsCar />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Jane Manager"
                      secondary={
                        <Box>
                          <Typography variant="body2" color="secondary">
                            HGV-002 (Articulated Lorry)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: Today | Status: Active
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <DirectionsCar />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Sarah Johnson"
                      secondary={
                        <Box>
                          <Typography variant="body2" color="info">
                            HGV-003 (Box Van)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: Today | Status: Active
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <DirectionsCar />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="David Davis"
                      secondary={
                        <Box>
                          <Typography variant="body2" color="success">
                            HGV-004 (Flatbed)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: Today | Status: Active
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <DirectionsCar />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Emma Taylor"
                      secondary={
                        <Box>
                          <Typography variant="body2" color="warning">
                            HGV-005 (Refrigerated)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: Today | Status: Active
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Assignment History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Assignment History
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Driver</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Assignment Date</TableCell>
                        <TableCell>Return Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                            Adam Mustafa
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<DirectionsCar />}
                            label="HGV-001"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              <Person />
                            </Avatar>
                            Jane Manager
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<DirectionsCar />}
                            label="HGV-002"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Schedule Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div">
            Create New Schedule
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={newSchedule.vehicleId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, vehicleId: e.target.value })}
                  label="Vehicle"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Default: Vehicle 1 in the fleet</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Run Title"
                value={newSchedule.runTitle}
                onChange={(e) => setNewSchedule({ ...newSchedule, runTitle: e.target.value })}
                placeholder="Enter run title or auto-populated from first job city"
                helperText="Auto-populated from the first selected job's delivery city, but can be edited"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Default: Tomorrow's date"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Route Plan ID (Optional)"
                value={newSchedule.routePlanId}
                onChange={(e) => setNewSchedule({ ...newSchedule, routePlanId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Jobs to Schedule</InputLabel>
                <Select
                  multiple
                  value={newSchedule.jobs}
                  onChange={(e) => {
                    const selectedJobs = typeof e.target.value === 'string' ? [e.target.value] : e.target.value;
                    // Filter out duplicates
                    const uniqueJobs = selectedJobs.filter((jobId, index, arr) => arr.indexOf(jobId) === index);
                    setNewSchedule({ ...newSchedule, jobs: uniqueJobs });
                    updateRunTitle(uniqueJobs);
                  }}
                  label="Select Jobs to Schedule"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((jobId) => {
                        const job = availableJobs.find(j => j.id === jobId);
                        return (
                          <Chip 
                            key={jobId} 
                            label={job?.jobNumber || jobId} 
                            size="small"
                            onDelete={() => {
                              const updatedJobs = newSchedule.jobs.filter(id => id !== jobId);
                              setNewSchedule({ ...newSchedule, jobs: updatedJobs });
                              updateRunTitle(updatedJobs);
                            }}
                            deleteIcon={<Cancel />}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {availableJobs.filter(job => !newSchedule.jobs.includes(job.id)).map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={false} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {job.jobNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.title} - {job.customerName}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select jobs to schedule. Each job can only be added once. Use the X button on chips to remove jobs.
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                placeholder="Additional notes for this schedule..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSchedule} 
            variant="contained"
            disabled={!newSchedule.vehicleId || newSchedule.jobs.length === 0}
          >
            Create Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Schedule Dialog */}
      {selectedSchedule && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="div">
              Schedule Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Schedule Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle ID
                  </Typography>
                  <Typography variant="body1">
                    {selectedSchedule.vehicleId}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Driver ID
                  </Typography>
                  <Typography variant="body1">
                    {selectedSchedule.driverId}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedSchedule.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedSchedule.status)}
                    label={selectedSchedule.status.replace('_', ' ')}
                    color={getStatusColor(selectedSchedule.status) as any}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Jobs in Schedule
                </Typography>
                {selectedSchedule.jobs.map((job, index) => {
                  const jobDetails = jobs.find(j => j.id === job.jobId);
                  if (!jobDetails) return null;
                  
                  return (
                    <Card key={job.jobId} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            Job #{index + 1}: {jobDetails.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                              icon={getJobStatusIcon(job.status)}
                              label={job.status.replace('_', ' ')}
                              color={getJobStatusColor(job.status) as any}
                              size="small"
                            />
                            {user?.role === 'driver' && job.status !== 'completed' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openStatusDialog(selectedSchedule.id, job.jobId)}
                                startIcon={<Update />}
                              >
                                Update
                              </Button>
                            )}
                          </Box>
                        </Box>

                        <Grid container spacing={3}>
                          {/* Basic Job Information */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Basic Information
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Job Number
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {jobDetails.jobNumber}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Description
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.description}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Priority
                              </Typography>
                              <Chip
                                label={jobDetails.priority}
                                color={jobDetails.priority === 'urgent' ? 'error' : 
                                       jobDetails.priority === 'high' ? 'warning' : 
                                       jobDetails.priority === 'medium' ? 'info' : 'default'}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Scheduled Time
                              </Typography>
                              <Typography variant="body1">
                                {job.scheduledTime}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Estimated Duration
                              </Typography>
                              <Typography variant="body1">
                                {job.estimatedDuration} minutes
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Customer Information */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Customer Information
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Customer Name
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {jobDetails.customerName}
                              </Typography>
                            </Box>
                            {jobDetails.customerPhone && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Phone
                                </Typography>
                                <Typography variant="body1">
                                  {jobDetails.customerPhone}
                                </Typography>
                              </Box>
                            )}
                            {jobDetails.customerEmail && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Email
                                </Typography>
                                <Typography variant="body1">
                                  {jobDetails.customerEmail}
                                </Typography>
                              </Box>
                            )}
                          </Grid>

                          {/* Pickup Location */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              📍 Pickup Location
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight="bold">
                                {jobDetails.pickupLocation.name}
                              </Typography>
                              {jobDetails.pickupLocation.address.line1 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.pickupLocation.address.line1}
                                </Typography>
                              )}
                              {jobDetails.pickupLocation.address.line2 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.pickupLocation.address.line2}
                                </Typography>
                              )}
                              {jobDetails.pickupLocation.address.line3 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.pickupLocation.address.line3}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                {jobDetails.pickupLocation.address.town}
                                {jobDetails.pickupLocation.address.city && `, ${jobDetails.pickupLocation.address.city}`}
                                , {jobDetails.pickupLocation.address.postcode}
                              </Typography>
                              {jobDetails.pickupLocation.contactPerson && (
                                <Typography variant="body2" color="text.secondary">
                                  Contact: {jobDetails.pickupLocation.contactPerson}
                                  {jobDetails.pickupLocation.contactPhone && ` (${jobDetails.pickupLocation.contactPhone})`}
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          {/* Delivery Location */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              🚚 Delivery Location
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight="bold">
                                {jobDetails.deliveryLocation.name}
                              </Typography>
                              {jobDetails.deliveryLocation.address.line1 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.deliveryLocation.address.line1}
                                </Typography>
                              )}
                              {jobDetails.deliveryLocation.address.line2 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.deliveryLocation.address.line2}
                                </Typography>
                              )}
                              {jobDetails.deliveryLocation.address.line3 && (
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.deliveryLocation.address.line3}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                {jobDetails.deliveryLocation.address.town}
                                {jobDetails.deliveryLocation.address.city && `, ${jobDetails.deliveryLocation.address.city}`}
                                , {jobDetails.deliveryLocation.address.postcode}
                              </Typography>
                              {jobDetails.deliveryLocation.contactPerson && (
                                <Typography variant="body2" color="text.secondary">
                                  Contact: {jobDetails.deliveryLocation.contactPerson}
                                  {jobDetails.deliveryLocation.contactPhone && ` (${jobDetails.deliveryLocation.contactPhone})`}
                                </Typography>
                              )}
                              {jobDetails.deliveryLocation.deliveryInstructions && (
                                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                  📝 {jobDetails.deliveryLocation.deliveryInstructions}
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          {/* Alternative Delivery Address - Only show if it actually has data */}
                          {jobDetails.useDifferentDeliveryAddress && 
                           jobDetails.alternativeDeliveryAddress && 
                           jobDetails.alternativeDeliveryAddress.name && 
                           jobDetails.alternativeDeliveryAddress.address.line1 && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                🔄 Alternative Delivery Address
                              </Typography>
                              <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {jobDetails.alternativeDeliveryAddress.name}
                                </Typography>
                                {jobDetails.alternativeDeliveryAddress.address.line1 && (
                                  <Typography variant="body2" color="text.secondary">
                                    {jobDetails.alternativeDeliveryAddress.address.line1}
                                  </Typography>
                                )}
                                {jobDetails.alternativeDeliveryAddress.address.line2 && (
                                  <Typography variant="body2" color="text.secondary">
                                    {jobDetails.alternativeDeliveryAddress.address.line2}
                                  </Typography>
                                )}
                                {jobDetails.alternativeDeliveryAddress.address.line3 && (
                                  <Typography variant="body2" color="text.secondary">
                                    {jobDetails.alternativeDeliveryAddress.address.line3}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                  {jobDetails.alternativeDeliveryAddress.address.town}
                                  {jobDetails.alternativeDeliveryAddress.address.city && `, ${jobDetails.alternativeDeliveryAddress.address.city}`}
                                  , {jobDetails.alternativeDeliveryAddress.address.postcode}
                                </Typography>
                                {jobDetails.alternativeDeliveryAddress.contactPerson && (
                                  <Typography variant="body2" color="text.secondary">
                                    Contact: {jobDetails.alternativeDeliveryAddress.contactPerson}
                                    {jobDetails.alternativeDeliveryAddress.contactPhone && ` (${jobDetails.alternativeDeliveryAddress.contactPhone})`}
                                  </Typography>
                                )}
                                {jobDetails.alternativeDeliveryAddress.deliveryInstructions && (
                                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                    📝 {jobDetails.alternativeDeliveryAddress.deliveryInstructions}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )}

                          {/* Cargo Information */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              📦 Cargo Information
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Cargo Type
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.cargoType}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Cargo Weight
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.cargoWeight} kg
                              </Typography>
                            </Box>
                            {jobDetails.specialRequirements && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Special Requirements
                                </Typography>
                                <Typography variant="body1">
                                  {jobDetails.specialRequirements}
                                </Typography>
                              </Box>
                            )}
                          </Grid>

                          {/* Load Dimensions */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              📏 Load Dimensions
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Dimensions (L × W × H)
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.loadDimensions.length} × {jobDetails.loadDimensions.width} × {jobDetails.loadDimensions.height} cm
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Volume
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.loadDimensions.volume} m³
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Weight
                              </Typography>
                              <Typography variant="body1">
                                {jobDetails.loadDimensions.weight} kg
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {jobDetails.loadDimensions.isOversized && (
                                <Chip label="Oversized" color="warning" size="small" />
                              )}
                              {jobDetails.loadDimensions.isProtruding && (
                                <Chip label="Protruding" color="warning" size="small" />
                              )}
                              {jobDetails.loadDimensions.isFragile && (
                                <Chip label="Fragile" color="error" size="small" />
                              )}
                              {jobDetails.loadDimensions.isBalanced && (
                                <Chip label="Balanced" color="success" size="small" />
                              )}
                            </Box>
                          </Grid>

                          {/* Notes and Additional Information */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              📝 Additional Information
                            </Typography>
                            <Grid container spacing={2}>
                              {jobDetails.notes && (
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      General Notes
                                    </Typography>
                                    <Typography variant="body1">
                                      {jobDetails.notes}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                              {jobDetails.driverNotes && (
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Driver Notes
                                    </Typography>
                                    <Typography variant="body1">
                                      {jobDetails.driverNotes}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                              {jobDetails.managementNotes && (
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Management Notes
                                    </Typography>
                                    <Typography variant="body1">
                                      {jobDetails.managementNotes}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                              {jobDetails.deliveryNotes && (
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Delivery Notes
                                    </Typography>
                                    <Typography variant="body1">
                                      {jobDetails.deliveryNotes}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                              {jobDetails.routeNotes && (
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Route Notes
                                    </Typography>
                                    <Typography variant="body1">
                                      {jobDetails.routeNotes}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                })}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Update Job Status Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value as JobStatus })}
                  label="Status"
                >
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="attempted">Attempted</MenuItem>
                  <MenuItem value="rescheduled">Rescheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Actual Start Time"
                type="time"
                value={statusUpdate.actualStartTime}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, actualStartTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Actual End Time"
                type="time"
                value={statusUpdate.actualEndTime}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, actualEndTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                placeholder="Report any issues, delays, or additional information..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Details Dialog for Pending Jobs */}
      {selectedJobForDetails && (
        <Dialog open={showJobDetailsDialog} onClose={() => setShowJobDetailsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="div">
              Job Details - {selectedJobForDetails.jobNumber}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Basic Job Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📋 Basic Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Job Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedJobForDetails.jobNumber}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.title}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.description}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedJobForDetails.priority}
                    size="small"
                    color={selectedJobForDetails.priority === 'high' ? 'error' : selectedJobForDetails.priority === 'medium' ? 'warning' : 'success'}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={<Pending />}
                    label="Pending"
                    color="default"
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  👤 Customer Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Customer Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerContact?.contactPerson || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerContact?.contactPhone || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerContact?.email || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              {/* Location Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📍 Pickup Location
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation.address?.street}, {selectedJobForDetails.pickupLocation.address?.city}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Postcode
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation.address?.postcode || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation.contactPerson || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation.contactPhone || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  🚚 Delivery Location
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.deliveryLocation.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.deliveryLocation.address?.street}, {selectedJobForDetails.deliveryLocation.address?.city}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Postcode
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.deliveryLocation.address?.postcode || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.deliveryLocation.contactPerson || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.deliveryLocation.contactPhone || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              {/* Cargo Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📦 Cargo Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cargo Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.cargoType || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cargo Weight
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {selectedJobForDetails.cargoWeight || selectedJobForDetails.loadDimensions?.weight || 'N/A'} kg
                  </Typography>
                </Box>
                {selectedJobForDetails.specialRequirements && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Special Requirements
                    </Typography>
                    <Typography variant="body1">
                      {selectedJobForDetails.specialRequirements}
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Load Dimensions */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📏 Load Dimensions
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dimensions (L × W × H)
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.loadDimensions?.length || 'N/A'} × {selectedJobForDetails.loadDimensions?.width || 'N/A'} × {selectedJobForDetails.loadDimensions?.height || 'N/A'} cm
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Volume
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.loadDimensions?.volume || 'N/A'} m³
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Weight
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {selectedJobForDetails.loadDimensions?.weight || 'N/A'} kg
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedJobForDetails.loadDimensions?.isOversized && (
                    <Chip label="Oversized" color="warning" size="small" />
                  )}
                  {selectedJobForDetails.loadDimensions?.isProtruding && (
                    <Chip label="Protruding" color="warning" size="small" />
                  )}
                  {selectedJobForDetails.loadDimensions?.isFragile && (
                    <Chip label="Fragile" color="error" size="small" />
                  )}
                  {selectedJobForDetails.loadDimensions?.isBalanced && (
                    <Chip label="Balanced" color="success" size="small" />
                  )}
                </Box>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  📝 Additional Information
                </Typography>
                <Grid container spacing={2}>
                  {selectedJobForDetails.notes && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">
                          {selectedJobForDetails.notes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedJobForDetails.routeNotes && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Route Notes
                        </Typography>
                        <Typography variant="body1">
                          {selectedJobForDetails.routeNotes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowJobDetailsDialog(false)}>
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => handleEditJob(selectedJobForDetails)}
              sx={{ mr: 1 }}
            >
              Edit Job
            </Button>
            <Button
              variant="contained"
              startIcon={<LocalShipping />}
              onClick={() => {
                setNewSchedule(prev => ({
                  ...prev,
                  jobs: [...prev.jobs, selectedJobForDetails.id]
                }));
                setShowJobDetailsDialog(false);
                setShowAddDialog(true);
              }}
            >
              Add to Schedule
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Job Dialog */}
      {jobToEdit && (
        <Dialog open={showEditJobDialog} onClose={() => setShowEditJobDialog(false)} maxWidth="xl" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="div">
              Edit Job - {jobToEdit.jobNumber}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <JobConsignmentForm 
              onClose={() => setShowEditJobDialog(false)}
              initialData={jobToEdit}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default DailyPlanner; 