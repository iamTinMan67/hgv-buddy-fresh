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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Badge,
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
  ErrorOutline,
  ExpandMore,
  ExpandLess,
  Save,
  Cancel,
  Refresh,
  Download,
  Print,
  Share,
  Book,
  Receipt,
  AttachFile,
  Description,
  LocationOn,
  Phone,
  Email,
  Schedule,
  AccessTime,
  DirectionsCar,
  Inventory,
  Category,
  Notes,
  PriorityHigh,
  LowPriority,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobAssignment as JobAssignmentType,
  addJob,
  updateJob,
  deleteJob,
  assignJobToDriver,
  updateJobStatus,
  JobStatus,
  JobPriority,
} from '../store/slices/jobSlice';
import InteractiveStatusChip, { StatusOption } from './InteractiveStatusChip';
import TrailerPlan from './TrailerPlotter';

// Enhanced interfaces for comprehensive consignment management
interface ConsignmentItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
    weight: number; // kg
    volume: number; // m³ (calculated)
  };
  specialRequirements: {
    isOversized: boolean;
    isProtruding: boolean;
    isBalanced: boolean;
    isFragile: boolean;
    isTemperatureControlled: boolean;
    isHazardous: boolean;
  };
  handlingNotes: string;
  allocatedSpace?: {
    trailerPosition: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface EnhancedJobAssignment extends Omit<JobAssignmentType, 'loadDimensions'> {
  consignmentItems: ConsignmentItem[];
  totalVolume: number;
  totalWeight: number;
  spaceRequirements: {
    totalLength: number;
    totalWidth: number;
    totalHeight: number;
    requiresOversizedVehicle: boolean;
    requiresSpecialEquipment: boolean;
  };
  deliverySchedule: {
    pickupDate: string;
    pickupTime: string;
    deliveryDate: string;
    deliveryTime: string;
    estimatedDuration: number; // minutes
    bufferTime: number; // minutes
  };
  routeConstraints: {
    maxHeight: number;
    maxWidth: number;
    restrictedRoutes: string[];
    requiredPermits: string[];
  };
  costBreakdown: {
    transportCost: number;
    handlingCost: number;
    specialRequirementsCost: number;
    totalCost: number;
  };
}

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
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<EnhancedJobAssignment | null>(null);
  const [showTrailerPlotter, setShowTrailerPlotter] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Enhanced new job state
  const [newJob, setNewJob] = useState<Partial<EnhancedJobAssignment>>({
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
      id: '',
      name: '',
      address: '',
      postcode: '',
    },
    deliveryLocation: {
      id: '',
      name: '',
      address: '',
      postcode: '',
    },
    useDifferentDeliveryAddress: false,
    deliveryAddress: '',
    cargoType: '',
    cargoWeight: 0,
    specialRequirements: '',
    notes: '',
    driverNotes: '',
    managementNotes: '',
    createdBy: user?.id || '',
    authorizedBy: '',
    consignmentItems: [],
    totalVolume: 0,
    totalWeight: 0,
    spaceRequirements: {
      totalLength: 0,
      totalWidth: 0,
      totalHeight: 0,
      requiresOversizedVehicle: false,
      requiresSpecialEquipment: false,
    },
    deliverySchedule: {
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '09:00',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: '17:00',
      estimatedDuration: 120,
      bufferTime: 30,
    },
    routeConstraints: {
      maxHeight: 4.2, // meters
      maxWidth: 2.55, // meters
      restrictedRoutes: [],
      requiredPermits: [],
    },
    costBreakdown: {
      transportCost: 0,
      handlingCost: 0,
      specialRequirementsCost: 0,
      totalCost: 0,
    },
  });

  // Consignment item state
  const [newConsignmentItem, setNewConsignmentItem] = useState<Partial<ConsignmentItem>>({
    description: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      volume: 0,
    },
    specialRequirements: {
      isOversized: false,
      isProtruding: false,
      isBalanced: true,
      isFragile: false,
      isTemperatureControlled: false,
      isHazardous: false,
    },
    handlingNotes: '',
  });

  const calculateVolume = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1000000; // Convert cm³ to m³
  };

  const calculateTotalVolume = (items: ConsignmentItem[]): number => {
    return items.reduce((total, item) => total + (item.dimensions.volume * item.quantity), 0);
  };

  const calculateTotalWeight = (items: ConsignmentItem[]): number => {
    return items.reduce((total, item) => total + (item.dimensions.weight * item.quantity), 0);
  };

  const updateSpaceRequirements = (items: ConsignmentItem[]) => {
    const totalVolume = calculateTotalVolume(items);
    const totalWeight = calculateTotalWeight(items);
    
    // Calculate space requirements based on items
    const maxLength = Math.max(...items.map(item => item.dimensions.length), 0);
    const maxWidth = Math.max(...items.map(item => item.dimensions.width), 0);
    const maxHeight = Math.max(...items.map(item => item.dimensions.height), 0);
    
    const requiresOversizedVehicle = maxLength > 600 || maxWidth > 250 || maxHeight > 250;
    const requiresSpecialEquipment = items.some(item => 
      item.specialRequirements.isFragile || 
      item.specialRequirements.isTemperatureControlled ||
      item.specialRequirements.isHazardous
    );

    setNewJob(prev => ({
      ...prev,
      totalVolume,
      totalWeight,
      spaceRequirements: {
        totalLength: maxLength,
        totalWidth: maxWidth,
        totalHeight: maxHeight,
        requiresOversizedVehicle,
        requiresSpecialEquipment,
      },
    }));
  };

  const handleAddConsignmentItem = () => {
    if (!newConsignmentItem.description || !newConsignmentItem.category) return;

    const volume = calculateVolume(
      newConsignmentItem.dimensions?.length || 0,
      newConsignmentItem.dimensions?.width || 0,
      newConsignmentItem.dimensions?.height || 0
    );

    const item: ConsignmentItem = {
      id: `item-${Date.now()}`,
      description: newConsignmentItem.description || '',
      category: newConsignmentItem.category || '',
      quantity: newConsignmentItem.quantity || 1,
      unit: newConsignmentItem.unit || 'pieces',
      dimensions: {
        length: newConsignmentItem.dimensions?.length || 0,
        width: newConsignmentItem.dimensions?.width || 0,
        height: newConsignmentItem.dimensions?.height || 0,
        weight: newConsignmentItem.dimensions?.weight || 0,
        volume,
      },
      specialRequirements: {
        isOversized: newConsignmentItem.specialRequirements?.isOversized || false,
        isProtruding: newConsignmentItem.specialRequirements?.isProtruding || false,
        isBalanced: newConsignmentItem.specialRequirements?.isBalanced || true,
        isFragile: newConsignmentItem.specialRequirements?.isFragile || false,
        isTemperatureControlled: newConsignmentItem.specialRequirements?.isTemperatureControlled || false,
        isHazardous: newConsignmentItem.specialRequirements?.isHazardous || false,
      },
      handlingNotes: newConsignmentItem.handlingNotes || '',
    };

    const updatedItems = [...(newJob.consignmentItems || []), item];
    setNewJob(prev => ({ ...prev, consignmentItems: updatedItems }));
    updateSpaceRequirements(updatedItems);

    // Reset form
    setNewConsignmentItem({
      description: '',
      category: '',
      quantity: 1,
      unit: 'pieces',
      dimensions: { length: 0, width: 0, height: 0, weight: 0, volume: 0 },
      specialRequirements: {
        isOversized: false,
        isProtruding: false,
        isBalanced: true,
        isFragile: false,
        isTemperatureControlled: false,
        isHazardous: false,
      },
      handlingNotes: '',
    });
  };

  const handleRemoveConsignmentItem = (itemId: string) => {
    const updatedItems = (newJob.consignmentItems || []).filter(item => item.id !== itemId);
    setNewJob(prev => ({ ...prev, consignmentItems: updatedItems }));
    updateSpaceRequirements(updatedItems);
  };

  const handleAddJob = () => {
    if (!newJob.jobNumber || !newJob.title || !newJob.customerName) return;

    const job: EnhancedJobAssignment = {
      id: `job-${Date.now()}`,
      jobNumber: newJob.jobNumber || '',
      title: newJob.title || '',
      description: newJob.description || '',
      customerName: newJob.customerName || '',
      customerPhone: newJob.customerPhone || '',
      customerEmail: newJob.customerEmail || '',
      priority: newJob.priority || 'medium',
      status: newJob.status || 'pending',
      scheduledDate: newJob.scheduledDate || '',
      scheduledTime: newJob.scheduledTime || '',
      estimatedDuration: newJob.estimatedDuration || 120,
      pickupLocation: newJob.pickupLocation || { id: '', name: '', address: '', postcode: '' },
      deliveryLocation: newJob.deliveryLocation || { id: '', name: '', address: '', postcode: '' },
      useDifferentDeliveryAddress: newJob.useDifferentDeliveryAddress || false,
      deliveryAddress: newJob.deliveryAddress || '',
      cargoType: newJob.cargoType || '',
      cargoWeight: newJob.cargoWeight || 0,
      specialRequirements: newJob.specialRequirements || '',
      notes: newJob.notes || '',
      driverNotes: newJob.driverNotes || '',
      managementNotes: newJob.managementNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: newJob.createdBy || '',
      authorizedBy: newJob.authorizedBy || '',
      consignmentItems: newJob.consignmentItems || [],
      totalVolume: newJob.totalVolume || 0,
      totalWeight: newJob.totalWeight || 0,
      spaceRequirements: newJob.spaceRequirements || {
        totalLength: 0,
        totalWidth: 0,
        totalHeight: 0,
        requiresOversizedVehicle: false,
        requiresSpecialEquipment: false,
      },
      deliverySchedule: newJob.deliverySchedule || {
        pickupDate: '',
        pickupTime: '',
        deliveryDate: '',
        deliveryTime: '',
        estimatedDuration: 120,
        bufferTime: 30,
      },
      routeConstraints: newJob.routeConstraints || {
        maxHeight: 4.2,
        maxWidth: 2.55,
        restrictedRoutes: [],
        requiredPermits: [],
      },
      costBreakdown: newJob.costBreakdown || {
        transportCost: 0,
        handlingCost: 0,
        specialRequirementsCost: 0,
        totalCost: 0,
      },
    };

    dispatch(addJob(job as any));
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
      pickupLocation: { id: '', name: '', address: '', postcode: '' },
      deliveryLocation: { id: '', name: '', address: '', postcode: '' },
      useDifferentDeliveryAddress: false,
      deliveryAddress: '',
      cargoType: '',
      cargoWeight: 0,
      specialRequirements: '',
      notes: '',
      driverNotes: '',
      managementNotes: '',
      createdBy: user?.id || '',
      authorizedBy: '',
      consignmentItems: [],
      totalVolume: 0,
      totalWeight: 0,
      spaceRequirements: {
        totalLength: 0,
        totalWidth: 0,
        totalHeight: 0,
        requiresOversizedVehicle: false,
        requiresSpecialEquipment: false,
      },
      deliverySchedule: {
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: '09:00',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '17:00',
        estimatedDuration: 120,
        bufferTime: 30,
      },
      routeConstraints: {
        maxHeight: 4.2,
        maxWidth: 2.55,
        restrictedRoutes: [],
        requiredPermits: [],
      },
      costBreakdown: {
        transportCost: 0,
        handlingCost: 0,
        specialRequirementsCost: 0,
        totalCost: 0,
      },
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'assigned': return <Assignment />;
      case 'in_progress': return <PlayArrow />;
      case 'attempted': return <Assignment />;
      case 'failed': return <ErrorOutline />;
      case 'refused': return <Stop />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Stop />;
      default: return <Pending />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getJobStatusOptions = (): StatusOption[] => {
    if (user?.role === 'driver') {
      return [
        { value: 'attempted', label: 'Attempted', icon: <Assignment />, color: 'warning' },
        { value: 'failed', label: 'Failed', icon: <ErrorOutline />, color: 'error' },
        { value: 'refused', label: 'Refused', icon: <Stop />, color: 'error' },
        { value: 'completed', label: 'Completed', icon: <CheckCircle />, color: 'success' },
      ];
    } else {
      return [
        { value: 'pending', label: 'Pending', icon: <Pending />, color: 'default' },
        { value: 'assigned', label: 'Assigned', icon: <Assignment />, color: 'info' },
        { value: 'in_progress', label: 'In Progress', icon: <PlayArrow />, color: 'primary' },
        { value: 'attempted', label: 'Attempted', icon: <Assignment />, color: 'warning' },
        { value: 'failed', label: 'Failed', icon: <ErrorOutline />, color: 'error' },
        { value: 'refused', label: 'Refused', icon: <Stop />, color: 'error' },
        { value: 'completed', label: 'Completed', icon: <CheckCircle />, color: 'success' },
        { value: 'cancelled', label: 'Cancelled', icon: <Stop />, color: 'error' },
      ];
    }
  };

  const openViewDialog = (job: JobAssignmentType) => {
    // Convert basic job to enhanced job with default values
    const enhancedJob: EnhancedJobAssignment = {
      ...job,
      consignmentItems: [],
      totalVolume: 0,
      totalWeight: 0,
      spaceRequirements: {
        totalLength: 0,
        totalWidth: 0,
        totalHeight: 0,
        requiresOversizedVehicle: false,
        requiresSpecialEquipment: false,
      },
      deliverySchedule: {
        pickupDate: job.scheduledDate,
        pickupTime: job.scheduledTime,
        deliveryDate: job.scheduledDate,
        deliveryTime: job.scheduledTime,
        estimatedDuration: job.estimatedDuration,
        bufferTime: 30,
      },
      routeConstraints: {
        maxHeight: 4.2,
        maxWidth: 2.55,
        restrictedRoutes: [],
        requiredPermits: [],
      },
      costBreakdown: {
        transportCost: 0,
        handlingCost: 0,
        specialRequirementsCost: 0,
        totalCost: 0,
      },
    };
    setSelectedJob(enhancedJob);
    setShowViewDialog(true);
  };

  const steps = [
    'Basic Information',
    'Customer Details',
    'Consignment Items',
    'Delivery Schedule',
    'Route & Cost Analysis',
    'Review & Submit'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
          Job Assignment Management
        </Typography>
        <Box>
          {(user?.role === 'admin' || user?.role === 'owner') && (
          <Button
            variant="contained"
              startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
            sx={{ mr: 2 }}
          >
            Add New Job
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

      {/* Trailer Plotter Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LocalShipping />}
          size="large"
          onClick={() => setShowTrailerPlotter(true)}
          sx={{ 
            px: 4, 
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out',
            }
          }}
        >
          Open Trailer Plan
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Load planning & trailer optimization with drag & drop functionality
              </Typography>
      </Box>

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
          <Tab label="All Jobs" />
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Consignment Analysis" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <JobList jobs={jobs} onView={openViewDialog} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <JobList jobs={jobs.filter(job => job.status === 'pending')} onView={openViewDialog} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <JobList jobs={jobs.filter(job => job.status === 'in_progress' || job.status === 'assigned')} onView={openViewDialog} />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <JobList jobs={jobs.filter(job => job.status === 'completed')} onView={openViewDialog} />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <ConsignmentAnalysis jobs={jobs as EnhancedJobAssignment[]} />
      </TabPanel>

      {/* Add Job Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div">
            Create New Job Assignment
                    </Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
                <StepContent>
                  {index === 0 && (
                    <BasicInformationStep 
                      newJob={newJob} 
                      setNewJob={setNewJob} 
                      onNext={handleNext}
                    />
                  )}
                  {index === 1 && (
                    <CustomerDetailsStep 
                      newJob={newJob} 
                      setNewJob={setNewJob} 
                      onNext={handleNext}
                      onBack={handleBack}
                    />
                  )}
                  {index === 2 && (
                    <ConsignmentItemsStep 
                      newJob={newJob}
                      setNewJob={setNewJob}
                      newConsignmentItem={newConsignmentItem}
                      setNewConsignmentItem={setNewConsignmentItem}
                      onAddItem={handleAddConsignmentItem}
                      onRemoveItem={handleRemoveConsignmentItem}
                      onNext={handleNext}
                      onBack={handleBack}
                    />
                  )}
                  {index === 3 && (
                    <DeliveryScheduleStep 
                      newJob={newJob}
                      setNewJob={setNewJob}
                      onNext={handleNext}
                      onBack={handleBack}
                    />
                  )}
                  {index === 4 && (
                    <RouteCostStep 
                      newJob={newJob}
                      setNewJob={setNewJob}
                      onNext={handleNext}
                      onBack={handleBack}
                    />
                  )}
                  {index === 5 && (
                    <ReviewSubmitStep 
                      newJob={newJob}
                      onBack={handleBack}
                      onSubmit={handleAddJob}
                    />
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* View Job Dialog */}
      {selectedJob && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            Job Details: {selectedJob.jobNumber}
          </DialogTitle>
          <DialogContent>
            <JobDetailsView job={selectedJob} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <Button variant="contained">Edit Job</Button>
            )}
          </DialogActions>
        </Dialog>
      )}

            {/* Trailer Plan */}
      {showTrailerPlotter && (
        <TrailerPlan
          onClose={() => setShowTrailerPlotter(false)}
          selectedJobs={jobs}
        />
      )}
    </Box>
  );
};

// Helper Components
const JobList: React.FC<{ jobs: JobAssignmentType[]; onView: (job: JobAssignmentType) => void }> = ({ jobs, onView }) => (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Volume (m³)</TableCell>
          <TableCell>Weight (kg)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
        {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.jobNumber}</TableCell>
            <TableCell>{job.title}</TableCell>
                    <TableCell>{job.customerName}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.priority}
                color={job.priority === 'urgent' ? 'error' : job.priority === 'high' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
              <InteractiveStatusChip
                status={job.status.replace('_', ' ')}
                statusIcon={getStatusIcon(job.status)}
                statusColor={getStatusColor(job.status)}
                statusOptions={getJobStatusOptions()}
                onStatusChange={(newStatus) => {
                  dispatch(updateJobStatus({
                    jobId: job.id,
                    status: newStatus as JobStatus,
                  }));
                }}
                disabled={false}
                tooltipText={user?.role === 'driver' ? 'Click to update job status' : 'Click to update status'}
              />
                    </TableCell>
            <TableCell>{(job as any).totalVolume?.toFixed(2) || '0.00'}</TableCell>
            <TableCell>{(job as any).totalWeight?.toFixed(0) || '0'}</TableCell>
                    <TableCell>
              <Tooltip title="View Details">
                <IconButton onClick={() => onView(job)}>
                  <Visibility />
                </IconButton>
              </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
);

const ConsignmentAnalysis: React.FC<{ jobs: JobAssignmentType[] }> = ({ jobs }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Volume Distribution
                      </Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min((jobs.reduce((sum, job) => sum + (job.cargoWeight || 0), 0) / 100) * 100, 100)} 
            sx={{ height: 20, borderRadius: 10 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total Weight: {jobs.reduce((sum, job) => sum + (job.cargoWeight || 0), 0).toFixed(0)} kg
                      </Typography>
        </CardContent>
      </Card>
            </Grid>
            <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weight Distribution
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min((jobs.reduce((sum, job) => sum + (job.cargoWeight || 0), 0) / 26000) * 100, 100)} 
            sx={{ height: 20, borderRadius: 10 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total Weight: {jobs.reduce((sum, job) => sum + (job.cargoWeight || 0), 0).toFixed(0)} kg
          </Typography>
        </CardContent>
      </Card>
            </Grid>
  </Grid>
);

// Step Components (simplified for brevity)
const BasicInformationStep: React.FC<any> = ({ newJob, setNewJob, onNext }) => (
  <Box>
    <Grid container spacing={2}>
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
          label="Title"
          value={newJob.title}
          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
        />
      </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
          rows={3}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              />
            </Grid>
    </Grid>
    <Button variant="contained" onClick={onNext} sx={{ mt: 2 }}>
      Next
    </Button>
  </Box>
);

const CustomerDetailsStep: React.FC<any> = ({ newJob, setNewJob, onNext, onBack }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Customer Name"
          value={newJob.customerName}
          onChange={(e) => setNewJob({ ...newJob, customerName: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Customer Phone"
          value={newJob.customerPhone}
          onChange={(e) => setNewJob({ ...newJob, customerPhone: e.target.value })}
              />
            </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
          label="Customer Email"
          value={newJob.customerEmail}
          onChange={(e) => setNewJob({ ...newJob, customerEmail: e.target.value })}
                />
              </Grid>
    </Grid>
    <Box sx={{ mt: 2 }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext} sx={{ ml: 1 }}>
        Next
      </Button>
    </Box>
  </Box>
);

const ConsignmentItemsStep: React.FC<any> = ({ 
  newJob, 
  setNewJob, 
  newConsignmentItem, 
  setNewConsignmentItem, 
  onAddItem, 
  onRemoveItem, 
  onNext, 
  onBack 
}) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Consignment Items ({newJob.consignmentItems?.length || 0})
    </Typography>
    
    {/* Add Item Form */}
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
              label="Description"
              value={newConsignmentItem.description}
              onChange={(e) => setNewConsignmentItem({ ...newConsignmentItem, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Category"
              value={newConsignmentItem.category}
              onChange={(e) => setNewConsignmentItem({ ...newConsignmentItem, category: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Length (cm)"
              type="number"
              value={newConsignmentItem.dimensions?.length || ''}
              onChange={(e) => setNewConsignmentItem({
                ...newConsignmentItem,
                dimensions: { ...newConsignmentItem.dimensions, length: parseFloat(e.target.value) || 0 }
              })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Width (cm)"
              type="number"
              value={newConsignmentItem.dimensions?.width || ''}
              onChange={(e) => setNewConsignmentItem({
                ...newConsignmentItem,
                dimensions: { ...newConsignmentItem.dimensions, width: parseFloat(e.target.value) || 0 }
              })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Height (cm)"
              type="number"
              value={newConsignmentItem.dimensions?.height || ''}
              onChange={(e) => setNewConsignmentItem({
                ...newConsignmentItem,
                dimensions: { ...newConsignmentItem.dimensions, height: parseFloat(e.target.value) || 0 }
              })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Weight (kg)"
              type="number"
              value={newConsignmentItem.dimensions?.weight || ''}
              onChange={(e) => setNewConsignmentItem({
                ...newConsignmentItem,
                dimensions: { ...newConsignmentItem.dimensions, weight: parseFloat(e.target.value) || 0 }
              })}
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={onAddItem} sx={{ mt: 2 }}>
          Add Item
        </Button>
      </CardContent>
    </Card>

    {/* Items List */}
    <List>
      {newJob.consignmentItems?.map((item: ConsignmentItem) => (
        <ListItem key={item.id}>
          <ListItemIcon>
            <Inventory />
          </ListItemIcon>
          <ListItemText
            primary={item.description}
            secondary={`${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}cm, ${item.dimensions.weight}kg, ${item.dimensions.volume.toFixed(2)}m³`}
          />
          <IconButton onClick={() => onRemoveItem(item.id)}>
            <Delete />
          </IconButton>
        </ListItem>
      ))}
    </List>

    <Box sx={{ mt: 2 }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext} sx={{ ml: 1 }}>
        Next
      </Button>
    </Box>
  </Box>
);

const DeliveryScheduleStep: React.FC<any> = ({ newJob, setNewJob, onNext, onBack }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Pickup Date"
                type="date"
          value={newJob.deliverySchedule?.pickupDate}
          onChange={(e) => setNewJob({
            ...newJob,
            deliverySchedule: { ...newJob.deliverySchedule, pickupDate: e.target.value }
          })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
          label="Pickup Time"
                type="time"
          value={newJob.deliverySchedule?.pickupTime}
          onChange={(e) => setNewJob({
            ...newJob,
            deliverySchedule: { ...newJob.deliverySchedule, pickupTime: e.target.value }
          })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
          label="Delivery Date"
          type="date"
          value={newJob.deliverySchedule?.deliveryDate}
          onChange={(e) => setNewJob({
            ...newJob,
            deliverySchedule: { ...newJob.deliverySchedule, deliveryDate: e.target.value }
          })}
          InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
          label="Delivery Time"
          type="time"
          value={newJob.deliverySchedule?.deliveryTime}
          onChange={(e) => setNewJob({
            ...newJob,
            deliverySchedule: { ...newJob.deliverySchedule, deliveryTime: e.target.value }
          })}
          InputLabelProps={{ shrink: true }}
              />
            </Grid>
    </Grid>
    <Box sx={{ mt: 2 }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext} sx={{ ml: 1 }}>
        Next
      </Button>
    </Box>
  </Box>
);

const RouteCostStep: React.FC<any> = ({ newJob, setNewJob, onNext, onBack }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
              <TextField
                fullWidth
          label="Transport Cost (£)"
          type="number"
          value={newJob.costBreakdown?.transportCost || ''}
          onChange={(e) => setNewJob({
            ...newJob,
            costBreakdown: { ...newJob.costBreakdown, transportCost: parseFloat(e.target.value) || 0 }
          })}
              />
            </Grid>
      <Grid item xs={12} md={6}>
              <TextField
                fullWidth
          label="Handling Cost (£)"
          type="number"
          value={newJob.costBreakdown?.handlingCost || ''}
          onChange={(e) => setNewJob({
            ...newJob,
            costBreakdown: { ...newJob.costBreakdown, handlingCost: parseFloat(e.target.value) || 0 }
          })}
              />
            </Grid>
          </Grid>
    <Box sx={{ mt: 2 }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext} sx={{ ml: 1 }}>
        Next
          </Button>
    </Box>
  </Box>
);

const ReviewSubmitStep: React.FC<any> = ({ newJob, onBack, onSubmit }) => (
  <Box>
                <Typography variant="h6" gutterBottom>
      Review Job Details
                </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="body2">
          <strong>Job Number:</strong> {newJob.jobNumber}
                </Typography>
        <Typography variant="body2">
          <strong>Title:</strong> {newJob.title}
                </Typography>
        <Typography variant="body2">
          <strong>Customer:</strong> {newJob.customerName}
                </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2">
          <strong>Total Volume:</strong> {newJob.totalVolume?.toFixed(2)} m³
        </Typography>
        <Typography variant="body2">
          <strong>Total Weight:</strong> {newJob.totalWeight?.toFixed(0)} kg
        </Typography>
        <Typography variant="body2">
          <strong>Items:</strong> {newJob.consignmentItems?.length || 0}
                </Typography>
              </Grid>
    </Grid>
    <Box sx={{ mt: 2 }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onSubmit} sx={{ ml: 1 }}>
        Create Job
      </Button>
    </Box>
  </Box>
);

const JobDetailsView: React.FC<{ job: EnhancedJobAssignment }> = ({ job }) => (
  <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
        Job Information
                </Typography>
                <Typography variant="body2" gutterBottom>
        <strong>Job Number:</strong> {job.jobNumber}
                </Typography>
                <Typography variant="body2" gutterBottom>
        <strong>Title:</strong> {job.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
        <strong>Customer:</strong> {job.customerName}
                </Typography>
                <Typography variant="body2" gutterBottom>
        <strong>Total Volume:</strong> {job.totalVolume?.toFixed(2)} m³
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Total Weight:</strong> {job.totalWeight?.toFixed(0)} kg
                </Typography>
              </Grid>
    <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
        Consignment Items
                  </Typography>
      <List dense>
        {job.consignmentItems?.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.description}
              secondary={`${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}cm, ${item.dimensions.weight}kg`}
            />
          </ListItem>
        ))}
      </List>
                </Grid>
            </Grid>
);

export default JobAssignment; 