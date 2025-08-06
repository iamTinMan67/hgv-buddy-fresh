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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Assignment,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  Schedule,
  LocalShipping,
  Person,
  LocationOn,
  Phone,
  Email,
  Warning,
  CheckCircle,
  Error,
  Pending,
  PlayArrow,
  Stop,
  Refresh,
  Route,
  CalendarToday,
  AccessTime,
  DirectionsCar,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobAssignment as JobAssignmentType,
  JobStatus,
  JobPriority,
  JobLocation,
  addJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  assignJobToDriver,
} from '../store/slices/jobSlice';

interface JobAssignmentProps {
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
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const JobAssignment: React.FC<JobAssignmentProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs } = useSelector((state: RootState) => state.job);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobAssignmentType | null>(null);

  const [newJob, setNewJob] = useState({
    jobNumber: '',
    title: '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    priority: 'medium' as JobPriority,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 120,
    cargoType: '',
    cargoWeight: 0,
    specialRequirements: '',
    notes: '',
    pickupLocation: {
      id: '',
      name: '',
      address: '',
      postcode: '',
      contactPerson: '',
      contactPhone: '',
      deliveryInstructions: '',
    },
    deliveryLocation: {
      id: '',
      name: '',
      address: '',
      postcode: '',
      contactPerson: '',
      contactPhone: '',
      deliveryInstructions: '',
    },
  });

  const getStatusColor = (status: JobStatus) => {
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

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'assigned': return <Assignment />;
      case 'in_progress': return <PlayArrow />;
      case 'attempted': return <Warning />;
      case 'rescheduled': return <Refresh />;
      case 'completed': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const handleAddJob = () => {
    const job: JobAssignmentType = {
      id: Date.now().toString(),
      ...newJob,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'management',
    };
    dispatch(addJob(job));
    setShowAddDialog(false);
    setNewJob({
      jobNumber: '',
      title: '',
      description: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      estimatedDuration: 120,
      cargoType: '',
      cargoWeight: 0,
      specialRequirements: '',
      notes: '',
      pickupLocation: {
        id: '',
        name: '',
        address: '',
        postcode: '',
        contactPerson: '',
        contactPhone: '',
        deliveryInstructions: '',
      },
      deliveryLocation: {
        id: '',
        name: '',
        address: '',
        postcode: '',
        contactPerson: '',
        contactPhone: '',
        deliveryInstructions: '',
      },
    });
  };

  const openEditDialog = (job: JobAssignmentType) => {
    setSelectedJob(job);
    setShowEditDialog(true);
  };

  const openViewDialog = (job: JobAssignmentType) => {
    setSelectedJob(job);
    setShowViewDialog(true);
  };

  const openAssignDialog = (job: JobAssignmentType) => {
    setSelectedJob(job);
    setShowAssignDialog(true);
  };

  // Calculate statistics
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const assignedJobs = jobs.filter(job => job.status === 'assigned').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const urgentJobs = jobs.filter(job => job.priority === 'urgent').length;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Job Assignment
        </Typography>
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowAddDialog(true)}
            sx={{ mr: 2 }}
          >
            Add New Job
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Job Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
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
              <Typography variant="h4" color="info.main">
                {pendingJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {assignedJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {inProgressJobs}
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
                {completedJobs}
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
              <Typography variant="h4" color="error.main">
                {urgentJobs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Urgent
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
          <Tab label="All Jobs" />
          <Tab label="Pending Jobs" />
          <Tab label="Assigned Jobs" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      {/* All Jobs Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {job.jobNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {job.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.priority}
                      color={getPriorityColor(job.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(job.status)}
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {job.assignedDriver ? (
                      <Chip
                        label={`Driver ${job.assignedDriver}`}
                        size="small"
                        color="info"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.scheduledTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(job)}
                        color="info"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Job">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(job)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {job.status === 'pending' && (
                      <Tooltip title="Assign Job">
                        <IconButton
                          size="small"
                          onClick={() => openAssignDialog(job)}
                          color="secondary"
                        >
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Job">
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

      {/* Pending Jobs Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs
                .filter(job => job.status === 'pending')
                .map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.jobNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {job.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{job.customerName}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.priority}
                        color={getPriorityColor(job.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(job.scheduledDate).toLocaleDateString()} {job.scheduledTime}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Assignment />}
                        onClick={() => openAssignDialog(job)}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Add Job Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Number"
                value={newJob.jobNumber}
                onChange={(e) => setNewJob({ ...newJob, jobNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newJob.priority}
                  onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as JobPriority })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newJob.customerName}
                onChange={(e) => setNewJob({ ...newJob, customerName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Customer Phone"
                value={newJob.customerPhone}
                onChange={(e) => setNewJob({ ...newJob, customerPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Customer Email"
                type="email"
                value={newJob.customerEmail}
                onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="date"
                value={newJob.scheduledDate}
                onChange={(e) => setNewJob({ ...newJob, scheduledDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Time"
                type="time"
                value={newJob.scheduledTime}
                onChange={(e) => setNewJob({ ...newJob, scheduledTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo Type"
                value={newJob.cargoType}
                onChange={(e) => setNewJob({ ...newJob, cargoType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo Weight (kg)"
                type="number"
                value={newJob.cargoWeight}
                onChange={(e) => setNewJob({ ...newJob, cargoWeight: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements"
                multiline
                rows={2}
                value={newJob.specialRequirements}
                onChange={(e) => setNewJob({ ...newJob, specialRequirements: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={newJob.notes}
                onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddJob} variant="contained">
            Add Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Job Dialog */}
      {selectedJob && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Job Details: {selectedJob.jobNumber}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Title:</strong> {selectedJob.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong> {selectedJob.description}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    icon={getStatusIcon(selectedJob.status)}
                    label={selectedJob.status.replace('_', ' ')}
                    color={getStatusColor(selectedJob.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Priority:</strong> 
                  <Chip
                    label={selectedJob.priority}
                    color={getPriorityColor(selectedJob.priority) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {selectedJob.customerName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selectedJob.customerPhone}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {selectedJob.customerEmail}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Scheduled:</strong> {new Date(selectedJob.scheduledDate).toLocaleDateString()} at {selectedJob.scheduledTime}
                </Typography>
              </Grid>
              {selectedJob.driverNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Driver Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedJob.driverNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => openEditDialog(selectedJob)} variant="contained">
              Edit Job
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default JobAssignment; 