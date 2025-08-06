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
  Schedule,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
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
  Timeline as TimelineIcon,
  Speed,
  Assignment,
  Update,
  Report,
  Refresh,
  CalendarToday,
  Today,
  NextWeek,
  Home,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  DailySchedule,
  JobAssignment,
  JobStatus,
  addDailySchedule,
  updateDailySchedule,
  deleteDailySchedule,
  updateScheduleJobStatus,
  updateJobStatus,
} from '../store/slices/jobSlice';

interface DailyPlannerProps {
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
      id={`planner-tabpanel-${index}`}
      aria-labelledby={`planner-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dailySchedules, jobs } = useSelector((state: RootState) => state.job);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DailySchedule | null>(null);
  const [selectedJob, setSelectedJob] = useState<{ scheduleId: string; jobId: string } | null>(null);

  const [newSchedule, setNewSchedule] = useState({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    routePlanId: '',
    jobs: [] as { jobId: string; scheduledTime: string; estimatedDuration: number; status: JobStatus }[],
    notes: '',
  });

  const [statusUpdate, setStatusUpdate] = useState({
    status: 'in_progress' as JobStatus,
    actualStartTime: '',
    actualEndTime: '',
    notes: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Pending />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const getJobStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'default';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'attempted': return 'warning';
      case 'rescheduled': return 'secondary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getJobStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'assigned': return <Assignment />;
      case 'in_progress': return <PlayArrow />;
      case 'attempted': return <Warning />;
      case 'rescheduled': return <Refresh />;
      case 'completed': return <CheckCircle />;
      case 'failed': return <Stop />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const handleAddSchedule = () => {
    const schedule: DailySchedule = {
      id: Date.now().toString(),
      ...newSchedule,
      totalJobs: newSchedule.jobs.length,
      completedJobs: 0,
      totalDistance: 0,
      totalDuration: newSchedule.jobs.reduce((sum, job) => sum + job.estimatedDuration, 0),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addDailySchedule(schedule));
    setShowAddDialog(false);
    setNewSchedule({
      vehicleId: '',
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      routePlanId: '',
      jobs: [],
      notes: '',
    });
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

  // Calculate statistics
  const totalSchedules = dailySchedules.length;
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
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Planner
        </Typography>
        <Box>
          {user?.role === 'management' && (
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

      {/* Schedule Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalSchedules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {scheduledSchedules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {inProgressSchedules}
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
                {completedSchedules}
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
                {totalJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {completedJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Jobs
              </Typography>
              <LinearProgress
                variant="determinate"
                value={totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0}
                sx={{ mt: 1 }}
              />
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
          <Tab label="Today's Schedules" />
          <Tab label="All Schedules" />
          <Tab label="Timeline View" />
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
                    {user?.role === 'management' && (
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

      {/* Timeline View Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {userSchedules
            .filter(schedule => schedule.date === new Date().toISOString().split('T')[0])
            .map(schedule => (
              <Grid item xs={12} key={schedule.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {schedule.vehicleId} - Driver {schedule.driverId}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(schedule.status)}
                        label={schedule.status.replace('_', ' ')}
                        color={getStatusColor(schedule.status) as any}
                        size="small"
                      />
                    </Box>
                    <List>
                      {schedule.jobs.map((job, index) => {
                        const jobDetails = jobs.find(j => j.id === job.jobId);
                        return jobDetails ? (
                          <ListItem key={job.jobId} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              <Box sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: getJobStatusColor(job.status) === 'success' ? 'success.main' : 
                                         getJobStatusColor(job.status) === 'error' ? 'error.main' :
                                         getJobStatusColor(job.status) === 'warning' ? 'warning.main' :
                                         getJobStatusColor(job.status) === 'primary' ? 'primary.main' : 'grey.300'
                              }}>
                                {getJobStatusIcon(job.status)}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" component="span">
                                    {index + 1}. {jobDetails.title}
                                  </Typography>
                                  <Chip
                                    icon={getJobStatusIcon(job.status)}
                                    label={job.status.replace('_', ' ')}
                                    color={getJobStatusColor(job.status) as any}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Time:</strong> {job.scheduledTime} | <strong>Customer:</strong> {jobDetails.customerName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Route:</strong> {jobDetails.pickupLocation.name} → {jobDetails.deliveryLocation.name}
                                  </Typography>
                                  {user?.role === 'driver' && job.status !== 'completed' && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => openStatusDialog(schedule.id, job.jobId)}
                                      startIcon={<Update />}
                                      sx={{ mt: 1 }}
                                    >
                                      Update Status
                                    </Button>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ) : null;
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      {/* View Schedule Dialog */}
      {selectedSchedule && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Schedule Details: {selectedSchedule.vehicleId}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Schedule Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Vehicle:</strong> {selectedSchedule.vehicleId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Driver:</strong> Driver {selectedSchedule.driverId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {new Date(selectedSchedule.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    icon={getStatusIcon(selectedSchedule.status)}
                    label={selectedSchedule.status.replace('_', ' ')}
                    color={getStatusColor(selectedSchedule.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Progress Summary
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Jobs:</strong> {selectedSchedule.totalJobs}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Completed Jobs:</strong> {selectedSchedule.completedJobs}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Duration:</strong> {Math.round(selectedSchedule.totalDuration / 60)}h {selectedSchedule.totalDuration % 60}m
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Distance:</strong> {selectedSchedule.totalDistance} miles
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={selectedSchedule.totalJobs > 0 ? (selectedSchedule.completedJobs / selectedSchedule.totalJobs) * 100 : 0}
                  />
                  <Typography variant="caption">
                    {Math.round((selectedSchedule.completedJobs / selectedSchedule.totalJobs) * 100)}% Complete
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Scheduled Jobs
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Job</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSchedule.jobs.map((job) => {
                        const jobDetails = jobs.find(j => j.id === job.jobId);
                        return jobDetails ? (
                          <TableRow key={job.jobId}>
                            <TableCell>{job.scheduledTime}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {jobDetails.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {jobDetails.pickupLocation.name} → {jobDetails.deliveryLocation.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{jobDetails.customerName}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getJobStatusIcon(job.status)}
                                label={job.status.replace('_', ' ')}
                                color={getJobStatusColor(job.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
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
    </Box>
  );
};

export default DailyPlanner; 