import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Add,
  Pending,
  PlayArrow,
  Stop,
  Warning,
  Assignment,
  Update,
  Refresh,
  Work,
  Timer,
  Payment,
  Receipt,
  AccountBalance,
  Home,
  ErrorOutline,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobStatus,
  updateScheduleJobStatus,
  updateJobStatus,
} from '../store/slices/jobSlice';
import { parse, differenceInMinutes, isWeekend } from 'date-fns';

interface DriverDashboardProps {
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
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dailySchedules, jobs } = useSelector((state: RootState) => state.job);
  const { user } = useSelector((state: RootState) => state.auth);
  const { wageSettings } = useSelector((state: RootState) => state.wage);

  const [tabValue, setTabValue] = useState(0);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ scheduleId: string; jobId: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [timeEntry, setTimeEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakMinutes: 0,
    lunchMinutes: 0,
    notes: '',
  });

  // Get driver's wage settings
  const driverWageSetting = wageSettings.find(setting => setting.driverId === user?.id);

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
      case 'completed': return <Stop />;
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
      case 'completed': return <Stop />;
      case 'failed': return <ErrorOutline />;
      case 'refused': return <Stop />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const openStatusDialog = (scheduleId: string, jobId: string) => {
    setSelectedJob({ scheduleId, jobId });
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = (status: JobStatus, actualStartTime?: string, actualEndTime?: string, notes?: string) => {
    if (selectedJob) {
      // Update schedule job status
      dispatch(updateScheduleJobStatus({
        scheduleId: selectedJob.scheduleId,
        jobId: selectedJob.jobId,
        status,
        actualStartTime,
        actualEndTime,
        notes,
      }));

      // Update main job status
      dispatch(updateJobStatus({
        jobId: selectedJob.jobId,
        status,
        driverNotes: notes,
        actualStartTime,
        actualEndTime,
      }));

      setShowStatusDialog(false);
      setSelectedJob(null);
    }
  };

  // Filter schedules for current driver
  const driverSchedules = dailySchedules.filter(schedule => schedule.driverId === user?.id);
  const todaySchedules = driverSchedules.filter(schedule => schedule.date === selectedDate);

  // Calculate daily hours and wages
  const calculateDailyHours = (date: string) => {
    const daySchedules = driverSchedules.filter(schedule => schedule.date === date);
    let totalMinutes = 0;
    
    daySchedules.forEach(schedule => {
      schedule.jobs.forEach(job => {
        if (job.actualStartTime && job.actualEndTime) {
          const start = parse(job.actualStartTime, 'HH:mm', new Date());
          const end = parse(job.actualEndTime, 'HH:mm', new Date());
          totalMinutes += differenceInMinutes(end, start);
        } else {
          totalMinutes += job.estimatedDuration;
        }
      });
    });
    
    return totalMinutes;
  };

  const calculateDailyWage = (date: string) => {
    if (!driverWageSetting) return { standardPay: 0, overtimePay: 0, totalPay: 0 };
    
    const totalMinutes = calculateDailyHours(date);
    const isWeekendDay = isWeekend(new Date(date));
    
    // Parse standard times
    const standardStart = parse(driverWageSetting.standardStartTime, 'HH:mm', new Date());
    const standardEnd = parse(driverWageSetting.standardEndTime, 'HH:mm', new Date());
    
    let standardMinutes = 0;
    let overtimeMinutes = 0;
    
    if (isWeekendDay) {
      // All weekend hours are overtime
      overtimeMinutes = totalMinutes;
    } else {
      // Calculate standard vs overtime for weekdays
      const daySchedules = driverSchedules.filter(schedule => schedule.date === date);
      
      daySchedules.forEach(schedule => {
        schedule.jobs.forEach(job => {
          if (job.actualStartTime && job.actualEndTime) {
            const jobStart = parse(job.actualStartTime, 'HH:mm', new Date());
            const jobEnd = parse(job.actualEndTime, 'HH:mm', new Date());
            
            // Calculate minutes before standard start time
            if (jobStart < standardStart) {
              const earlyMinutes = differenceInMinutes(standardStart, jobStart);
              overtimeMinutes += Math.min(earlyMinutes, differenceInMinutes(jobEnd, jobStart));
            }
            
            // Calculate minutes after standard end time
            if (jobEnd > standardEnd) {
              const lateMinutes = differenceInMinutes(jobEnd, standardEnd);
              overtimeMinutes += Math.min(lateMinutes, differenceInMinutes(jobEnd, jobStart));
            }
            
            // Calculate standard minutes
            const standardJobStart = jobStart < standardStart ? standardStart : jobStart;
            const standardJobEnd = jobEnd > standardEnd ? standardEnd : jobEnd;
            
            if (standardJobStart < standardJobEnd) {
              standardMinutes += differenceInMinutes(standardJobEnd, standardJobStart);
            }
          } else {
            // Use estimated duration if no actual times
            standardMinutes += job.estimatedDuration;
          }
        });
      });
    }
    
    const standardPay = (standardMinutes / 60) * driverWageSetting.hourlyRate;
    const overtimePay = (overtimeMinutes / 60) * driverWageSetting.overtimeRate;
    const totalPay = standardPay + overtimePay;
    
    return { standardPay, overtimePay, totalPay, standardMinutes, overtimeMinutes };
  };

  // Get last 7 days for wage summary
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Driver Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
        <Box>
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
          <Tab label="Today's Jobs" />
          <Tab label="Hours & Pay" />
          <Tab label="Job History" />
          <Tab label="Fuel" />
        </Tabs>
      </Box>

      {/* Today's Jobs Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowTimeEntryDialog(true)}
          >
            Add Time Entry
          </Button>
        </Box>

        {todaySchedules.length === 0 ? (
          <Alert severity="info">
            No jobs scheduled for {new Date(selectedDate).toLocaleDateString()}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {todaySchedules.map(schedule => (
              <Grid item xs={12} key={schedule.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Vehicle: {schedule.vehicleId}
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
                                  {job.status !== 'completed' && (
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
        )}
      </TabPanel>

      {/* Hours & Pay Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Hours & Pay Breakdown
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                    <Typography variant="h6">
                      {Math.round(calculateDailyHours(selectedDate) / 60)}h {calculateDailyHours(selectedDate) % 60}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Standard Hours
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {Math.round((calculateDailyWage(selectedDate)?.standardMinutes || 0) / 60)}h {(calculateDailyWage(selectedDate)?.standardMinutes || 0) % 60}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Overtime Hours
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {Math.round((calculateDailyWage(selectedDate)?.overtimeMinutes || 0) / 60)}h {(calculateDailyWage(selectedDate)?.overtimeMinutes || 0) % 60}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Pay
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      £{(calculateDailyWage(selectedDate)?.totalPay || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Standard Rate:</strong> £{driverWageSetting?.hourlyRate || 0}/hr
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Overtime Rate:</strong> £{driverWageSetting?.overtimeRate || 0}/hr
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Standard Hours:</strong> {driverWageSetting?.standardStartTime || '08:00'} - {driverWageSetting?.standardEndTime || '16:00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pay Breakdown
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Standard Pay
                  </Typography>
                  <Typography variant="h6" color="primary">
                    £{(calculateDailyWage(selectedDate)?.standardPay || 0).toFixed(2)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                                        value={(calculateDailyWage(selectedDate)?.totalPay || 0) > 0 ?
                          ((calculateDailyWage(selectedDate)?.standardPay || 0) / (calculateDailyWage(selectedDate)?.totalPay || 1)) * 100 : 0}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overtime Pay
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    £{(calculateDailyWage(selectedDate)?.overtimePay || 0).toFixed(2)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(calculateDailyWage(selectedDate)?.totalPay || 0) > 0 ? 
                          ((calculateDailyWage(selectedDate)?.overtimePay || 0) / (calculateDailyWage(selectedDate)?.totalPay || 1)) * 100 : 0}
                    sx={{ mt: 1 }}
                    color="warning"
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="h6" color="success.main">
                    Total: £{(calculateDailyWage(selectedDate)?.totalPay || 0).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>



      {/* Job History Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Job History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Job</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Pay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {driverSchedules
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map(schedule => 
                      schedule.jobs.map(job => {
                        const jobDetails = jobs.find(j => j.id === job.jobId);
                        return jobDetails ? (
                          <TableRow key={`${schedule.id}-${job.jobId}`}>
                            <TableCell>
                              {new Date(schedule.date).toLocaleDateString()}
                            </TableCell>
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
                              {job.actualStartTime && job.actualEndTime ? (
                                `${job.actualStartTime} - ${job.actualEndTime}`
                              ) : (
                                `${job.scheduledTime} (${Math.round(job.estimatedDuration / 60)}h)`
                              )}
                            </TableCell>
                            <TableCell>
                              £{((job.estimatedDuration / 60) * (driverWageSetting?.hourlyRate || 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Fuel Tab */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fuel Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your fuel purchase details for today
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Odometer Reading"
                  type="number"
                  placeholder="e.g., 125450"
                  helperText="Enter the current odometer reading"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Litres"
                  type="number"
                  placeholder="e.g., 150.5"
                  helperText="Enter the number of litres purchased"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price per Litre (£)"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  placeholder="e.g., 1.85"
                  helperText="Enter the price per litre"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Receipt Number"
                  placeholder="e.g., REC-2024-001"
                  helperText="Enter the receipt number from the fuel station"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                  helperText="Date of fuel purchase"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  sx={{ height: 56 }}
                >
                  Capture Receipt
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 2 }}
                >
                  Submit Fuel Entry
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Update Job Status Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select new status for this job:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => handleStatusUpdate('in_progress')}
                sx={{ mb: 1 }}
              >
                Start Job (In Progress)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Warning />}
                onClick={() => handleStatusUpdate('attempted')}
                sx={{ mb: 1 }}
              >
                Attempted (Issues)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => handleStatusUpdate('rescheduled')}
                sx={{ mb: 1 }}
              >
                Rescheduled
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<Stop />}
                onClick={() => handleStatusUpdate('completed')}
                sx={{ mb: 1 }}
              >
                Completed
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Stop />}
                onClick={() => handleStatusUpdate('failed')}
              >
                Failed
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Time Entry Dialog */}
      <Dialog open={showTimeEntryDialog} onClose={() => setShowTimeEntryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Time Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={timeEntry.date}
                onChange={(e) => setTimeEntry({ ...timeEntry, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={timeEntry.startTime}
                onChange={(e) => setTimeEntry({ ...timeEntry, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={timeEntry.endTime}
                onChange={(e) => setTimeEntry({ ...timeEntry, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Break Minutes"
                type="number"
                value={timeEntry.breakMinutes}
                onChange={(e) => setTimeEntry({ ...timeEntry, breakMinutes: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lunch Minutes"
                type="number"
                value={timeEntry.lunchMinutes}
                onChange={(e) => setTimeEntry({ ...timeEntry, lunchMinutes: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={timeEntry.notes}
                onChange={(e) => setTimeEntry({ ...timeEntry, notes: e.target.value })}
                placeholder="Any additional notes about your work day..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTimeEntryDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Here you would typically save the time entry
              setShowTimeEntryDialog(false);
              setTimeEntry({
                date: new Date().toISOString().split('T')[0],
                startTime: '',
                endTime: '',
                breakMinutes: 0,
                lunchMinutes: 0,
                notes: '',
              });
            }} 
            variant="contained"
          >
            Save Time Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverDashboard; 