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
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Badge,
  Switch,
  FormControlLabel,
  ListItemButton,
  Collapse,
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
  Route,
  Map,
  Timeline,
  Schedule,
  AccessTime,
  LocationOn,
  LocalShipping,
  Notes,
  EditLocation,
  MyLocation,
  Directions,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Today,
  DateRange,
  FilterList,
  Sort,
  Download,
  Print,
  Share,
  Star,
  StarBorder,
  Flag,
  Info,
  Help,
  Close,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobStatus,
  JobAssignment,
  DailySchedule,
  updateScheduleJobStatus,
  updateJobStatus,
} from '../store/slices/jobSlice';
import InteractiveStatusChip, { StatusOption } from './InteractiveStatusChip';
import { parse, differenceInMinutes, isWeekend, format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface DriverPlannerProps {
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
      id={`driver-planner-tabpanel-${index}`}
      aria-labelledby={`driver-planner-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DriverPlanner: React.FC<DriverPlannerProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dailySchedules, jobs } = useSelector((state: RootState) => state.job);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [showDeliveryNotesDialog, setShowDeliveryNotesDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobAssignment | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [routeNotes, setRouteNotes] = useState('');
  const [alternativeRoute, setAlternativeRoute] = useState({
    waypoints: [] as string[],
    estimatedDistance: 0,
    estimatedDuration: 0,
    reason: '',
  });
  const [sortBy, setSortBy] = useState<'time' | 'distance' | 'priority'>('time');
  const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);

  // Filter schedules for current driver
  const driverSchedules = dailySchedules.filter(schedule => schedule.driverId === user?.id);
  
  // Get jobs for selected date(s)
  const getJobsForDate = (date: string) => {
    const schedule = driverSchedules.find(s => s.date === date);
    if (!schedule) return [];
    
    return schedule.jobs.map(scheduleJob => {
      const job = jobs.find(j => j.id === scheduleJob.jobId);
      return job ? { ...job, scheduleJob } : null;
    }).filter(Boolean) as (JobAssignment & { scheduleJob: any })[];
  };

  // Get jobs for current week
  const getJobsForWeek = () => {
    const startOfCurrentWeek = startOfWeek(new Date(selectedDate));
    const endOfCurrentWeek = endOfWeek(new Date(selectedDate));
    
    const weekSchedules = driverSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= startOfCurrentWeek && scheduleDate <= endOfCurrentWeek;
    });

    return weekSchedules.flatMap(schedule => 
      schedule.jobs.map(scheduleJob => {
        const job = jobs.find(j => j.id === scheduleJob.jobId);
        return job ? { ...job, scheduleJob, scheduleDate: schedule.date } : null;
      }).filter(Boolean)
    ) as (JobAssignment & { scheduleJob: any; scheduleDate: string })[];
  };

  // Sort jobs by selected criteria
  const sortJobs = (jobsToSort: any[]) => {
    switch (sortBy) {
      case 'time':
        return jobsToSort.sort((a, b) => a.scheduleJob.scheduledTime.localeCompare(b.scheduleJob.scheduledTime));
      case 'distance':
        return jobsToSort.sort((a, b) => (a.loadDimensions?.volume || 0) - (b.loadDimensions?.volume || 0));
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return jobsToSort.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      default:
        return jobsToSort;
    }
  };

  const currentJobs = viewMode === 'daily' ? sortJobs(getJobsForDate(selectedDate)) : sortJobs(getJobsForWeek());

  // Status functions
  const getJobStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'default';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'attempted': return 'warning';
      case 'rescheduled': return 'secondary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'refused': return 'error';
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
      case 'failed': return <ErrorOutline />;
      case 'refused': return <Stop />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const getJobStatusOptions = (): StatusOption[] => [
    { value: 'attempted', label: 'Attempted', icon: <Assignment />, color: 'warning' },
    { value: 'failed', label: 'Failed', icon: <ErrorOutline />, color: 'error' },
    { value: 'refused', label: 'Refused', icon: <Stop />, color: 'error' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle />, color: 'success' },
  ];

  // Route optimization functions
  const calculateOptimalRoute = (jobsToOptimize: any[]) => {
    // Simple distance-based optimization (in real app, would use Google Maps API)
    const sortedByDistance = jobsToOptimize.sort((a, b) => {
      const aDistance = a.loadDimensions?.volume || 0;
      const bDistance = b.loadDimensions?.volume || 0;
      return aDistance - bDistance;
    });
    
    return sortedByDistance;
  };

  const handleDeliveryNotesUpdate = () => {
    if (selectedJob) {
      dispatch(updateJobStatus({
        jobId: selectedJob.id,
        status: selectedJob.status,
        driverNotes: deliveryNotes,
      }));
      setShowDeliveryNotesDialog(false);
      setDeliveryNotes('');
      setSelectedJob(null);
    }
  };

  const handleRouteUpdate = () => {
    if (selectedJob) {
      // In a real app, this would update the route in the backend
      // Alternative route saved
      setShowRouteDialog(false);
      setAlternativeRoute({ waypoints: [], estimatedDistance: 0, estimatedDuration: 0, reason: '' });
      setSelectedJob(null);
    }
  };

  const openDeliveryNotesDialog = (job: JobAssignment) => {
    setSelectedJob(job);
    setDeliveryNotes(job.deliveryNotes || '');
    setShowDeliveryNotesDialog(true);
  };

  const openRouteDialog = (job: JobAssignment) => {
    setSelectedJob(job);
    setAlternativeRoute(job.alternativeRoute || { waypoints: [], estimatedDistance: 0, estimatedDuration: 0, reason: '' });
    setShowRouteDialog(true);
  };

  // Calculate statistics
  const totalJobs = currentJobs.length;
  const completedJobs = currentJobs.filter(job => job.status === 'completed').length;
  const pendingJobs = currentJobs.filter(job => job.status === 'pending' || job.status === 'assigned').length;
  const totalDistance = currentJobs.reduce((sum, job) => sum + (job.loadDimensions?.volume || 0), 0);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Driver Planner Dashboard
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showOptimizedRoute}
                onChange={(e) => setShowOptimizedRoute(e.target.checked)}
              />
            }
            label="Show Optimized Route"
          />
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>



      {/* Date Selection and Controls */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <FormControl>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'daily' | 'weekly')}
                label="View Mode"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'distance' | 'priority')}
                label="Sort By"
              >
                <MenuItem value="time">Time</MenuItem>
                <MenuItem value="distance">Distance</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {/* Export functionality */}}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
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
          <Tab label="Schedule Report" />
          <Tab label="Route Optimization" />
          <Tab label="Delivery Notes" />
        </Tabs>
      </Box>

      {/* Schedule Report Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Jobs List */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {viewMode === 'daily' ? 'Daily' : 'Weekly'} Schedule Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Job Details</TableCell>
                        <TableCell>Delivery Address</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {job.scheduleJob.scheduledTime}
                            </Typography>
                            {viewMode === 'weekly' && (
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(job.scheduleDate), 'MMM dd')}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {job.jobNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.title}
                            </Typography>
                            <Chip
                              label={job.priority}
                              size="small"
                              color={job.priority === 'urgent' ? 'error' : job.priority === 'high' ? 'warning' : 'default'}
                              sx={{ mt: 0.5 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {job.deliveryLocation.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.deliveryLocation.address}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {job.deliveryLocation.postcode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <InteractiveStatusChip
                              status={job.status.replace('_', ' ')}
                              statusIcon={getJobStatusIcon(job.status)}
                              statusColor={getJobStatusColor(job.status)}
                              statusOptions={getJobStatusOptions()}
                              onStatusChange={(newStatus) => {
                                dispatch(updateJobStatus({
                                  jobId: job.id,
                                  status: newStatus as JobStatus,
                                }));
                              }}
                              disabled={false}
                              tooltipText="Click to update status"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Delivery Notes">
                              <IconButton onClick={() => openDeliveryNotesDialog(job)}>
                                <Notes />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Route Options">
                              <IconButton onClick={() => openRouteDialog(job)}>
                                <Route />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
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

      {/* Route Optimization Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Route Optimization
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Optimize your route based on distance, traffic, and delivery windows
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Original Route
                    </Typography>
                    <List>
                      {currentJobs.map((job, index) => (
                        <ListItem key={job.id}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={job.deliveryLocation.name}
                            secondary={`${job.scheduleJob.scheduledTime} - ${job.jobNumber}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Optimized Route
                    </Typography>
                    <List>
                      {calculateOptimalRoute(currentJobs).map((job, index) => (
                        <ListItem key={job.id}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'success.main' }}>
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={job.deliveryLocation.name}
                            secondary={`${job.scheduleJob.scheduledTime} - ${job.jobNumber}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Delivery Notes Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {currentJobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {job.jobNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.priority}
                      size="small"
                      color={job.priority === 'urgent' ? 'error' : job.priority === 'high' ? 'warning' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Delivery Address:</strong> {job.deliveryLocation.address}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Contact:</strong> {job.deliveryLocation.contactPerson} - {job.deliveryLocation.contactPhone}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Instructions:</strong> {job.deliveryLocation.deliveryInstructions}
                  </Typography>
                  
                  {job.deliveryNotes && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Notes:</strong> {job.deliveryNotes}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => openDeliveryNotesDialog(job)}
                    >
                      Edit Notes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Delivery Notes Dialog */}
      <Dialog
        open={showDeliveryNotesDialog}
        onClose={() => setShowDeliveryNotesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Delivery Notes - {selectedJob?.jobNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Notes"
                multiline
                rows={4}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Add any notes about the delivery, customer preferences, or special instructions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeliveryNotesDialog(false)}>Cancel</Button>
          <Button onClick={handleDeliveryNotesUpdate} variant="contained">Save Notes</Button>
        </DialogActions>
      </Dialog>

      {/* Route Dialog */}
      <Dialog
        open={showRouteDialog}
        onClose={() => setShowRouteDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Route Options - {selectedJob?.jobNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Route Notes"
                multiline
                rows={3}
                value={routeNotes}
                onChange={(e) => setRouteNotes(e.target.value)}
                placeholder="Add notes about the route, traffic conditions, or alternative paths..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alternative Route Reason"
                value={alternativeRoute.reason}
                onChange={(e) => setAlternativeRoute(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Why is an alternative route needed?"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated Distance (miles)"
                type="number"
                value={alternativeRoute.estimatedDistance}
                onChange={(e) => setAlternativeRoute(prev => ({ ...prev, estimatedDistance: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={alternativeRoute.estimatedDuration}
                onChange={(e) => setAlternativeRoute(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRouteDialog(false)}>Cancel</Button>
          <Button onClick={handleRouteUpdate} variant="contained">Save Route</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverPlanner;
