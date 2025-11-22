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
  Edit,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  RoutePlan,
  JobAssignment as JobAssignmentType,
  JobStatus,
} from '../store/slices/jobSlice';
import { JobService } from '../services/api';
import { PlotAllocationService, PlotAllocation } from '../services/plotAllocationService';

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
  assignments?: {
    jobId: string;
    vehicleId: string;
    driverId: string;
    assignedAt: string;
  }[];
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
  const { vehicles: reduxVehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);
  const [vehicles, setVehicles] = useState(reduxVehicles);

  // Load vehicles from database on mount
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const { VehicleService } = await import('../services/api');
        const result = await VehicleService.getVehicles();
        if (result.success && result.data) {
          console.log('Loaded vehicles from database:', result.data.length);
          setVehicles(result.data);
        } else {
          console.warn('Failed to load vehicles from database, using Redux vehicles');
          setVehicles(reduxVehicles);
        }
      } catch (error) {
        console.error('Error loading vehicles from database:', error);
        setVehicles(reduxVehicles);
      }
    };
    
    loadVehicles();
  }, []);

  // Also update when Redux vehicles change (if they're loaded elsewhere)
  useEffect(() => {
    // Only update if Redux has vehicles with valid UUIDs (not demo data)
    const hasValidVehicles = reduxVehicles.some(v => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(v.id);
    });
    
    if (hasValidVehicles && vehicles.length === 0) {
      setVehicles(reduxVehicles);
    }
  }, [reduxVehicles, vehicles.length]);

  // Log vehicles for debugging
  useEffect(() => {
    console.log('TrailerPlanner - Vehicles:', vehicles.length);
    console.log('TrailerPlanner - Vehicle IDs:', vehicles.map(v => v.id));
  }, [vehicles]);

  const [tabValue, setTabValue] = useState(0);
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [showCargoDialog, setShowCargoDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedLayout, setSelectedLayout] = useState<TrailerLayout | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [drivers, setDrivers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobAssignmentType[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null); // For repositioning items within map
  const [draggingPosition, setDraggingPosition] = useState<{ x: number; y: number } | null>(null); // Mouse position during drag
  const [plotAllocations, setPlotAllocations] = useState<Record<string, PlotAllocation[]>>({}); // vehicleId -> allocations
  const [showEditTrailerDialog, setShowEditTrailerDialog] = useState(false);
  const [trailerDimensions, setTrailerDimensions] = useState<{
    length: number;
    width: number;
    height: number;
    maxWeight: number;
  } | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string>('');

  // Fetch pending jobs from database
  useEffect(() => {
    const loadPendingJobs = async () => {
      setLoadingJobs(true);
      try {
        const result = await JobService.getJobs({ status: 'pending' });
        if (result.success && result.data) {
          // Convert DB jobs to JobAssignment format (similar to DailyPlanner)
          const jobAssignments = result.data.map((dbJob: any) => {
            // Parse metadata from special_requirements
            let metadata: any = {};
            if (dbJob.special_requirements) {
              const metadataMatch = dbJob.special_requirements.match(/METADATA:(.+?)(?:\s*\||$)/);
              if (metadataMatch) {
                try {
                  metadata = JSON.parse(metadataMatch[1]);
                } catch (e) {
                  console.error('Error parsing metadata:', e);
                }
              }
            }
            
            const palletItems = metadata.pallet_items || [];
            
            return {
              id: dbJob.id,
              jobNumber: dbJob.job_number || '',
              title: dbJob.title || '',
              description: dbJob.description || '',
              customerName: metadata.clientName || dbJob.customer_name || '',
              priority: dbJob.priority || 'low',
              status: dbJob.status || 'pending',
              loadDimensions: {
                length: 0,
                width: 0,
                height: 0,
                weight: palletItems.reduce((sum: number, item: any) => sum + (item.totalWeight || 0), 0),
                volume: palletItems.reduce((sum: number, item: any) => sum + (item.totalVolume || 0), 0),
                isOversized: false,
                isProtruding: false,
                isBalanced: true,
                isFragile: false,
              },
              palletItems,
            } as JobAssignmentType;
          });
          
          // Filter out demo data with invalid UUIDs and only include jobs with pallet items
          setPendingJobs(jobAssignments.filter((job: JobAssignmentType) => {
            // Exclude demo/test data with non-UUID IDs
            if (['1', '2', '3'].includes(job.id)) {
              return false;
            }
            // Validate that job.id is a valid UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(job.id)) {
              console.warn(`Skipping job with invalid UUID: ${job.id}`);
              return false;
            }
            // Only include jobs with pallet items
            return job.palletItems && (job.palletItems as any[]).length > 0;
          }));
        }
      } catch (error) {
        console.error('Failed to load pending jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadPendingJobs();
  }, []);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('staff_members')
          .select('id, first_name, family_name, email, role')
          .eq('role', 'driver');
        if (error) {
          console.error('Failed to load drivers:', error);
          return;
        }
        const mapped = (data || []).map((d: any) => ({
          id: d.id,
          name: `${d.first_name} ${d.family_name}`.trim(),
          email: d.email
        }));
        setDrivers(mapped);
      } catch (e) {
        console.error('Failed to load drivers:', e);
      }
    };
    loadDrivers();
  }, []);

  // Initialize trailer layouts from vehicles
  const [trailerLayouts, setTrailerLayouts] = useState<TrailerLayout[]>([]);

  // Load existing plot allocations from database
  useEffect(() => {
    const loadExistingAllocations = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('trailer_plot_allocations')
          .select('*')
          .eq('status', 'allocated');
        
        if (error) {
          console.error('Failed to load allocations:', error);
          return;
        }
        
        if (data) {
          const allocationsByVehicle: Record<string, PlotAllocation[]> = {};
          
          for (const row of data) {
            if (!allocationsByVehicle[row.vehicle_id]) {
              allocationsByVehicle[row.vehicle_id] = [];
            }
            
            allocationsByVehicle[row.vehicle_id].push({
              plotId: row.plot_id,
              plotType: row.plot_type,
              position: row.plot_position,
              palletItems: row.pallet_items || [],
              totalWeight: row.total_weight,
              totalVolume: row.total_volume,
              jobId: row.job_id,
              jobTitle: '', // Could fetch from job if needed
            });
          }
          
          setPlotAllocations(allocationsByVehicle);
        }
      } catch (error) {
        console.error('Error loading allocations:', error);
      }
    };
    
    loadExistingAllocations();
  }, []);

  // Load routes and their assigned trailers
  const [routes, setRoutes] = useState<any[]>([]);
  
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Failed to load routes:', error);
          return;
        }
        
        setRoutes(data || []);
      } catch (error) {
        console.error('Failed to load routes:', error);
      }
    };
    
    loadRoutes();
  }, []);

  // Load trailer layouts from vehicles and routes
  useEffect(() => {
    console.log('Available vehicles for allocation:', vehicles);
    console.log('Vehicle types:', vehicles.map(v => ({ id: v.id, type: v.type, status: v.status, registration: v.registration })));
    console.log('Routes with trailers:', routes);
    console.log('Total vehicles:', vehicles.length);
    
    // Get trailers from routes (if vehicle has a permanent trailer assigned to a route)
    // Validate UUIDs to exclude demo/test data
    const uuidRegexForRoutes = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const routeTrailerIds = new Set<string>();
    routes.forEach((route: any) => {
      if (route.trailer_id && uuidRegexForRoutes.test(route.trailer_id)) {
        routeTrailerIds.add(route.trailer_id);
      }
      // Also check if the vehicle has a permanent trailer
      if (route.vehicle_id && uuidRegexForRoutes.test(route.vehicle_id)) {
        const vehicle = vehicles.find(v => v.id === route.vehicle_id);
        if (vehicle && (vehicle as any).permanent_trailer_id && uuidRegexForRoutes.test((vehicle as any).permanent_trailer_id)) {
          routeTrailerIds.add((vehicle as any).permanent_trailer_id);
        }
      }
    });
    
    // Filter for vehicles that can carry cargo (HGV, Articulated, trailers, trucks, Vans)
    // Also include trailers assigned to routes
    // Note: We'll allow vehicles for display, but validate UUIDs only when saving to database
    const eligibleVehicles = vehicles.filter(v => {
      // Normalize type and status for comparison (case-insensitive)
      const normalizedType = (v.type || '').toLowerCase().trim();
      const normalizedStatus = (v.status || '').toLowerCase().trim();
      
      const isEligibleType = normalizedType === 'hgv' || 
                            normalizedType === 'articulated' || 
                            normalizedType === 'trailer' || 
                            normalizedType === 'truck' || 
                            normalizedType === 'van';
      const isAvailable = normalizedStatus === 'available';
      const isRouteTrailer = routeTrailerIds.has(v.id); // Include trailers assigned to routes
      
      const passesFilter = (isEligibleType && isAvailable) || isRouteTrailer;
      
      if (!passesFilter) {
        console.log(`Vehicle filtered out: ${v.registration || v.id} - Type: "${v.type}" (normalized: "${normalizedType}"), Status: "${v.status}" (normalized: "${normalizedStatus}"), IsEligibleType: ${isEligibleType}, IsAvailable: ${isAvailable}, IsRouteTrailer: ${isRouteTrailer}`);
      }
      
      return passesFilter;
    });
    
    console.log('Vehicles before filtering:', vehicles.length);
    console.log('Vehicles by type:', vehicles.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    console.log('Vehicles by status:', vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    console.log('Eligible vehicles after filtering:', eligibleVehicles.length, 'vehicles');
    console.log('Eligible vehicles details:', eligibleVehicles.map(v => ({ id: v.id, registration: v.registration, type: v.type, status: v.status })));
    
    const layouts: TrailerLayout[] = eligibleVehicles
      .map((vehicle, index) => {
        // First, try to read cubage dimensions from vehicle notes (stored as CUBAGE_METADATA:JSON)
        let lengthCm = 0, widthCm = 0, heightCm = 0;
        if (vehicle.notes) {
          try {
            const metadataMatch = vehicle.notes.match(/CUBAGE_METADATA:(.+?)(?:\s*\||$)/);
            if (metadataMatch) {
              const metadata = JSON.parse(metadataMatch[1]);
              lengthCm = metadata.length || 0;
              widthCm = metadata.width || 0;
              heightCm = metadata.height || 0;
            }
          } catch (e) {
            console.error('Error parsing cubage metadata from vehicle notes:', e);
          }
        }
        
        // Default trailer dimensions based on type and capacity
        let defaultDimensions;
        if (lengthCm > 0 && widthCm > 0 && heightCm > 0) {
          // Use cubage dimensions from notes if available
          defaultDimensions = {
            length: lengthCm,
            width: widthCm,
            height: heightCm,
            maxWeight: vehicle.capacity ? vehicle.capacity * 1000 : 26000,
            maxVolume: (lengthCm * widthCm * heightCm) / 1000000, // cm³ to m³
          };
        } else if (vehicle.type === 'Articulated') {
          defaultDimensions = { length: 1600, width: 255, height: 270, maxWeight: 44000, maxVolume: 109.4 };
        } else if (vehicle.type === 'HGV') {
          defaultDimensions = { length: 1350, width: 255, height: 270, maxWeight: 26000, maxVolume: 92.5 };
        } else if (vehicle.type === 'Van') {
          defaultDimensions = { length: 600, width: 200, height: 200, maxWeight: 3500, maxVolume: 24 };
        } else {
          // Default for truck/trailer
          defaultDimensions = { length: 800, width: 250, height: 250, maxWeight: 7500, maxVolume: 50 };
        }
        
        // Use vehicle capacity if available (in tons, convert to kg)
        if (vehicle.capacity) {
          defaultDimensions.maxWeight = vehicle.capacity * 1000;
          // Only recalculate volume if we don't have custom cubage dimensions
          if (!(lengthCm > 0 && widthCm > 0 && heightCm > 0)) {
            // Volume = (length × width × height) / 1,000,000 (cm³ to m³)
            defaultDimensions.maxVolume = (defaultDimensions.length * defaultDimensions.width * defaultDimensions.height) / 1000000;
          }
        }
        
        const allocations = plotAllocations[vehicle.id] || [];
        const totalWeight = allocations.reduce((sum, a) => sum + a.totalWeight, 0);
        const totalVolume = allocations.reduce((sum, a) => sum + a.totalVolume, 0);
        
        return {
          id: vehicle.id,
          vehicleId: vehicle.id,
          vehicleRegistration: vehicle.registration || vehicle.name || `Vehicle ${index + 1}`,
          trailerLength: defaultDimensions.length, // cm
          trailerWidth: defaultDimensions.width,
          trailerHeight: defaultDimensions.height,
          maxWeight: defaultDimensions.maxWeight, // kg
          maxVolume: defaultDimensions.maxVolume, // m³
          cargoItems: allocations.map(alloc => ({
            id: alloc.plotId,
            jobId: alloc.jobId,
            jobTitle: alloc.jobTitle,
            customerName: '',
            description: `${alloc.palletItems.length} pallet(s)`,
            length: alloc.position.length,
            width: alloc.position.width,
            height: alloc.position.height,
            weight: alloc.totalWeight,
            volume: alloc.totalVolume,
            priority: 'medium',
            fragility: 'standard',
            position: alloc.position,
            plotId: alloc.plotId,
          })),
          totalWeight,
          totalVolume,
          utilizationPercentage: (totalVolume / defaultDimensions.maxVolume) * 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    
    setTrailerLayouts(layouts);
  }, [vehicles, plotAllocations, routes]);

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

  const handleAssign = async () => {
    if (!selectedLayout || !selectedJobId || !selectedVehicleId || !selectedDriverId) return;
    const assignedAt = new Date().toISOString();

    // Persist to DB
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('trailer_assignments')
        .insert({
          job_id: selectedJobId,
          trailer_layout_id: selectedLayout.id,
          vehicle_id: selectedVehicleId,
          driver_id: selectedDriverId,
          // assigned_by captured by audit trigger; do not include here
          assigned_at: assignedAt,
          status: 'assigned'
        });
      if (error) {
        console.error('Failed to assign trailer/job:', error);
      }
    } catch (e) {
      console.error('Error persisting assignment:', e);
    }

    // Optimistic UI update
    const updated: TrailerLayout = {
      ...selectedLayout,
      assignments: [
        ...(selectedLayout.assignments || []),
        { jobId: selectedJobId, vehicleId: selectedVehicleId, driverId: selectedDriverId, assignedAt }
      ]
    };
    setTrailerLayouts(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLayout(updated);
  };

  // Calculate overall statistics
  const totalLayouts = filteredLayouts.length;
  const totalCargoItems = filteredLayouts.reduce((sum, layout) => sum + layout.cargoItems.length, 0);
  const averageUtilization = filteredLayouts.length > 0 
    ? filteredLayouts.reduce((sum, layout) => sum + layout.utilizationPercentage, 0) / filteredLayouts.length
    : 0;

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          Trailer Planner
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
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
          <Tab label="Allocate Consignments" />
          <Tab label="Trailer Layouts" />
          <Tab label="Cubage Calculator" />
          <Tab label="Loading Optimization" />
          <Tab label="Daily Manifest Report" />
        </Tabs>
      </Box>

      {/* Allocate Consignments Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Pending Consignments List */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Consignments
                </Typography>
                {loadingJobs ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography>Loading...</Typography>
                  </Box>
                ) : pendingJobs.length === 0 ? (
                  <Alert severity="info">No pending consignments with pallet items</Alert>
                ) : (
                  <List dense>
                    {pendingJobs.map((job) => {
                      const palletItems = (job.palletItems as any[]) || [];
                      const totalWeight = palletItems.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
                      // Normalize volume - calculate from dimensions if volume seems wrong
                      const normalizedVolumes = palletItems.map(item => {
                        let vol = item.totalVolume || 0;
                        // If volume is suspiciously large (> 100 m³), recalculate from dimensions
                        if (vol > 100 && item.length && item.width && item.height) {
                          vol = (item.length * item.width * item.height) / 1000000; // cm³ to m³
                        }
                        return vol;
                      });
                      const totalVolume = normalizedVolumes.reduce((sum, vol) => sum + vol, 0);
                      
                      return (
                        <ListItem
                          key={job.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedJobId(job.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => setDraggedJobId(null)}
                          sx={{
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            cursor: 'move',
                            bgcolor: draggedJobId === job.id ? 'action.selected' : 'background.paper',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <ListItemText
                            primary={job.title}
                            secondary={
                              <>
                                <Typography variant="caption" display="block">
                                  {job.customerName}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {palletItems.length} pallet(s) • {totalWeight}kg • {totalVolume > 1000 ? (totalVolume / 1000000).toFixed(2) : totalVolume.toFixed(2)}m³
                                  {totalVolume > 1000 && (
                                    <Chip label="Volume corrected" size="small" color="warning" sx={{ ml: 1, height: 16, fontSize: '0.65rem' }} />
                                  )}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Trailer Selection and Allocation */}
          <Grid item xs={12} md={8}>
            {trailerLayouts.length === 0 ? (
              <Card>
                <CardContent>
                  <Alert severity="warning">
                    <Typography variant="body1" gutterBottom>
                      No Available Vehicles Found
                    </Typography>
                    <Typography variant="body2" component="div">
                      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                        <li>Total vehicles in fleet: {vehicles.length}</li>
                        <li>Available vehicles (exact match): {vehicles.filter(v => v.status === 'Available').length}</li>
                        <li>Available vehicles (case-insensitive): {vehicles.filter(v => (v.status || '').toLowerCase() === 'available').length}</li>
                        <li>Vehicle types: {[...new Set(vehicles.map(v => v.type))].join(', ') || 'None'}</li>
                        <li>Vehicle statuses: {[...new Set(vehicles.map(v => v.status))].join(', ') || 'None'}</li>
                        <li>Eligible types with Available status (case-insensitive): {vehicles.filter(v => {
                          const normalizedType = (v.type || '').toLowerCase().trim();
                          const normalizedStatus = (v.status || '').toLowerCase().trim();
                          const isEligibleType = normalizedType === 'hgv' || normalizedType === 'articulated' || normalizedType === 'trailer' || normalizedType === 'truck' || normalizedType === 'van';
                          return isEligibleType && normalizedStatus === 'available';
                        }).length}</li>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        Vehicle details: {vehicles.map(v => `${v.registration || v.id}: type="${v.type}", status="${v.status}"`).join(' | ')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        To allocate consignments, ensure you have vehicles with:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                        <li>Type: "HGV", "Articulated", "trailer", "truck", or "Van"</li>
                        <li>Status: "Available" (case-sensitive)</li>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2, color: 'warning.main' }}>
                        <strong>Note:</strong> If vehicles are showing in your fleet but not here, check the browser console for filtering details.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => {
                          const { VehicleService } = require('../services/api');
                          VehicleService.getVehicles().then((result: any) => {
                            alert(`Database vehicles: ${result.data?.length || 0}\nRedux vehicles: ${vehicles.length}\nEligible vehicles: ${trailerLayouts.length}`);
                          });
                        }}
                      >
                        Check Database Connection
                      </Button>
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {trailerLayouts.map((layout) => (
                <Grid item xs={12} key={layout.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {layout.vehicleRegistration}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={`${Math.round(layout.utilizationPercentage)}% Utilized`}
                            color={layout.utilizationPercentage > 90 ? 'error' : layout.utilizationPercentage > 70 ? 'warning' : 'success'}
                          />
                          <Tooltip title="Configure Trailer Capacity">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingVehicleId(layout.vehicleId);
                                setTrailerDimensions({
                                  length: layout.trailerLength,
                                  width: layout.trailerWidth,
                                  height: layout.trailerHeight,
                                  maxWeight: layout.maxWeight,
                                });
                                setShowEditTrailerDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Trailer Visualization */}
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          minHeight: 300,
                          position: 'relative',
                          bgcolor: '#f5f5f5',
                          border: '2px solid #333',
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          
                          // Handle repositioning existing items
                          if (draggedItemId && draggedItemId !== draggedJobId) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const dropX = e.clientX - rect.left;
                            const dropY = rect.bottom - e.clientY; // Y is from bottom for trailer visualization
                            
                            // Convert pixel coordinates to cm coordinates
                            const xCm = (dropX / rect.width) * layout.trailerLength;
                            const zCm = (dropY / rect.height) * layout.trailerHeight;
                            
                            // Find the item being repositioned
                            const allocations = plotAllocations[layout.vehicleId] || [];
                            const itemIndex = allocations.findIndex(a => a.plotId === draggedItemId);
                            if (itemIndex !== -1) {
                              const item = allocations[itemIndex];
                              const updatedItem = {
                                ...item,
                                position: {
                                  ...item.position,
                                  x: Math.max(0, Math.min(xCm - item.position.length / 2, layout.trailerLength - item.position.length)),
                                  z: Math.max(0, Math.min(zCm - item.position.height / 2, layout.trailerHeight - item.position.height)),
                                }
                              };
                              
                              const updatedAllocations = [...allocations];
                              updatedAllocations[itemIndex] = updatedItem;
                              setPlotAllocations(prev => ({
                                ...prev,
                                [layout.vehicleId]: updatedAllocations,
                              }));
                              
                              // Update database
                              try {
                                const { supabase } = await import('../lib/supabase');
                                const { error } = await supabase
                                  .from('trailer_plot_allocations')
                                  .update({ plot_position: updatedItem.position })
                                  .eq('plot_id', draggedItemId)
                                  .eq('vehicle_id', layout.vehicleId);
                                
                                if (error) throw error;
                              } catch (error: any) {
                                console.error('Failed to update position:', error);
                                alert(`Failed to update position: ${error.message}`);
                              }
                              
                              setDraggedItemId(null);
                              return;
                            }
                          }
                          
                          if (!draggedJobId) return;
                          
                          // Calculate drop position from mouse coordinates
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const dropX = e.clientX - rect.left;
                          const dropY = rect.bottom - e.clientY; // Y is from bottom for trailer visualization
                          
                          // Convert pixel coordinates to cm coordinates
                          const targetX = (dropX / rect.width) * layout.trailerLength;
                          const targetZ = (dropY / rect.height) * layout.trailerHeight;
                          
                          const job = pendingJobs.find(j => j.id === draggedJobId);
                          if (!job || !job.palletItems) return;
                          
                          // Normalize pallet items - ensure volumes are in m³
                          const palletItems = (job.palletItems as any[]).map(item => {
                            let normalizedVolume = item.totalVolume || 0;
                            
                            // If volume seems too large (> 100 m³), it might be in cm³ - convert it
                            if (normalizedVolume > 100) {
                              console.warn(`Volume too large (${normalizedVolume}), recalculating from dimensions`);
                              if (item.length && item.width && item.height) {
                                // Dimensions are in cm, convert to m³
                                normalizedVolume = (item.length * item.width * item.height) / 1000000;
                              } else {
                                // Fallback: assume it's cm³ and convert
                                normalizedVolume = normalizedVolume / 1000000;
                              }
                            }
                            
                            // If volume is 0 or missing, calculate from dimensions
                            if (normalizedVolume === 0 && item.length && item.width && item.height) {
                              normalizedVolume = (item.length * item.width * item.height) / 1000000;
                            }
                            
                            return {
                              ...item,
                              jobId: job.id,
                              totalVolume: normalizedVolume, // Use normalized volume
                            };
                          });
                          
                          const trailerCapacity = {
                            length: layout.trailerLength,
                            width: layout.trailerWidth,
                            height: layout.trailerHeight,
                            maxWeight: layout.maxWeight,
                            maxVolume: layout.maxVolume,
                          };
                          
                          const existingAllocations = plotAllocations[layout.vehicleId] || [];
                          const canAllocate = PlotAllocationService.canAllocate(
                            palletItems,
                            trailerCapacity,
                            existingAllocations
                          );
                          
                          if (!canAllocate.canAllocate) {
                            alert(`Cannot allocate: ${canAllocate.reason}`);
                            return;
                          }
                          
                          // Allocate plots, but adjust positions to target drop location
                          const newAllocations = PlotAllocationService.allocatePlots(
                            palletItems,
                            trailerCapacity,
                            existingAllocations
                          );
                          
                          // Adjust first allocation to target position if space allows
                          if (newAllocations.length > 0 && targetX > 0 && targetZ > 0) {
                            const firstAlloc = newAllocations[0];
                            const adjustedX = Math.max(0, Math.min(targetX - firstAlloc.position.length / 2, layout.trailerLength - firstAlloc.position.length));
                            const adjustedZ = Math.max(0, Math.min(targetZ - firstAlloc.position.height / 2, layout.trailerHeight - firstAlloc.position.height));
                            newAllocations[0] = {
                              ...firstAlloc,
                              position: {
                                ...firstAlloc.position,
                                x: adjustedX,
                                z: adjustedZ,
                              }
                            };
                          }
                          
                          setPlotAllocations(prev => ({
                            ...prev,
                            [layout.vehicleId]: [...existingAllocations, ...newAllocations],
                          }));
                          
                          // Validate IDs before saving - show helpful error if invalid
                          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                          if (!uuidRegex.test(job.id)) {
                            alert(`Cannot save allocation: Job ID "${job.id}" is not a valid UUID. This job appears to be demo/test data. Please use a job created through the "Add New Consignment" form.`);
                            setDraggedJobId(null);
                            return;
                          }
                          if (!uuidRegex.test(layout.vehicleId)) {
                            alert(`Cannot save allocation: Vehicle ID "${layout.vehicleId}" is not a valid UUID.\n\nThis vehicle appears to be demo data. Please:\n1. Go to Fleet Management\n2. Add vehicles with valid UUIDs from the database\n3. Ensure vehicles have Status: "Available" and Type: "HGV", "Articulated", "trailer", "truck", or "Van"`);
                            setDraggedJobId(null);
                            return;
                          }
                          
                          // Save to database
                          try {
                            const { supabase } = await import('../lib/supabase');
                            
                            // First check if table exists - if not, inform user to run migration
                            let allocationError: any = null;
                            for (const allocation of newAllocations) {
                              const { error } = await supabase.from('trailer_plot_allocations').insert({
                                job_id: job.id,
                                vehicle_id: layout.vehicleId,
                                plot_id: allocation.plotId,
                                plot_position: allocation.position,
                                pallet_items: allocation.palletItems,
                                total_weight: allocation.totalWeight,
                                total_volume: allocation.totalVolume,
                                plot_type: allocation.plotType,
                                status: 'allocated',
                              });
                              
                              if (error) {
                                console.error('Failed to insert allocation:', error);
                                console.error('Job ID:', job.id, 'Vehicle ID:', layout.vehicleId);
                                allocationError = error;
                                throw error;
                              }
                            }
                            
                            // Update job status to assigned
                            const updateResult = await JobService.updateJob(job.id, {
                              status: 'assigned',
                              assigned_vehicle_id: layout.vehicleId,
                            });
                            
                            if (!updateResult.success) {
                              console.error('Failed to update job status:', updateResult.error);
                              throw new Error(`Failed to update job status: ${updateResult.error}`);
                            }
                            
                            // Remove from pending list
                            setPendingJobs(prev => prev.filter(j => j.id !== job.id));
                          } catch (error: any) {
                            console.error('Failed to save allocation:', error);
                            console.error('Job ID:', job.id, 'Type:', typeof job.id);
                            console.error('Vehicle ID:', layout.vehicleId, 'Type:', typeof layout.vehicleId);
                            const errorMessage = error?.message || error?.details || error?.hint || 
                              (typeof error === 'string' ? error : JSON.stringify(error)) || 'Unknown error';
                            
                            // Check if it's a UUID validation error
                            if (errorMessage.includes('invalid input syntax for type uuid') || errorMessage.includes('UUID')) {
                              alert(`Failed to save allocation: Invalid UUID format.\n\nJob ID: "${job.id}"\nVehicle ID: "${layout.vehicleId}"\n\nPlease ensure you are using valid job and vehicle data from the database. Demo/test data cannot be allocated.`);
                            } else if (errorMessage.includes('does not exist') || errorMessage.includes('trailer_plot_allocations')) {
                              alert(`Database table missing. Please run the migration: database/migrations/create_trailer_plot_allocations.sql\n\nError: ${errorMessage}`);
                            } else {
                              alert(`Failed to save allocation: ${errorMessage}`);
                            }
                          }
                          
                          setDraggedJobId(null);
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Drag consignments here to allocate
                        </Typography>
                        
                        {/* Visual representation of allocated plots */}
                        {layout.cargoItems.map((item) => (
                          <Box
                            key={item.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggedItemId(item.plotId || item.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedItemId(null);
                            }}
                            sx={{
                              position: 'absolute',
                              left: `${(item.position?.x || 0) / layout.trailerLength * 100}%`,
                              bottom: `${(item.position?.z || 0) / layout.trailerHeight * 100}%`,
                              width: `${(item.position?.width || 0) / layout.trailerWidth * 100}%`,
                              height: `${(item.position?.height || 0) / layout.trailerHeight * 100}%`,
                              bgcolor: item.priority === 'high' ? '#ff6b6b' : 
                                      item.priority === 'medium' ? '#ffd93d' : '#6bcf7f',
                              border: '2px solid #333',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: 'white',
                              fontWeight: 'bold',
                              cursor: 'grab',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                opacity: 0.9,
                                borderColor: '#FFD700',
                                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.5)',
                              },
                              '&:active': {
                                cursor: 'grabbing',
                                opacity: 0.7,
                              },
                            }}
                            title={`${item.jobTitle} - ${item.description}\nDrag to reposition`}
                          >
                            {item.plotId || item.id?.substring(0, 8)}
                          </Box>
                        ))}
                      </Paper>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Weight: {layout.totalWeight / 1000}t / {layout.maxWeight / 1000}t
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Volume: {layout.totalVolume.toFixed(2)}m³ / {layout.maxVolume}m³
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <LinearProgress
                            variant="determinate"
                            value={layout.utilizationPercentage}
                            color={layout.utilizationPercentage > 90 ? 'error' : layout.utilizationPercentage > 70 ? 'warning' : 'success'}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Trailer Layouts Tab */}
      <TabPanel value={tabValue} index={1}>
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
      <TabPanel value={tabValue} index={2}>
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

      {/* Daily Manifest Report Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Daily Manifest Report
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => window.print()}
                  >
                    Print Manifest
                  </Button>
                </Box>
                
                {trailerLayouts.length === 0 ? (
                  <Alert severity="info">
                    No trailers have consignments allocated. Allocate consignments to see manifest details.
                  </Alert>
                ) : (
                  trailerLayouts
                    .filter(layout => layout.cargoItems.length > 0)
                    .map((layout) => {
                      const vehicle = vehicles.find(v => v.id === layout.vehicleId);
                      const allocations = plotAllocations[layout.vehicleId] || [];
                      
                      // Sort allocations by position (x coordinate for load sequence)
                      const sortedAllocations = [...allocations].sort((a, b) => a.position.x - b.position.x);
                      
                      return (
                        <Box key={layout.id} sx={{ mb: 4 }}>
                          <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
                            {layout.vehicleRegistration}
                          </Typography>
                          
                          {/* Vehicle and Driver Info */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Vehicle Information
                                  </Typography>
                                  <Typography variant="body1"><strong>Registration:</strong> {layout.vehicleRegistration}</Typography>
                                  <Typography variant="body1"><strong>Type:</strong> {vehicle?.type || 'N/A'}</Typography>
                                  <Typography variant="body1"><strong>Dimensions:</strong> {(layout.trailerLength / 100).toFixed(1)}m × {(layout.trailerWidth / 100).toFixed(1)}m × {(layout.trailerHeight / 100).toFixed(1)}m</Typography>
                                  <Typography variant="body1"><strong>Capacity:</strong> {(layout.maxWeight / 1000).toFixed(1)}t / {layout.maxVolume.toFixed(2)}m³</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Load Summary
                                  </Typography>
                                  <Typography variant="body1"><strong>Total Weight:</strong> {(layout.totalWeight / 1000).toFixed(2)}t</Typography>
                                  <Typography variant="body1"><strong>Total Volume:</strong> {layout.totalVolume.toFixed(2)}m³</Typography>
                                  <Typography variant="body1"><strong>Utilization:</strong> {Math.round(layout.utilizationPercentage)}%</Typography>
                                  <Typography variant="body1"><strong>Number of Consignments:</strong> {sortedAllocations.length}</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                          
                          {/* Consignment Details Table */}
                          <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Plot ID</strong></TableCell>
                                  <TableCell><strong>Job Number</strong></TableCell>
                                  <TableCell><strong>Customer</strong></TableCell>
                                  <TableCell><strong>Description</strong></TableCell>
                                  <TableCell><strong>Position (X, Y, Z)</strong></TableCell>
                                  <TableCell><strong>Dimensions (L×W×H)</strong></TableCell>
                                  <TableCell><strong>Weight</strong></TableCell>
                                  <TableCell><strong>Volume</strong></TableCell>
                                  <TableCell><strong>Load Sequence</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sortedAllocations.map((allocation, index) => {
                                  const job = jobs.find(j => j.id === allocation.jobId);
                                  const palletItem = allocation.palletItems[0];
                                  
                                  return (
                                    <TableRow key={allocation.plotId}>
                                      <TableCell>{allocation.plotId}</TableCell>
                                      <TableCell>{job?.jobNumber || 'N/A'}</TableCell>
                                      <TableCell>{job?.customerName || 'N/A'}</TableCell>
                                      <TableCell>
                                        {palletItem?.palletType || allocation.jobTitle || 'Consignment'}
                                        {palletItem?.quantity && ` (${palletItem.quantity}x)`}
                                      </TableCell>
                                      <TableCell>
                                        {Math.round(allocation.position.x)}cm, {Math.round(allocation.position.y)}cm, {Math.round(allocation.position.z)}cm
                                      </TableCell>
                                      <TableCell>
                                        {Math.round(allocation.position.length)}×{Math.round(allocation.position.width)}×{Math.round(allocation.position.height)}cm
                                      </TableCell>
                                      <TableCell>{(allocation.totalWeight / 1000).toFixed(2)}t</TableCell>
                                      <TableCell>{allocation.totalVolume.toFixed(2)}m³</TableCell>
                                      <TableCell>
                                        <Chip 
                                          label={`#${index + 1}`} 
                                          size="small" 
                                          color="primary"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {/* Loading Instructions */}
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Loading Instructions
                              </Typography>
                              <Typography variant="body2">
                                • Load consignments in the sequence shown above (Plot #1 first, then #2, etc.)
                              </Typography>
                              <Typography variant="body2">
                                • Position items according to coordinates: X (front to back), Y (left to right), Z (bottom to top)
                              </Typography>
                              <Typography variant="body2">
                                • Ensure weight distribution is balanced - current utilization: {Math.round(layout.utilizationPercentage)}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      );
                    })
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Loading Optimization Tab */}
      <TabPanel value={tabValue} index={3}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Trailer Capacity
                  </Typography>
                  <Tooltip title="Edit Trailer Capacity">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (!selectedLayout) return;
                        setEditingVehicleId(selectedLayout.vehicleId);
                        setTrailerDimensions({
                          length: selectedLayout.trailerLength,
                          width: selectedLayout.trailerWidth,
                          height: selectedLayout.trailerHeight,
                          maxWeight: selectedLayout.maxWeight,
                        });
                        setShowEditTrailerDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Length
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayout.trailerLength / 100}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Width
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayout.trailerWidth / 100}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Height
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayout.trailerHeight / 100}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Max Weight
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayout.maxWeight / 1000}t
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Max Volume
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {selectedLayout.maxVolume.toFixed(2)}m³
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Weight
                    </Typography>
                    <Typography variant="body1">
                      {(selectedLayout.totalWeight / 1000).toFixed(2)}t
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Volume
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayout.totalVolume.toFixed(2)}m³
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Utilization: {Math.round(selectedLayout.utilizationPercentage)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedLayout.utilizationPercentage}
                      color={selectedLayout.utilizationPercentage > 90 ? 'error' : selectedLayout.utilizationPercentage > 70 ? 'warning' : 'success'}
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
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
                <Typography variant="h6" gutterBottom>
                  Assign Job / Vehicle / Driver
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Job</InputLabel>
                    <Select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      label="Select Job"
                    >
                      {jobs.filter(j => j.status === 'pending' || j.status === 'assigned').map(j => (
                        <MenuItem key={j.id} value={j.id}>{j.title} - {j.customerName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Select Vehicle</InputLabel>
                    <Select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      label="Select Vehicle"
                    >
                      {vehicles.map(v => (
                        <MenuItem key={v.id} value={v.id}>{v.registration || v.name || v.id}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Select Driver</InputLabel>
                    <Select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      label="Select Driver"
                    >
                      {drivers.map(d => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    disabled={!selectedJobId || !selectedVehicleId || !selectedDriverId}
                    onClick={handleAssign}
                  >
                    Assign
                  </Button>
                </Box>

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

      {/* Edit Trailer Capacity Dialog */}
      <Dialog open={showEditTrailerDialog} onClose={() => setShowEditTrailerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure Trailer Capacity: {trailerLayouts.find(l => l.vehicleId === editingVehicleId)?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          {trailerDimensions && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Configure the actual dimensions and capacity of this trailer/vehicle. 
                    Volume will be automatically calculated from dimensions.
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Length (cm)"
                  type="number"
                  value={trailerDimensions.length}
                  onChange={(e) => {
                    const length = Number(e.target.value);
                    setTrailerDimensions(prev => prev ? {
                      ...prev,
                      length,
                    } : null);
                  }}
                  helperText={`${(trailerDimensions.length / 100).toFixed(2)}m`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Width (cm)"
                  type="number"
                  value={trailerDimensions.width}
                  onChange={(e) => {
                    const width = Number(e.target.value);
                    setTrailerDimensions(prev => prev ? {
                      ...prev,
                      width,
                    } : null);
                  }}
                  helperText={`${(trailerDimensions.width / 100).toFixed(2)}m`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={trailerDimensions.height}
                  onChange={(e) => {
                    const height = Number(e.target.value);
                    setTrailerDimensions(prev => prev ? {
                      ...prev,
                      height,
                    } : null);
                  }}
                  helperText={`${(trailerDimensions.height / 100).toFixed(2)}m`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Weight (kg)"
                  type="number"
                  value={trailerDimensions.maxWeight}
                  onChange={(e) => {
                    const maxWeight = Number(e.target.value);
                    setTrailerDimensions(prev => prev ? {
                      ...prev,
                      maxWeight,
                    } : null);
                  }}
                  helperText={`${(trailerDimensions.maxWeight / 1000).toFixed(2)} tons`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="text.secondary">
                    Calculated Max Volume
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {trailerDimensions ? 
                      ((trailerDimensions.length * trailerDimensions.width * trailerDimensions.height) / 1000000).toFixed(2)
                      : 0}m³
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Length × Width × Height) / 1,000,000
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditTrailerDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!trailerDimensions || !editingVehicleId) return;
              
              // Update the trailer layout with new dimensions
              const calculatedVolume = (trailerDimensions.length * trailerDimensions.width * trailerDimensions.height) / 1000000;
              
              setTrailerLayouts(prev => prev.map(layout => {
                if (layout.vehicleId === editingVehicleId) {
                  return {
                    ...layout,
                    trailerLength: trailerDimensions.length,
                    trailerWidth: trailerDimensions.width,
                    trailerHeight: trailerDimensions.height,
                    maxWeight: trailerDimensions.maxWeight,
                    maxVolume: calculatedVolume,
                    // Recalculate utilization
                    utilizationPercentage: (layout.totalVolume / calculatedVolume) * 100,
                  };
                }
                return layout;
              }));
              
              setShowEditTrailerDialog(false);
            }}
          >
            Save Capacity
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
