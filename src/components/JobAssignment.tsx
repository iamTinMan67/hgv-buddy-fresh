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
  Alert,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  Edit,
  Assignment,
  Home,
  Person,
  Route,
  Map,
  Timeline,
  CheckCircle,
  Pending,
  PlayArrow,
  Stop,
  Warning,
  Info,
  Help,
  Straighten,
  Scale,
  Height,
  LocalShipping,
  ViewInAr,
  Calculate,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobAssignment as JobAssignmentType,
  addJob,
  updateJob,
  deleteJob,
  assignJobToDriver,
  JobStatus,
  JobPriority,
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
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobAssignmentType | null>(null);

  const [newJob, setNewJob] = useState<Partial<JobAssignmentType>>({
    jobNumber: '',
    title: '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    priority: 'medium',
    status: 'pending',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 120,
    pickupLocation: {
      address: '',
      city: '',
      postcode: '',
      coordinates: { lat: 0, lng: 0 },
    },
    deliveryLocation: {
      address: '',
      city: '',
      postcode: '',
      coordinates: { lat: 0, lng: 0 },
    },
    useDifferentDeliveryAddress: false,
    deliveryAddress: '',
    cargoType: '',
    cargoWeight: 0,
    specialRequirements: '',
    notes: '',
    createdBy: user?.id || '',
    authorizedBy: user?.id || '',
    loadDimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      volume: 0,
      isOversized: false,
      isProtruding: false,
      isBalanced: false,
      isFragile: false,
      plotAllocation: '',
      loadNotes: '',
    },
  });

  // Filter jobs based on user role
  const filteredJobs = user?.role === 'driver'
    ? jobs.filter(job => job.assignedDriver === user.id)
    : jobs;

  const calculateVolume = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1000000; // Convert to cubic meters
  };

  const handleAddJob = () => {
    if (!newJob.title || !newJob.customerName) return;

    const volume = calculateVolume(
      newJob.loadDimensions?.length || 0,
      newJob.loadDimensions?.width || 0,
      newJob.loadDimensions?.height || 0
    );

    const job: JobAssignmentType = {
      id: Date.now().toString(),
      ...newJob,
      loadDimensions: {
        ...newJob.loadDimensions!,
        volume,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as JobAssignmentType;

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
      status: 'pending',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      estimatedDuration: 120,
      pickupLocation: {
        address: '',
        city: '',
        postcode: '',
        coordinates: { lat: 0, lng: 0 },
      },
      deliveryLocation: {
        address: '',
        city: '',
        postcode: '',
        coordinates: { lat: 0, lng: 0 },
      },
      useDifferentDeliveryAddress: false,
      deliveryAddress: '',
      cargoType: '',
      cargoWeight: 0,
      specialRequirements: '',
      notes: '',
      createdBy: user?.id || '',
      authorizedBy: user?.id || '',
      loadDimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        volume: 0,
        isOversized: false,
        isProtruding: false,
        isBalanced: false,
        isFragile: false,
        plotAllocation: '',
        loadNotes: '',
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const openViewDialog = (job: JobAssignmentType) => {
    setSelectedJob(job);
    setShowViewDialog(true);
  };

  // Calculate statistics
  const totalJobs = filteredJobs.length;
  const pendingJobs = filteredJobs.filter(job => job.status === 'pending').length;
  const inProgressJobs = filteredJobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = filteredJobs.filter(job => job.status === 'completed').length;
  const totalVolume = filteredJobs.reduce((sum, job) => sum + (job.loadDimensions?.volume || 0), 0);
  const totalWeight = filteredJobs.reduce((sum, job) => sum + (job.loadDimensions?.weight || 0), 0);

  // Field hints and checklists
  const fieldHints = {
    length: {
      title: "Load Length Checklist",
      items: [
        "Is the load longer than standard trailer length?",
        "Does it require special permits for oversized transport?",
        "Will it fit within standard loading bays?",
        "Are there any protruding elements?",
        "Does it require escort vehicles?"
      ]
    },
    width: {
      title: "Load Width Checklist", 
      items: [
        "Is the load wider than standard trailer width?",
        "Does it exceed lane width restrictions?",
        "Are there any side protrusions?",
        "Will it fit through standard gates/doors?",
        "Does it require wide load signage?"
      ]
    },
    height: {
      title: "Load Height Checklist",
      items: [
        "Is the load taller than standard trailer height?",
        "Does it exceed bridge/tunnel clearances?",
        "Are there any top protrusions?",
        "Will it fit under overhead obstacles?",
        "Does it require height warning systems?"
      ]
    },
    weight: {
      title: "Load Weight Checklist",
      items: [
        "Is the load heavier than vehicle capacity?",
        "Does it require special weight permits?",
        "Is the weight evenly distributed?",
        "Does it affect vehicle stability?",
        "Are special handling procedures needed?"
      ]
    },
    volume: {
      title: "Load Volume Checklist",
      items: [
        "Does the volume exceed trailer capacity?",
        "Is there sufficient space for other loads?",
        "Are there any air gaps or voids?",
        "Can the load be stacked efficiently?",
        "Does it require special loading equipment?"
      ]
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Job Assignment
        </Typography>
        <Box>
          {(user?.role === 'admin' || user?.role === 'owner') ? (
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setShowAddDialog(true)}
              sx={{ mr: 2 }}
            >
              Add New Job
            </Button>
          ) : user?.role === 'driver' ? (
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                alert('Please call the Office');
              }}
              sx={{ mr: 2 }}
            >
              Add New Job
            </Button>
          ) : null}
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
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
              <Typography variant="h4" color="warning.main">
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
              <Typography variant="h4" color="info.main">
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
              <Typography variant="h4" color="secondary.main">
                {Math.round(totalVolume)}m³
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Volume
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {Math.round(totalWeight / 1000)}t
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Weight
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
              color: '#FFD700',
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="All Jobs" />
          <Tab label="Pending Jobs" />
        </Tabs>
      </Box>

      {/* All Jobs Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Volume</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {job.jobNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.customerName}
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
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.loadDimensions?.length}×{job.loadDimensions?.width}×{job.loadDimensions?.height}cm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.loadDimensions?.volume?.toFixed(2)}m³
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.loadDimensions?.weight}kg
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
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <>
                        <Tooltip title="Edit Job">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Job">
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

      {/* Pending Jobs Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Volume</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.filter(job => job.status === 'pending').map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {job.jobNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.customerName}
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
                    <Typography variant="body2">
                      {job.loadDimensions?.length}×{job.loadDimensions?.width}×{job.loadDimensions?.height}cm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.loadDimensions?.volume?.toFixed(2)}m³
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.loadDimensions?.weight}kg
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
                    {(user?.role === 'admin' || user?.role === 'owner') ? (
                      <Tooltip title="Assign Job">
                        <IconButton size="small" color="primary">
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Contact Office">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => alert('Contact Office')}
                        >
                          <Warning />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Add Job Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Job Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Number"
                value={newJob.jobNumber}
                onChange={(e) => setNewJob({ ...newJob, jobNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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

            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Customer Information
              </Typography>
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
                value={newJob.customerEmail}
                onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
              />
            </Grid>

            {/* Load Dimensions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Load Dimensions
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {fieldHints.length.title}
                    </Typography>
                    <List dense>
                      {fieldHints.length.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Typography variant="caption">•</Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="caption">{item}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                }
                arrow
                placement="top"
              >
                <TextField
                  fullWidth
                  label="Length (cm)"
                  type="number"
                  value={newJob.loadDimensions?.length || ''}
                  onChange={(e) => {
                    const length = Number(e.target.value);
                    const volume = calculateVolume(
                      length,
                      newJob.loadDimensions?.width || 0,
                      newJob.loadDimensions?.height || 0
                    );
                    setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        length,
                        volume,
                      }
                    });
                  }}
                  InputProps={{
                    startAdornment: <Straighten sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {fieldHints.width.title}
                    </Typography>
                    <List dense>
                      {fieldHints.width.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Typography variant="caption">•</Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="caption">{item}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                }
                arrow
                placement="top"
              >
                <TextField
                  fullWidth
                  label="Width (cm)"
                  type="number"
                  value={newJob.loadDimensions?.width || ''}
                  onChange={(e) => {
                    const width = Number(e.target.value);
                    const volume = calculateVolume(
                      newJob.loadDimensions?.length || 0,
                      width,
                      newJob.loadDimensions?.height || 0
                    );
                    setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        width,
                        volume,
                      }
                    });
                  }}
                  InputProps={{
                    startAdornment: <Width sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {fieldHints.height.title}
                    </Typography>
                    <List dense>
                      {fieldHints.height.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Typography variant="caption">•</Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="caption">{item}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                }
                arrow
                placement="top"
              >
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={newJob.loadDimensions?.height || ''}
                  onChange={(e) => {
                    const height = Number(e.target.value);
                    const volume = calculateVolume(
                      newJob.loadDimensions?.length || 0,
                      newJob.loadDimensions?.width || 0,
                      height
                    );
                    setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        height,
                        volume,
                      }
                    });
                  }}
                  InputProps={{
                    startAdornment: <Height sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {fieldHints.weight.title}
                    </Typography>
                    <List dense>
                      {fieldHints.weight.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Typography variant="caption">•</Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="caption">{item}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                }
                arrow
                placement="top"
              >
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={newJob.loadDimensions?.weight || ''}
                  onChange={(e) => setNewJob({
                    ...newJob,
                    loadDimensions: {
                      ...newJob.loadDimensions!,
                      weight: Number(e.target.value),
                    }
                  })}
                  InputProps={{
                    startAdornment: <Scale sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Tooltip>
            </Grid>

            {/* Calculated Volume */}
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Calculated Volume:</strong> {newJob.loadDimensions?.volume?.toFixed(2) || '0.00'} m³
                </Typography>
              </Alert>
            </Grid>

            {/* Load Characteristics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Load Characteristics
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newJob.loadDimensions?.isOversized || false}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        isOversized: e.target.checked,
                      }
                    })}
                  />
                }
                label="Oversized"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newJob.loadDimensions?.isProtruding || false}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        isProtruding: e.target.checked,
                      }
                    })}
                  />
                }
                label="Protruding"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newJob.loadDimensions?.isBalanced || false}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        isBalanced: e.target.checked,
                      }
                    })}
                  />
                }
                label="Balanced"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newJob.loadDimensions?.isFragile || false}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      loadDimensions: {
                        ...newJob.loadDimensions!,
                        isFragile: e.target.checked,
                      }
                    })}
                  />
                }
                label="Fragile"
              />
            </Grid>

            {/* Load Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load Notes"
                multiline
                rows={3}
                placeholder="Special handling instructions, loading requirements, etc."
                value={newJob.loadDimensions?.loadNotes || ''}
                onChange={(e) => setNewJob({
                  ...newJob,
                  loadDimensions: {
                    ...newJob.loadDimensions!,
                    loadNotes: e.target.value,
                  }
                })}
              />
            </Grid>

            {/* Other Job Details */}
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
                </Select>
              </FormControl>
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
                  <strong>Customer:</strong> {selectedJob.customerName}
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
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    label={selectedJob.status.replace('_', ' ')}
                    color={getStatusColor(selectedJob.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Load Dimensions
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Dimensions:</strong> {selectedJob.loadDimensions?.length}×{selectedJob.loadDimensions?.width}×{selectedJob.loadDimensions?.height}cm
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Volume:</strong> {selectedJob.loadDimensions?.volume?.toFixed(2)} m³
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Weight:</strong> {selectedJob.loadDimensions?.weight} kg
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedJob.loadDimensions?.isOversized && (
                    <Chip label="Oversized" color="warning" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedJob.loadDimensions?.isProtruding && (
                    <Chip label="Protruding" color="error" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedJob.loadDimensions?.isBalanced && (
                    <Chip label="Balanced" color="success" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedJob.loadDimensions?.isFragile && (
                    <Chip label="Fragile" color="info" size="small" sx={{ mr: 1 }} />
                  )}
                </Box>
              </Grid>
              {selectedJob.loadDimensions?.loadNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Load Notes
                  </Typography>
                  <Alert severity="info">
                    <Typography variant="body2">
                      {selectedJob.loadDimensions.loadNotes}
                    </Typography>
                  </Alert>
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
                Edit Job
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default JobAssignment; 