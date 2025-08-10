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
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ExpandMore,
  Straighten,
  Scale,
  ViewInAr,
  Calculate,
  Storage,
  LocalShipping,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  RoutePlan,
  JobAssignment as JobAssignmentType,
  JobStatus,
} from '../store/slices/jobSlice';

interface TrailerPlannerProps {
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CargoItem {
  id: string;
  jobId: string;
  jobTitle: string;
  customerName: string;
  description: string;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
  volume: number; // cubic meters
  priority: 'high' | 'medium' | 'low';
  fragility: 'fragile' | 'standard' | 'heavy';
  position?: {
    x: number;
    y: number;
    z: number;
  };
  plotId?: string;
}

interface TrailerLayout {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  trailerLength: number; // cm
  trailerWidth: number; // cm
  trailerHeight: number; // cm
  maxWeight: number; // kg
  maxVolume: number; // cubic meters
  cargoItems: CargoItem[];
  totalWeight: number;
  totalVolume: number;
  utilizationPercentage: number;
  createdAt: string;
  updatedAt: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trailer-tabpanel-${index}`}
      aria-labelledby={`trailer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TrailerPlanner: React.FC<TrailerPlannerProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { routePlans, jobs } = useSelector((state: RootState) => state.job);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [showCargoDialog, setShowCargoDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedLayout, setSelectedLayout] = useState<TrailerLayout | null>(null);

  // Mock trailer layouts data
  const [trailerLayouts, setTrailerLayouts] = useState<TrailerLayout[]>([
    {
      id: '1',
      vehicleId: '1',
      vehicleRegistration: 'AB12 CDE',
      trailerLength: 1350, // 13.5m
      trailerWidth: 255, // 2.55m
      trailerHeight: 270, // 2.7m
      maxWeight: 26000, // 26 tons
      maxVolume: 92.5, // cubic meters
      cargoItems: [],
      totalWeight: 0,
      totalVolume: 0,
      utilizationPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      vehicleId: '2',
      vehicleRegistration: 'EF34 FGH',
      trailerLength: 1600, // 16m
      trailerWidth: 255, // 2.55m
      trailerHeight: 270, // 2.7m
      maxWeight: 44000, // 44 tons
      maxVolume: 109.4, // cubic meters
      cargoItems: [],
      totalWeight: 0,
      totalVolume: 0,
      utilizationPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [newCargoItem, setNewCargoItem] = useState<Partial<CargoItem>>({
    jobId: '',
    description: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    priority: 'medium',
    fragility: 'standard',
  });

  // Filter layouts based on user role
  const filteredLayouts = user?.role === 'driver'
    ? trailerLayouts.filter(layout => {
        const vehicle = vehicles.find(v => v.id === layout.vehicleId);
        return vehicle?.currentDriver === user.id;
      })
    : trailerLayouts;

  const calculateVolume = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1000000; // Convert to cubic meters
  };

  const calculateCubage = (cargoItems: CargoItem[]): { totalWeight: number; totalVolume: number; utilizationPercentage: number } => {
    const totalWeight = cargoItems.reduce((sum, item) => sum + item.weight, 0);
    const totalVolume = cargoItems.reduce((sum, item) => sum + item.volume, 0);
    const layout = trailerLayouts.find(l => l.cargoItems === cargoItems);
    const utilizationPercentage = layout ? (totalVolume / layout.maxVolume) * 100 : 0;
    
    return { totalWeight, totalVolume, utilizationPercentage };
  };

  const generatePlotPosition = (cargoItem: CargoItem, layout: TrailerLayout): { x: number; y: number; z: number } => {
    // Simple positioning algorithm - in a real system this would be more sophisticated
    const existingItems = layout.cargoItems.filter(item => item.position);
    const x = existingItems.length * (cargoItem.length + 10); // 10cm gap
    const y = 0; // Center of trailer width
    const z = 0; // Bottom of trailer
    
    return { x, y, z };
  };

  const handleAddCargoItem = () => {
    if (!selectedLayout || !newCargoItem.jobId || !newCargoItem.description) return;

    const job = jobs.find(j => j.id === newCargoItem.jobId);
    if (!job) return;

    const volume = calculateVolume(
      newCargoItem.length || 0,
      newCargoItem.width || 0,
      newCargoItem.height || 0
    );

    const cargoItem: CargoItem = {
      id: Date.now().toString(),
      jobId: newCargoItem.jobId,
      jobTitle: job.title,
      customerName: job.customerName,
      description: newCargoItem.description || '',
      length: newCargoItem.length || 0,
      width: newCargoItem.width || 0,
      height: newCargoItem.height || 0,
      weight: newCargoItem.weight || 0,
      volume,
      priority: newCargoItem.priority || 'medium',
      fragility: newCargoItem.fragility || 'standard',
    };

    const position = generatePlotPosition(cargoItem, selectedLayout);
    cargoItem.position = position;
    cargoItem.plotId = `PLOT-${cargoItem.id}`;

    const updatedLayout = {
      ...selectedLayout,
      cargoItems: [...selectedLayout.cargoItems, cargoItem],
    };

    const { totalWeight, totalVolume, utilizationPercentage } = calculateCubage(updatedLayout.cargoItems);
    updatedLayout.totalWeight = totalWeight;
    updatedLayout.totalVolume = totalVolume;
    updatedLayout.utilizationPercentage = utilizationPercentage;

    setTrailerLayouts(prev => 
      prev.map(layout => 
        layout.id === selectedLayout.id ? updatedLayout : layout
      )
    );

    setShowCargoDialog(false);
    setNewCargoItem({
      jobId: '',
      description: '',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      priority: 'medium',
      fragility: 'standard',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getFragilityColor = (fragility: string) => {
    switch (fragility) {
      case 'fragile': return 'error';
      case 'heavy': return 'warning';
      case 'standard': return 'success';
      default: return 'default';
    }
  };

  // Calculate overall statistics
  const totalLayouts = filteredLayouts.length;
  const totalCargoItems = filteredLayouts.reduce((sum, layout) => sum + layout.cargoItems.length, 0);
  const averageUtilization = filteredLayouts.length > 0 
    ? filteredLayouts.reduce((sum, layout) => sum + layout.utilizationPercentage, 0) / filteredLayouts.length
    : 0;

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trailer Planner
        </Typography>
        <Box>
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      {/* Trailer Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalLayouts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Layouts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {totalCargoItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cargo Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {Math.round(averageUtilization)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {filteredLayouts.reduce((sum, layout) => sum + layout.totalWeight, 0) / 1000}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Weight (tons)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {Math.round(filteredLayouts.reduce((sum, layout) => sum + layout.totalVolume, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Volume (m³)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
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
          <Tab label="Trailer Layouts" />
          <Tab label="Cubage Calculator" />
          <Tab label="Loading Optimization" />
        </Tabs>
      </Box>

      {/* Trailer Layouts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredLayouts.map((layout) => (
            <Grid item xs={12} md={6} lg={4} key={layout.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {layout.vehicleRegistration}
                    </Typography>
                    <Chip
                      label={`${Math.round(layout.utilizationPercentage)}% Utilized`}
                      color={layout.utilizationPercentage > 90 ? 'error' : layout.utilizationPercentage > 70 ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Dimensions
                      </Typography>
                      <Typography variant="body2">
                        {layout.trailerLength / 100}m × {layout.trailerWidth / 100}m × {layout.trailerHeight / 100}m
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Max Capacity
                      </Typography>
                      <Typography variant="body2">
                        {layout.maxWeight / 1000}t / {layout.maxVolume}m³
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Weight
                      </Typography>
                      <Typography variant="body2">
                        {layout.totalWeight / 1000}t
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Volume
                      </Typography>
                      <Typography variant="body2">
                        {Math.round(layout.totalVolume)}m³
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Utilization
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={layout.utilizationPercentage}
                      color={layout.utilizationPercentage > 90 ? 'error' : layout.utilizationPercentage > 70 ? 'warning' : 'success'}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ViewInAr />}
                      onClick={() => {
                        setSelectedLayout(layout);
                        setShowLayoutDialog(true);
                      }}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      View Layout
                    </Button>
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setSelectedLayout(layout);
                          setShowCargoDialog(true);
                        }}
                        fullWidth
                      >
                        Add Cargo Item
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Cubage Calculator Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cubage Calculator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Calculate volume and weight requirements for cargo items
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Length (cm)"
                      type="number"
                      value={newCargoItem.length || ''}
                      onChange={(e) => setNewCargoItem({ ...newCargoItem, length: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Width (cm)"
                      type="number"
                      value={newCargoItem.width || ''}
                      onChange={(e) => setNewCargoItem({ ...newCargoItem, width: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Height (cm)"
                      type="number"
                      value={newCargoItem.height || ''}
                      onChange={(e) => setNewCargoItem({ ...newCargoItem, height: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      type="number"
                      value={newCargoItem.weight || ''}
                      onChange={(e) => setNewCargoItem({ ...newCargoItem, weight: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={newCargoItem.priority || 'medium'}
                        onChange={(e) => setNewCargoItem({ ...newCargoItem, priority: e.target.value as any })}
                        label="Priority"
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Calculated Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Volume
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {calculateVolume(
                          newCargoItem.length || 0,
                          newCargoItem.width || 0,
                          newCargoItem.height || 0
                        ).toFixed(2)} m³
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Weight
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {(newCargoItem.weight || 0) / 1000} tons
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Loading Guidelines
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Scale />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Weight Distribution"
                      secondary="Heavy items at the bottom, lighter items on top"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Volume Optimization"
                      secondary="Maximize space utilization while maintaining stability"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Fragile Items"
                      secondary="Place fragile items in protected areas with proper padding"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Calculate />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Center of Gravity"
                      secondary="Maintain balanced center of gravity for safe transport"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Loading Optimization Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Loading Optimization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  AI-powered loading optimization for maximum efficiency and safety
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      startIcon={<Calculate />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Optimize Current Layout
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ViewInAr />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      iew 3D Layout
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Map />}
                      fullWidth
                    >
                      Generate Loading Plan
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      Optimization Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Space Utilization
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          87%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Weight Distribution
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          92%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Stability Score
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          95%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Loading Time
                        </Typography>
                        <Typography variant="h4" color="primary">
                          45 min
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Layout View Dialog */}
      <Dialog open={showLayoutDialog} onClose={() => setShowLayoutDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Trailer Layout: {selectedLayout?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          {selectedLayout && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 400, position: 'relative', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" gutterBottom>
                    Trailer Layout Visualization
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 300, 
                    border: '2px solid #333',
                    position: 'relative',
                    bgcolor: '#e0e0e0'
                  }}>
                    {selectedLayout.cargoItems.map((item, index) => (
                      <Box
                        key={item.id}
                        sx={{
                          position: 'absolute',
                          left: `${(item.position?.x || 0) / selectedLayout.trailerLength * 100}%`,
                          bottom: '0',
                          width: `${item.length / selectedLayout.trailerLength * 100}%`,
                          height: `${item.height / selectedLayout.trailerHeight * 100}%`,
                          bgcolor: item.priority === 'high' ? '#ff6b6b' : 
                                  item.priority === 'medium' ? '#ffd93d' : '#6bcf7f',
                          border: '1px solid #333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          }
                        }}
                        title={`${item.jobTitle} - ${item.description}`}
                      >
                        {item.plotId}
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Trailer: {selectedLayout.trailerLength / 100}m × {selectedLayout.trailerWidth / 100}m × {selectedLayout.trailerHeight / 100}m
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Cargo Items
                </Typography>
                <List dense>
                  {selectedLayout.cargoItems.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemIcon>
                        <Chip
                          label={item.plotId}
                          size="small"
                          color={getPriorityColor(item.priority) as any}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.jobTitle}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {item.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.length}×{item.width}×{item.height}cm | {item.weight}kg | {item.volume.toFixed(2)}m³
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                

              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLayoutDialog(false)}>
            Close
          </Button>
          <Button variant="contained">
            Export Layout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Cargo Item Dialog */}
      <Dialog open={showCargoDialog} onClose={() => setShowCargoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Cargo Item to {selectedLayout?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Cubage Calculation:</strong> Enter cargo dimensions and weight to calculate volume and optimal positioning.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Job</InputLabel>
                <Select
                  value={newCargoItem.jobId}
                  onChange={(e) => setNewCargoItem({ ...newCargoItem, jobId: e.target.value })}
                  label="Select Job"
                >
                  {jobs.filter(job => job.status === 'pending' || job.status === 'assigned').map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title} - {job.customerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo Description"
                value={newCargoItem.description}
                onChange={(e) => setNewCargoItem({ ...newCargoItem, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Length (cm)"
                type="number"
                value={newCargoItem.length || ''}
                onChange={(e) => setNewCargoItem({ ...newCargoItem, length: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Width (cm)"
                type="number"
                value={newCargoItem.width || ''}
                onChange={(e) => setNewCargoItem({ ...newCargoItem, width: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={newCargoItem.height || ''}
                onChange={(e) => setNewCargoItem({ ...newCargoItem, height: Number(e.target.value) })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={newCargoItem.weight || ''}
                onChange={(e) => setNewCargoItem({ ...newCargoItem, weight: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newCargoItem.priority || 'medium'}
                  onChange={(e) => setNewCargoItem({ ...newCargoItem, priority: e.target.value as any })}
                  label="Priority"
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Fragility</InputLabel>
                <Select
                  value={newCargoItem.fragility || 'standard'}
                  onChange={(e) => setNewCargoItem({ ...newCargoItem, fragility: e.target.value as any })}
                  label="Fragility"
                >
                  <MenuItem value="fragile">Fragile</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="heavy">Heavy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {newCargoItem.length && newCargoItem.width && newCargoItem.height && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Calculated Volume:</strong> {calculateVolume(
                      newCargoItem.length,
                      newCargoItem.width,
                      newCargoItem.height
                    ).toFixed(2)} m³
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCargoDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCargoItem} variant="contained">
            Add Cargo Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrailerPlanner;
