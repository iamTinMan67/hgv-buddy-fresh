import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import JobAllocationForm from './JobAllocationForm';
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
import { supabase } from '../lib/supabase';
import {
  DailySchedule,
  JobStatus,
  updateScheduleJobStatus,
  updateJobStatus,
  addDailySchedule,
  addJob,
  updateJob,
  JobAssignment,
} from '../store/slices/jobSlice';
import { JobService } from '../services/api';

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

interface Route {
  id: string;
  name: string;
  vehicle_id: string | null;
  driver_id: string | null;
  date: string;
  status: string;
  total_distance: number;
  estimated_duration: number;
  start_location: string | null;
  end_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

// Helper function to map DB priority values back to UI display labels
const getPriorityDisplayLabel = (priority: string | undefined, originalPriority?: string | null): string => {
  // If originalPriority is available, use it directly for display
  if (originalPriority) {
    const originalPriorityMap: Record<string, string> = {
      'before_9am': 'Before 9am',
      'am_timed': 'AM Timed',
      'pm_timed': 'PM Timed',
      'any_time': 'Any time',
    };
    return originalPriorityMap[originalPriority] || originalPriority;
  }
  
  // Otherwise, map database priority values to display labels
  const priorityMap: Record<string, string> = {
    'urgent': 'Before 9am',
    'high': 'AM Timed',
    'medium': 'PM Timed',
    'low': 'Any time',
    // Handle legacy values if any
    'before_9am': 'Before 9am',
    'am_timed': 'AM Timed',
    'pm_timed': 'PM Timed',
    'any_time': 'Any time',
  };
  return priorityMap[priority || ''] || priority || 'Any time';
};

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
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeSelectionMode, setRouteSelectionMode] = useState<'existing' | 'new'>('new');
  const [newRouteName, setNewRouteName] = useState('');
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

  // Get vehicles from Redux store
  const { vehicles } = useSelector((state: RootState) => state.vehicle);

  // Pending jobs available for scheduling (exclude hardcoded demo seeds and jobs already assigned to routes)
  const availableJobs = jobs.filter(j => 
    j.status === 'pending' && 
    !['1','2','3'].includes(j.id) &&
    !(j as any).routeId // Exclude jobs already assigned to a route
  );

  // Cache of delivery_addresses from DB to resolve names/addresses for DB-backed jobs
  const [addressCache, setAddressCache] = useState<Record<string, any>>({});
  React.useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('delivery_addresses').select('*');
        if (!error && data) {
          const map: Record<string, any> = {};
          for (const row of data) map[row.id] = row;
          setAddressCache(map);
        }
      } catch {}
    })();
  }, []);

  // Fetch routes from database
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRoutes(true);
      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && mounted) {
          setRoutes(data);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        if (mounted) setLoadingRoutes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch pending jobs from database on component mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await JobService.getJobs({ status: 'pending' });
        if (!mounted || !result.success || !result.data) return;
        
        // Convert DB jobs to JobAssignment format and add to Redux if not already present
        // Note: We check against jobs in Redux at fetch time, duplicates will be prevented
        result.data.forEach((dbJob: any) => {
          // Check if job already exists in Redux state
          const existingJob = jobs.find(j => j.id === dbJob.id || j.jobNumber === dbJob.job_number);
          const shouldUpdate = existingJob !== undefined;
          
          // Always process the job to extract data (whether new or existing)
          // Extract pickup and delivery address data (may be JSON objects or plain objects)
          let pickupAddr: any = {};
          let deliveryAddr: any = {};
          
          console.log('Raw dbJob.pickup_address:', dbJob.pickup_address);
          console.log('Raw dbJob.delivery_address:', dbJob.delivery_address);
          console.log('Raw dbJob.customer_name:', dbJob.customer_name);
          console.log('Raw dbJob.customer_phone:', dbJob.customer_phone);
          console.log('Raw dbJob.customer_email:', dbJob.customer_email);
          
          try {
            if (dbJob.pickup_address) {
              pickupAddr = typeof dbJob.pickup_address === 'string' 
                ? JSON.parse(dbJob.pickup_address) 
                : (dbJob.pickup_address || {});
              console.log('Parsed pickup_address:', pickupAddr);
              console.log('pickupAddr.address:', pickupAddr.address);
              console.log('pickupAddr keys:', Object.keys(pickupAddr));
            }
            if (dbJob.delivery_address) {
              deliveryAddr = typeof dbJob.delivery_address === 'string' 
                ? JSON.parse(dbJob.delivery_address) 
                : (dbJob.delivery_address || {});
              console.log('Parsed delivery_address:', deliveryAddr);
              console.log('deliveryAddr.address:', deliveryAddr.address);
              console.log('deliveryAddr keys:', Object.keys(deliveryAddr));
            }
          } catch (e) {
            console.error('Error parsing address JSON:', e);
          }
          
          // Extract address object - handle both nested (address.address) and flat structures
          const getAddressObject = (addrObj: any) => {
            if (!addrObj || typeof addrObj !== 'object') {
              return {};
            }
            
            // Check for nested address structure first
            if (addrObj.address && typeof addrObj.address === 'object' && Object.keys(addrObj.address).length > 0) {
              console.log('Found nested address structure');
              return addrObj.address;
            }
            
            // If address fields are at the top level, extract them
            const hasAddressFields = addrObj.line1 || addrObj.line3 || addrObj.postcode || addrObj.town || addrObj.city || 
                                   addrObj.addressLine1 || addrObj.address_line1 || addrObj.addressLine3 || addrObj.address_line3;
            
            if (hasAddressFields) {
              console.log('Found flat address structure');
              return {
                line1: addrObj.line1 || addrObj.addressLine1 || addrObj.address_line1,
                line2: addrObj.line2 || addrObj.addressLine2 || addrObj.address_line2,
                line3: addrObj.line3 || addrObj.addressLine3 || addrObj.address_line3,
                town: addrObj.town,
                city: addrObj.city,
                postcode: addrObj.postcode,
              };
            }
            
            console.log('No address fields found in:', addrObj);
            return {};
          };

          // Extract metadata from special_requirements (stored as JSON string with METADATA: prefix)
          let metadata: any = {};
          if (dbJob.special_requirements) {
            const metadataMatch = dbJob.special_requirements.match(/METADATA:(.+?)(?:\s*\||$)/);
            if (metadataMatch) {
              try {
                metadata = JSON.parse(metadataMatch[1]);
              } catch (e) {
                console.error('Error parsing metadata from special_requirements:', e);
              }
            }
          }
          
          // Extract pallet items - check metadata first, then pickup_address, then direct field
          let palletItems: any[] = [];
          if (metadata.pallet_items) {
            palletItems = Array.isArray(metadata.pallet_items) ? metadata.pallet_items : [];
          } else if (pickupAddr.pallet_items) {
            palletItems = Array.isArray(pickupAddr.pallet_items) ? pickupAddr.pallet_items : [];
          } else if (dbJob.pallet_items) {
            palletItems = typeof dbJob.pallet_items === 'string' 
              ? JSON.parse(dbJob.pallet_items) 
              : (Array.isArray(dbJob.pallet_items) ? dbJob.pallet_items : []);
          }
          
          // Extract time_sensitive - check metadata first, then pickup_address, then direct field
          // Also auto-enable if priority is set to a non-"low" value (time sensitive by default when priority is set)
          const timeSensitive = metadata.time_sensitive !== undefined
            ? metadata.time_sensitive
            : (pickupAddr.time_sensitive !== undefined 
              ? pickupAddr.time_sensitive 
              : (dbJob.time_sensitive !== undefined
                ? dbJob.time_sensitive
                : (dbJob.priority && dbJob.priority !== 'low' ? true : false)));
          
          // Extract client info from metadata
          const clientId = metadata.clientId || pickupAddr.clientId || null;
          const clientNameFromMetadata = metadata.clientName || pickupAddr.clientName || '';
          
          // Extract original UI priority value from metadata for display (e.g., "before_9am" instead of "urgent")
          const originalPriority = metadata.originalPriority || null;

          // Calculate totals from pallet items if available
          const totalWeight = palletItems.length > 0
            ? palletItems.reduce((sum: number, item: any) => sum + (item.totalWeight || 0), 0)
            : (dbJob.cargo_weight || 0);
          const totalVolume = palletItems.length > 0
            ? palletItems.reduce((sum: number, item: any) => sum + (item.totalVolume || 0), 0)
            : 0;

              // Convert DB job to JobAssignment format
              // Extract client data from metadata or pickup_address JSON (client data stored there, not in customer_* columns)
              const clientName = clientNameFromMetadata || pickupAddr.clientName || dbJob.customer_name || '';
              
              const jobAssignment: JobAssignment = {
                id: dbJob.id,
                jobNumber: dbJob.job_number || dbJob.id,
                title: dbJob.title || '',
                description: dbJob.description || '',
                customerName: clientName,
                customerPhone: pickupAddr.contactPhone || dbJob.customer_phone || undefined,
                customerEmail: pickupAddr.contactEmail || dbJob.customer_email || undefined,
                priority: dbJob.priority || 'low',
            status: (dbJob.status || 'pending') as JobStatus,
            scheduledDate: dbJob.scheduled_date || '',
            scheduledTime: dbJob.scheduled_time || '',
            estimatedDuration: dbJob.estimated_duration || 0,
            pickupLocation: {
              id: `pickup-${dbJob.id}`,
              name: pickupAddr.name || 'Pickup Location',
              address: getAddressObject(pickupAddr),
              contactPerson: pickupAddr.contactPerson || '',
              contactPhone: pickupAddr.contactPhone || '',
              contactEmail: pickupAddr.contactEmail || '',
              deliveryInstructions: pickupAddr.deliveryInstructions || '',
            },
            deliveryLocation: {
              id: `delivery-${dbJob.id}`,
              name: deliveryAddr.name || 'Delivery Location',
              address: getAddressObject(deliveryAddr),
              contactPerson: deliveryAddr.contactPerson || '',
              contactPhone: deliveryAddr.contactPhone || '',
              contactEmail: deliveryAddr.contactEmail || '',
              deliveryInstructions: deliveryAddr.deliveryInstructions || '',
            },
            useDifferentDeliveryAddress: false,
            cargoType: dbJob.cargo_type || '',
            cargoWeight: totalWeight,
            specialRequirements: (() => {
              // Extract actual special_requirements text (remove METADATA:JSON part)
              if (!dbJob.special_requirements) return '';
              const cleaned = dbJob.special_requirements.replace(/METADATA:.+?(?:\s*\||$)/, '').trim();
              return cleaned || '';
            })(),
            notes: '',
            createdAt: dbJob.created_at || new Date().toISOString(),
            updatedAt: dbJob.updated_at || new Date().toISOString(),
            createdBy: 'system',
            authorizedBy: 'system',
            loadDimensions: (() => {
              if (palletItems.length > 0) {
                // Calculate aggregate dimensions from all pallet items
                const maxLength = Math.max(...palletItems.map((item: any) => item.length || 0));
                const maxWidth = Math.max(...palletItems.map((item: any) => item.width || 0));
                const totalHeight = palletItems.reduce((sum: number, item: any) => 
                  sum + ((item.height || 0) * (item.quantity || 1)), 0);
                
                return {
                  length: Math.round(maxLength),
                  width: Math.round(maxWidth),
                  height: Math.round(totalHeight),
                  weight: totalWeight,
                  volume: totalVolume,
                  isOversized: maxLength > 300 || maxWidth > 300 || totalHeight > 400,
                  isProtruding: false,
                  isBalanced: true,
                  isFragile: false,
                };
              } else {
                // Fallback for jobs without pallet items
                return {
                  length: 0,
                  width: 0,
                  height: 0,
                  weight: totalWeight,
                  volume: totalVolume,
                  isOversized: false,
                  isProtruding: false,
                  isBalanced: true,
                  isFragile: false,
                };
              }
            })(),
          };

          // Add pallet items and time sensitive flag if they exist
          if (palletItems.length > 0) {
            (jobAssignment as any).palletItems = palletItems;
          }
          (jobAssignment as any).timeSensitive = timeSensitive;
          // Store original UI priority for display (if available from metadata)
          if (originalPriority) {
            (jobAssignment as any).originalPriority = originalPriority;
          }
          
          // Store route_id if available from database
          if (dbJob.route_id) {
            (jobAssignment as any).routeId = dbJob.route_id;
          }
          
          console.log('Final jobAssignment structure:', jobAssignment);
          console.log('Job customerName:', jobAssignment.customerName);
          console.log('Job pickupLocation:', jobAssignment.pickupLocation);
          console.log('Job deliveryLocation:', jobAssignment.deliveryLocation);
          
          // Update existing job or add new one
          if (shouldUpdate) {
            console.log('Updating existing job in Redux with DB data');
            dispatch(updateJob(jobAssignment));
          } else {
            console.log('Adding new job to Redux');
            dispatch(addJob(jobAssignment));
          }
        });
      } catch (error) {
        console.error('Error fetching pending jobs:', error);
      }
    })();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch once on mount to sync DB jobs to Redux

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

  // Safely format a location display for cards
  const formatLocation = (loc: any, dbAddressId?: string): string => {
    // If DB id provided, try resolve from cache
    if (dbAddressId && addressCache[dbAddressId]) {
      const row = addressCache[dbAddressId];
      const parts = [row.address_line1, row.town || row.city, row.postcode].filter(Boolean);
      return parts.length ? parts.join(', ') : row.name || 'N/A';
    }
    if (!loc) return 'N/A';
    const name: string | undefined = (loc as any).name;
    const addr = (loc as any).address || {};
    if (name && name.trim()) return name;
    const parts = [addr.line1, addr.town || addr.city, addr.postcode].filter(Boolean);
    return parts.length ? parts.join(', ') : 'N/A';
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
          // Also update route name if in new route mode
          if (routeSelectionMode === 'new') {
            setNewRouteName(city);
          }
        }
      }
    } else {
      setNewSchedule(prev => ({ ...prev, runTitle: '' }));
      if (routeSelectionMode === 'new') {
        setNewRouteName('');
      }
    }
  };

  const handleAddSchedule = async () => {
    try {
      let routeId = newSchedule.routePlanId;
      
      // If creating a new route
      if (routeSelectionMode === 'new' && newRouteName.trim()) {
        // Find the permanent trailer for the selected vehicle
        let permanentTrailerId = null;
        if (newSchedule.vehicleId) {
          const selectedVehicle = vehicles.find(v => v.id === newSchedule.vehicleId);
          if (selectedVehicle && (selectedVehicle as any).permanent_trailer_id) {
            permanentTrailerId = (selectedVehicle as any).permanent_trailer_id;
          }
        }
        
        const { data: newRoute, error: routeError } = await supabase
          .from('routes')
          .insert({
            name: newRouteName.trim(),
            vehicle_id: newSchedule.vehicleId || null,
            trailer_id: permanentTrailerId, // Auto-assign permanent trailer if available
            date: newSchedule.date,
            status: 'planned',
            total_distance: 0,
            estimated_duration: 0,
            created_by: user?.id || null,
          })
          .select()
          .single();
        
        if (routeError || !newRoute) {
          alert(`Failed to create route: ${routeError?.message || 'Unknown error'}`);
          return;
        }
        routeId = newRoute.id;
        setRoutes(prev => [newRoute, ...prev]);
        
        // If a permanent trailer was assigned, notify user
        let permanentTrailerName = '';
        if (permanentTrailerId) {
          const trailer = vehicles.find(v => v.id === permanentTrailerId);
          if (trailer) {
            permanentTrailerName = (trailer as any).trailerName || (trailer as any).model || 'the trailer';
            console.log(`Permanent trailer "${permanentTrailerName}" automatically assigned to route`);
          }
        }
      }
      
      // If using an existing route, also check for permanent trailer
      if (routeSelectionMode === 'existing' && newSchedule.routePlanId) {
        const existingRoute = routes.find(r => r.id === newSchedule.routePlanId);
        if (existingRoute && existingRoute.vehicle_id) {
          const routeVehicle = vehicles.find(v => v.id === existingRoute.vehicle_id);
          if (routeVehicle && (routeVehicle as any).permanent_trailer_id && !existingRoute.trailer_id) {
            // Update the route with the permanent trailer if not already set
            const { error: updateError } = await supabase
              .from('routes')
              .update({ trailer_id: (routeVehicle as any).permanent_trailer_id })
              .eq('id', existingRoute.id);
            
            if (!updateError) {
              const trailer = vehicles.find(v => v.id === (routeVehicle as any).permanent_trailer_id);
              if (trailer) {
                const trailerName = (trailer as any).trailerName || (trailer as any).model || 'the trailer';
                console.log(`Permanent trailer "${trailerName}" automatically assigned to existing route`);
              }
            }
          }
        }
      }
      
      if (!routeId) {
        alert('Please select or create a route');
        return;
      }
      
      // Update all selected jobs with route_id
      const updatePromises = newSchedule.jobs.map(jobId =>
        supabase
          .from('jobs')
          .update({ route_id: routeId })
          .eq('id', jobId)
      );
      
      const updateResults = await Promise.all(updatePromises);
      const hasErrors = updateResults.some(result => result.error);
      
      if (hasErrors) {
        console.error('Some jobs failed to update:', updateResults);
        alert('Some jobs failed to be assigned to the route. Please check and try again.');
        return;
      }
      
      // Check if route has a trailer assigned
      let finalRoute = routes.find(r => r.id === routeId);
      if (!finalRoute) {
        // Fetch from database if not in local state
        const { data: routeData } = await supabase
          .from('routes')
          .select('*')
          .eq('id', routeId)
          .single();
        finalRoute = routeData as any;
      }
      const routeHasTrailer = finalRoute && (finalRoute as any).trailer_id;
      
      // Create the schedule in Redux
      const schedule: DailySchedule = {
        id: Date.now().toString(),
        vehicleId: newSchedule.vehicleId,
        driverId: undefined, // No driver assigned initially
        date: newSchedule.date,
        routePlanId: routeId,
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
      
      // Notify user about trailer planner if a trailer is assigned
      if (routeHasTrailer) {
        const trailer = vehicles.find(v => v.id === (finalRoute as any).trailer_id);
        const trailerName = trailer ? ((trailer as any).trailerName || (trailer as any).model || 'the trailer') : 'the trailer';
        alert(`Route created successfully!\n\nTrailer "${trailerName}" has been assigned to this route.\n\nOpen the Trailer Planner to allocate consignments and plan the load.`);
      }
      
      // Update jobs in Redux to mark them as assigned to route
      newSchedule.jobs.forEach(jobId => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          dispatch(updateJob({
            ...job,
            status: 'assigned' as JobStatus,
          } as JobAssignment));
        }
      });
      
      setShowAddDialog(false);
      setNewSchedule({
        vehicleId: 'V001', // Reset to default Vehicle 1
        runTitle: 'City', // Reset to default "City"
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Reset to Today + 1
        routePlanId: '',
        jobs: [],
        notes: '',
      });
      setRouteSelectionMode('new');
      setNewRouteName('');
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      alert(`Failed to create schedule: ${error?.message || 'Unknown error'}`);
    }
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          Daily Planner
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem', mr: 2 }}>
          <Home />
        </IconButton>
        <Box sx={{ ml: 'auto' }}>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setShowAddDialog(true)}
            >
              Create Schedule
            </Button>
          )}
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
                          label={getPriorityDisplayLabel(job.priority, (job as any).originalPriority)}
                          size="small"
                          color={job.priority === 'high' || job.priority === 'urgent' ? 'error' : job.priority === 'medium' ? 'warning' : 'success'}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Pickup
                        </Typography>
                        <Typography variant="body2">
                          {formatLocation(job.pickupLocation, (job as any).pickup_address_id)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery
                        </Typography>
                        <Typography variant="body2">
                          {formatLocation(job.deliveryLocation, (job as any).delivery_address_id)}
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
                        onClick={async () => {
                          // Fetch fresh job data from database to ensure we have all fields
                          try {
                            const result = await JobService.getJob(job.id);
                            if (result.success && result.data) {
                              const dbJob = result.data;
                              
                              // Parse address data the same way we do in fetchPendingJobs
                              let pickupAddr: any = {};
                              let deliveryAddr: any = {};
                              
                              if (dbJob.pickup_address) {
                                pickupAddr = typeof dbJob.pickup_address === 'string' 
                                  ? JSON.parse(dbJob.pickup_address) 
                                  : (dbJob.pickup_address || {});
                              }
                              if (dbJob.delivery_address) {
                                deliveryAddr = typeof dbJob.delivery_address === 'string' 
                                  ? JSON.parse(dbJob.delivery_address) 
                                  : (dbJob.delivery_address || {});
                              }
                              
                              const getAddressObject = (addrObj: any) => {
                                if (!addrObj || typeof addrObj !== 'object') return {};
                                if (addrObj.address && typeof addrObj.address === 'object' && Object.keys(addrObj.address).length > 0) {
                                  return addrObj.address;
                                }
                                if (addrObj.line1 || addrObj.line3 || addrObj.postcode || addrObj.town || addrObj.city || 
                                    addrObj.addressLine1 || addrObj.address_line1 || addrObj.addressLine3 || addrObj.address_line3) {
                                  return {
                                    line1: addrObj.line1 || addrObj.addressLine1 || addrObj.address_line1,
                                    line2: addrObj.line2 || addrObj.addressLine2 || addrObj.address_line2,
                                    line3: addrObj.line3 || addrObj.addressLine3 || addrObj.address_line3,
                                    town: addrObj.town,
                                    city: addrObj.city,
                                    postcode: addrObj.postcode,
                                  };
                                }
                                return {};
                              };
                              
                              // Extract metadata from special_requirements (stored as JSON string with METADATA: prefix)
                              let metadata: any = {};
                              if (dbJob.special_requirements) {
                                const metadataMatch = dbJob.special_requirements.match(/METADATA:(.+?)(?:\s*\||$)/);
                                if (metadataMatch) {
                                  try {
                                    metadata = JSON.parse(metadataMatch[1]);
                                  } catch (e) {
                                    console.error('Error parsing metadata from special_requirements:', e);
                                  }
                                }
                              }
                              
                              // Extract pallet items - check metadata first, then pickup_address, then direct field
                              let palletItems: any[] = [];
                              if (metadata.pallet_items) {
                                palletItems = Array.isArray(metadata.pallet_items) ? metadata.pallet_items : [];
                              } else if (pickupAddr.pallet_items) {
                                palletItems = Array.isArray(pickupAddr.pallet_items) ? pickupAddr.pallet_items : [];
                              } else if (dbJob.pallet_items) {
                                palletItems = typeof dbJob.pallet_items === 'string'
                                  ? JSON.parse(dbJob.pallet_items)
                                  : (Array.isArray(dbJob.pallet_items) ? dbJob.pallet_items : []);
                              }
                              
                              // Extract time_sensitive - check metadata first, then pickup_address, then direct field
                              // Also auto-enable if priority is set to a non-"low" value (time sensitive by default when priority is set)
                              const timeSensitive = metadata.time_sensitive !== undefined
                                ? metadata.time_sensitive
                                : (pickupAddr.time_sensitive !== undefined
                                  ? pickupAddr.time_sensitive
                                  : (dbJob.time_sensitive !== undefined
                                    ? dbJob.time_sensitive
                                    : (dbJob.priority && dbJob.priority !== 'low' ? true : false)));
                              
                              // Extract original UI priority value from metadata for display (e.g., "before_9am" instead of "urgent")
                              const originalPriority = metadata.originalPriority || null;
                              
                              // Calculate load dimensions from pallet items
                              const calculateLoadDimensions = () => {
                                if (palletItems.length > 0) {
                                  const maxLength = Math.max(...palletItems.map((item: any) => item.length || 0));
                                  const maxWidth = Math.max(...palletItems.map((item: any) => item.width || 0));
                                  const totalHeight = palletItems.reduce((sum: number, item: any) => 
                                    sum + ((item.height || 0) * (item.quantity || 1)), 0);
                                  const totalWeight = palletItems.reduce((sum: number, item: any) => 
                                    sum + (item.totalWeight || 0), 0);
                                  const totalVolume = palletItems.reduce((sum: number, item: any) => 
                                    sum + (item.totalVolume || 0), 0);
                                  
                                  return {
                                    length: Math.round(maxLength),
                                    width: Math.round(maxWidth),
                                    height: Math.round(totalHeight),
                                    weight: totalWeight,
                                    volume: totalVolume,
                                    isOversized: maxLength > 300 || maxWidth > 300 || totalHeight > 400,
                                    isProtruding: false,
                                    isBalanced: true,
                                    isFragile: false,
                                  };
                                }
                                // Fallback to existing loadDimensions or default
                                return job.loadDimensions || {
                                  length: 0,
                                  width: 0,
                                  height: 0,
                                  weight: job.cargoWeight || 0,
                                  volume: 0,
                                  isOversized: false,
                                  isProtruding: false,
                                  isBalanced: true,
                                  isFragile: false,
                                };
                              };
                              
                              // Extract client data from pickup_address JSON (client data stored there, not in customer_* columns)
                              const clientNameFromJSON = pickupAddr.clientName || dbJob.customer_name || job.customerName || '';
                              
                              // Create full job object with all parsed data
                              const fullJob: any = {
                                ...job,
                                customerName: clientNameFromJSON,
                                customerPhone: pickupAddr.contactPhone || dbJob.customer_phone || job.customerPhone,
                                customerEmail: pickupAddr.contactEmail || dbJob.customer_email || job.customerEmail,
                                pickupLocation: {
                                  ...job.pickupLocation,
                                  name: pickupAddr.name || job.pickupLocation?.name || 'Pickup Location',
                                  address: getAddressObject(pickupAddr),
                                  contactPerson: pickupAddr.contactPerson || job.pickupLocation?.contactPerson || '',
                                  contactPhone: pickupAddr.contactPhone || job.pickupLocation?.contactPhone || '',
                                  contactEmail: pickupAddr.contactEmail || job.pickupLocation?.contactEmail || '',
                                  deliveryInstructions: pickupAddr.deliveryInstructions || job.pickupLocation?.deliveryInstructions || '',
                                },
                                deliveryLocation: {
                                  ...job.deliveryLocation,
                                  name: deliveryAddr.name || job.deliveryLocation?.name || 'Delivery Location',
                                  address: getAddressObject(deliveryAddr),
                                  contactPerson: deliveryAddr.contactPerson || job.deliveryLocation?.contactPerson || '',
                                  contactPhone: deliveryAddr.contactPhone || job.deliveryLocation?.contactPhone || '',
                                  contactEmail: deliveryAddr.contactEmail || job.deliveryLocation?.contactEmail || '',
                                  deliveryInstructions: deliveryAddr.deliveryInstructions || job.deliveryLocation?.deliveryInstructions || '',
                                },
                                loadDimensions: calculateLoadDimensions(),
                                timeSensitive,
                              };
                              
                              if (palletItems.length > 0) {
                                fullJob.palletItems = palletItems;
                              }
                              // Store original UI priority for display (if available from metadata)
                              if (originalPriority) {
                                fullJob.originalPriority = originalPriority;
                              }
                              
                              console.log('Full job from DB:', fullJob);
                              setSelectedJobForDetails(fullJob);
                            } else {
                              // Fallback to Redux job if DB fetch fails
                              setSelectedJobForDetails(job);
                            }
                          } catch (error) {
                            console.error('Error fetching job details:', error);
                            // Fallback to Redux job if there's an error
                            setSelectedJobForDetails(job);
                          }
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Route Selection</InputLabel>
                <Select
                  value={routeSelectionMode}
                  onChange={(e) => {
                    const mode = e.target.value as 'existing' | 'new';
                    setRouteSelectionMode(mode);
                    if (mode === 'new') {
                      setNewSchedule({ ...newSchedule, routePlanId: '' });
                      // Auto-populate route name from run title if available
                      if (newSchedule.runTitle) {
                        setNewRouteName(newSchedule.runTitle);
                      }
                    } else {
                      setNewRouteName('');
                    }
                  }}
                  label="Route Selection"
                >
                  <MenuItem value="new">Create New Route</MenuItem>
                  <MenuItem value="existing">Add to Existing Route</MenuItem>
                </Select>
                <FormHelperText>
                  Choose to create a new route or add consignments to an existing route
                </FormHelperText>
              </FormControl>
            </Grid>
            {routeSelectionMode === 'new' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Route Name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder={newSchedule.runTitle || 'Enter route name'}
                  helperText="Route name will be auto-populated from run title if available"
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Existing Route</InputLabel>
                  <Select
                    value={newSchedule.routePlanId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, routePlanId: e.target.value })}
                    label="Select Existing Route"
                    disabled={loadingRoutes}
                  >
                    {routes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name} - {new Date(route.date).toLocaleDateString()} ({route.status})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {loadingRoutes ? 'Loading routes...' : routes.length === 0 ? 'No existing routes found' : 'Select a route to add consignments to'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}
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
            disabled={
              !newSchedule.vehicleId || 
              newSchedule.jobs.length === 0 ||
              (routeSelectionMode === 'new' && !newRouteName.trim()) ||
              (routeSelectionMode === 'existing' && !newSchedule.routePlanId)
            }
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
                                label={getPriorityDisplayLabel(jobDetails.priority, (jobDetails as any).originalPriority)}
                                color={jobDetails.priority === 'urgent' ? 'error' : 
                                       jobDetails.priority === 'high' ? 'warning' : 
                                       jobDetails.priority === 'medium' ? 'info' : 'default'}
                                size="small"
                              />
                            </Box>
                            {/* Time Sensitive and Priority */}
                            {jobDetails.timeSensitive !== undefined && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Time Sensitive
                                </Typography>
                                <Chip
                                  label={jobDetails.timeSensitive ? 'YES' : 'NO'}
                                  color={jobDetails.timeSensitive ? 'warning' : 'default'}
                                  size="small"
                                />
                              </Box>
                            )}
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
                                {[
                                  jobDetails.pickupLocation.address.town || jobDetails.pickupLocation.address.city,
                                  jobDetails.pickupLocation.address.postcode,
                                ].filter(Boolean).join(', ')}
                              </Typography>
                              {jobDetails.pickupLocation.contactPerson && (
                                <Typography variant="body2" color="text.secondary">
                                  Contact: {jobDetails.pickupLocation.contactPerson}
                                  {jobDetails.pickupLocation.contactPhone && ` (${jobDetails.pickupLocation.contactPhone})`}
                                  {jobDetails.pickupLocation.contactEmail && ` - ${jobDetails.pickupLocation.contactEmail}`}
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
                                {[
                                  jobDetails.deliveryLocation.address.town || jobDetails.deliveryLocation.address.city,
                                  jobDetails.deliveryLocation.address.postcode,
                                ].filter(Boolean).join(', ')}
                              </Typography>
                              {jobDetails.deliveryLocation.contactPerson && (
                                <Typography variant="body2" color="text.secondary">
                                  Contact: {jobDetails.deliveryLocation.contactPerson}
                                  {jobDetails.deliveryLocation.contactPhone && ` (${jobDetails.deliveryLocation.contactPhone})`}
                                  {jobDetails.deliveryLocation.contactEmail && ` - ${jobDetails.deliveryLocation.contactEmail}`}
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
                            {/* Pallet Items (one line each) */}
                            {Array.isArray((jobDetails as any).palletItems) && (jobDetails as any).palletItems.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Pallet Items
                                </Typography>
                                <Box>
                                  {((jobDetails as any).palletItems as any[]).map((item: any) => (
                                    <Typography key={item.id} variant="body2" sx={{ display: 'block', mb: 0.5 }}>
                                      {item.palletType} × {item.quantity} | {item.totalWeight}kg | {item.totalVolume?.toFixed ? item.totalVolume.toFixed(2) : item.totalVolume} m³ | Handling: {item.forkLift ? 'Fork-Lift' : item.tailLift ? 'Tail-Lift' : item.handBall ? 'Hand-Ball' : 'None'}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {/* Equipment Requirements */}
                            {(jobDetails.equipmentRequirements || 
                              (Array.isArray((jobDetails as any).palletItems) && (jobDetails as any).palletItems.length > 0)) && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Equipment Requirements
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {jobDetails.equipmentRequirements?.tailLift && (
                                    <Chip label="Tail-Lift" size="small" color="primary" />
                                  )}
                                  {jobDetails.equipmentRequirements?.forkLift && (
                                    <Chip label="Fork-Lift" size="small" color="primary" />
                                  )}
                                  {jobDetails.equipmentRequirements?.handBall && (
                                    <Chip label="Hand-Ball" size="small" color="primary" />
                                  )}
                                  {/* Show equipment from pallet items if no job-level equipment */}
                                  {!jobDetails.equipmentRequirements && Array.isArray((jobDetails as any).palletItems) && (
                                    <>
                                      {((jobDetails as any).palletItems as any[]).some((item: any) => item.tailLift) && (
                                        <Chip label="Tail-Lift (via pallets)" size="small" color="primary" variant="outlined" />
                                      )}
                                      {((jobDetails as any).palletItems as any[]).some((item: any) => item.forkLift) && (
                                        <Chip label="Fork-Lift (via pallets)" size="small" color="primary" variant="outlined" />
                                      )}
                                      {((jobDetails as any).palletItems as any[]).some((item: any) => item.handBall) && (
                                        <Chip label="Hand-Ball (via pallets)" size="small" color="primary" variant="outlined" />
                                      )}
                                    </>
                                  )}
                                </Box>
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
                    label={getPriorityDisplayLabel(selectedJobForDetails.priority, selectedJobForDetails.originalPriority)}
                    size="small"
                    color={selectedJobForDetails.priority === 'high' || selectedJobForDetails.priority === 'urgent' ? 'error' : selectedJobForDetails.priority === 'medium' ? 'warning' : 'success'}
                  />
                </Box>
                {/* Time Sensitive Information */}
                {(selectedJobForDetails.timeSensitive !== undefined || selectedJobForDetails.priority) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Time Sensitive
                    </Typography>
                    <Chip
                      label={selectedJobForDetails.timeSensitive ? 'YES' : 'NO'}
                      size="small"
                      color={selectedJobForDetails.timeSensitive ? 'warning' : 'default'}
                    />
                    {selectedJobForDetails.timeSensitive && selectedJobForDetails.priority && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                        Priority: {getPriorityDisplayLabel(selectedJobForDetails.priority, selectedJobForDetails.originalPriority)}
                      </Typography>
                    )}
                  </Box>
                )}
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
                {selectedJobForDetails.scheduledDate && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedJobForDetails.scheduledDate}
                    </Typography>
                  </Box>
                )}
                {selectedJobForDetails.scheduledTime && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedJobForDetails.scheduledTime}
                    </Typography>
                  </Box>
                )}
                {selectedJobForDetails.estimatedDuration && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Duration
                    </Typography>
                    <Typography variant="body1">
                      {selectedJobForDetails.estimatedDuration} minutes
                    </Typography>
                  </Box>
                )}
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
                  <Typography variant="body1" fontWeight="bold">
                    {selectedJobForDetails.customerName || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.pickupLocation?.contactPerson || selectedJobForDetails.deliveryLocation?.contactPerson || selectedJobForDetails.customerName || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerPhone || selectedJobForDetails.pickupLocation?.contactPhone || selectedJobForDetails.deliveryLocation?.contactPhone || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedJobForDetails.customerEmail || selectedJobForDetails.pickupLocation?.contactEmail || selectedJobForDetails.deliveryLocation?.contactEmail || 'N/A'}
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
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {(() => {
                      const addr = selectedJobForDetails.pickupLocation?.address || selectedJobForDetails.pickupLocation || {};
                      return [
                        addr.line1,
                        addr.line2,
                        addr.line3,
                        addr.town || addr.city,
                        addr.postcode,
                      ].filter(Boolean).join(', ') || 'N/A';
                    })()}
                  </Typography>
                  {(selectedJobForDetails.pickupLocation?.contactPerson || selectedJobForDetails.pickupLocation?.contactPhone || selectedJobForDetails.pickupLocation?.contactEmail) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Contact:</strong> {
                        [
                          selectedJobForDetails.pickupLocation?.contactPerson,
                          selectedJobForDetails.pickupLocation?.contactPhone && `(${selectedJobForDetails.pickupLocation.contactPhone})`,
                          selectedJobForDetails.pickupLocation?.contactEmail && `- ${selectedJobForDetails.pickupLocation.contactEmail}`
                        ].filter(Boolean).join(' ')
                      }
                    </Typography>
                  )}
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
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {(() => {
                      const addr = selectedJobForDetails.deliveryLocation?.address || selectedJobForDetails.deliveryLocation || {};
                      return [
                        addr.line1,
                        addr.line2,
                        addr.line3,
                        addr.town || addr.city,
                        addr.postcode,
                      ].filter(Boolean).join(', ') || 'N/A';
                    })()}
                  </Typography>
                  {(selectedJobForDetails.deliveryLocation?.contactPerson || selectedJobForDetails.deliveryLocation?.contactPhone || selectedJobForDetails.deliveryLocation?.contactEmail) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Contact:</strong> {
                        [
                          selectedJobForDetails.deliveryLocation?.contactPerson,
                          selectedJobForDetails.deliveryLocation?.contactPhone && `(${selectedJobForDetails.deliveryLocation.contactPhone})`,
                          selectedJobForDetails.deliveryLocation?.contactEmail && `- ${selectedJobForDetails.deliveryLocation.contactEmail}`
                        ].filter(Boolean).join(' ')
                      }
                    </Typography>
                  )}
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

                {/* Pallet Items - Detailed Breakdown */}
                {Array.isArray((selectedJobForDetails as any).palletItems) && (selectedJobForDetails as any).palletItems.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pallet Items
                    </Typography>
                    {((selectedJobForDetails as any).palletItems as any[]).map((item: any, index: number) => {
                      // Format dimensions for display
                      const dims = item.length && item.width && item.height
                        ? `${Math.round(item.length * 10)}x${Math.round(item.width * 10)}x${Math.round(item.height * 10)}mm`
                        : '';
                      const description = dims 
                        ? `${item.palletType} (${dims}, ${item.weight}kg) × ${item.quantity}`
                        : `${item.palletType} × ${item.quantity}`;
                      const handling = item.forkLift ? 'Fork-Lift' : item.tailLift ? 'Tail-Lift' : item.handBall ? 'Hand-Ball' : 'None';
                      const cost = item.totalCost || (item.cost || 0) * (item.quantity || 1);
                      
                      return (
                        <Box 
                          key={item.id || index} 
                          sx={{ 
                            mb: 2, 
                            p: 2, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1, 
                            border: '1px solid', 
                            borderColor: 'divider' 
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Item {index + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Description:</strong> {description}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Handling:</strong> {handling}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2">
                              <strong>Cost:</strong> £{cost.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Weight:</strong> {item.totalWeight || (item.weight || 0) * (item.quantity || 1)}kg
                            </Typography>
                            {item.totalVolume && (
                              <Typography variant="body2">
                                <strong>Volume:</strong> {typeof item.totalVolume === 'number' ? item.totalVolume.toFixed(2) : item.totalVolume} m³
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                    
                    {/* Totals */}
                    {(() => {
                      const palletItems = (selectedJobForDetails as any).palletItems || [];
                      const totalCost = palletItems.reduce((sum: number, item: any) => 
                        sum + (item.totalCost || (item.cost || 0) * (item.quantity || 1)), 0);
                      const totalWeight = palletItems.reduce((sum: number, item: any) => 
                        sum + (item.totalWeight || (item.weight || 0) * (item.quantity || 1)), 0);
                      
                      return (
                        <Box sx={{ 
                          mt: 2, 
                          p: 2, 
                          bgcolor: 'primary.light', 
                          borderRadius: 1,
                          border: '2px solid',
                          borderColor: 'primary.main'
                        }}>
                          <Typography variant="body1" fontWeight="bold" gutterBottom>
                            TOTAL
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="primary.dark">
                            £{totalCost.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Total Weight:</strong> {totalWeight}kg
                          </Typography>
                        </Box>
                      );
                    })()}
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
                  {selectedJobForDetails.timeSensitive && (
                    <Chip label={`Time Sensitive: ${getPriorityDisplayLabel(selectedJobForDetails.priority, selectedJobForDetails.originalPriority)}`} color="info" size="small" />
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
            <JobAllocationForm 
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