import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  DirectionsCar,
  CheckCircle,
  Warning,
  LocalShipping,
  Home,
  Circle,
  Build,
  Error,
  Speed,
  Assignment,
  Person,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { updateVehicle, addVehicle, updateVehicleStatus } from '../store/slices/vehicleSlice';
import { VehicleService, DriverService } from '../services/api';


interface FleetManagementProps {
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
      id={`fleet-tabpanel-${index}`}
      aria-labelledby={`fleet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FleetManagement: React.FC<FleetManagementProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [showAssignDriverDialog, setShowAssignDriverDialog] = useState(false);
  const [selectedVehicleForAssignment, setSelectedVehicleForAssignment] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [assignDriverForm, setAssignDriverForm] = useState({
    driverId: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Load active drivers when assignment dialog or vehicle edit dialog opens
  useEffect(() => {
    const loadDrivers = async () => {
      setLoadingDrivers(true);
      try {
        // Load active drivers from staff_members table
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('staff_members')
          .select('id, first_name, family_name, email, is_active')
          .eq('role', 'driver')
          .eq('is_active', true)
          .order('first_name', { ascending: true });
        
        if (error) {
          console.error('Failed to load drivers:', error);
          return;
        }
        
        const mapped = (data || []).map((d: any) => ({
          id: d.id,
          first_name: d.first_name,
          last_name: d.family_name,
          name: `${d.first_name} ${d.family_name}`.trim(),
          email: d.email
        }));
        
        setDrivers(mapped);
      } catch (error) {
        console.error('Failed to load drivers:', error);
      } finally {
        setLoadingDrivers(false);
      }
    };
    
    if (showAssignDriverDialog || showVehicleDialog) {
      loadDrivers();
    }
  }, [showAssignDriverDialog, showVehicleDialog]);

  // Load trailers when vehicle edit dialog opens
  useEffect(() => {
    const loadTrailers = async () => {
      setLoadingTrailers(true);
      try {
        // Load trailers from vehicles (filter by type or identify trailers)
        // Trailers can be identified by type or by checking if they're in TrailerFleet
        const availableTrailers = vehicles.filter(v => {
          // Filter for trailers - could be type 'trailer' or vehicles that appear in trailer fleet
          // For now, we'll filter by checking if they have a trailer name or are available
          return v.status === 'Available' && (
            v.type === 'trailer' || 
            (v.trailerName || v.model) // Has trailer name or model (for backward compatibility)
          );
        });
        
        const mapped = availableTrailers.map((v: any) => ({
          id: v.id,
          name: v.trailerName || v.model || `${v.make || ''} ${v.model || ''}`.trim() || 'Unnamed Trailer',
          registration: v.registration,
          trailerId: v.trailerId || v.make || '',
        }));
        
        setTrailers(mapped);
      } catch (error) {
        console.error('Failed to load trailers:', error);
      } finally {
        setLoadingTrailers(false);
      }
    };
    
    if (showVehicleDialog) {
      loadTrailers();
    }
  }, [showVehicleDialog, vehicles]);
  
  // Form state for vehicle editing
  const [editForm, setEditForm] = useState({
    make: '',
    model: '',
    registration: '',
    year: new Date().getFullYear(),
    type: 'HGV' as 'HGV' | 'Articulated' | 'PCV' | 'PSV' | 'Van' | 'Car',
    status: 'Available' as any,
    capacity: 0, // in tons
    location: '',
    notes: '',
    // Cubage dimensions in meters (stored in notes as JSON, converted to cm for storage)
    lengthM: 0,
    widthM: 0,
    heightM: 0,
    lastInspection: '',
    nextMOT: '',
    nextService: '',
    currentDriverId: '', // Driver ID for the dropdown
    permanentTrailerId: '', // Permanent trailer ID for the dropdown
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Service':
      case 'MOT':
      case 'Repair':
        return 'warning';
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return 'error';
      case 'Reserved':
      case 'Training':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <CheckCircle />;
      case 'Service':
      case 'MOT':
      case 'Repair':
        return <Build />;
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return <Error />;
      case 'Reserved':
      case 'Training':
        return <Speed />;
      default:
        return <Circle />;
    }
  };

  const handleVehicleStatusUpdate = async () => {
    if (!selectedVehicle) return;
    
    try {
      // Parse existing notes for cubage metadata
      let cubageMetadata = {};
      if (selectedVehicle.notes) {
        try {
          const metadataMatch = selectedVehicle.notes.match(/CUBAGE_METADATA:(.+?)(?:\s*\||$)/);
          if (metadataMatch) {
            cubageMetadata = JSON.parse(metadataMatch[1]);
          }
        } catch (e) {
          console.error('Error parsing cubage metadata:', e);
        }
      }
      
      // Update cubage metadata (convert meters to cm for storage)
      const updatedMetadata = {
        ...cubageMetadata,
        length: editForm.lengthM * 100, // Convert meters to cm
        width: editForm.widthM * 100,
        height: editForm.heightM * 100,
      };
      
      // Combine notes with cubage metadata
      const existingNotes = editForm.notes.replace(/CUBAGE_METADATA:.+?(?:\s*\||$)/, '').trim();
      const metadataJson = JSON.stringify(updatedMetadata);
      const combinedNotes = existingNotes
        ? `${existingNotes} | CUBAGE_METADATA:${metadataJson}`
        : `CUBAGE_METADATA:${metadataJson}`;
      
      // Get driver name from selected driver ID
      let currentDriverName = '';
      if (editForm.currentDriverId) {
        const selectedDriver = drivers.find(d => d.id === editForm.currentDriverId);
        if (selectedDriver) {
          currentDriverName = selectedDriver.name;
        }
      }
      
      const updatedVehicle = {
        ...selectedVehicle,
        make: editForm.make,
        model: editForm.model,
        registration: editForm.registration,
        year: editForm.year,
        type: editForm.type,
        status: editForm.status,
        capacity: editForm.capacity,
        location: editForm.location,
        notes: combinedNotes,
        currentDriver: currentDriverName,
        permanent_trailer_id: editForm.permanentTrailerId || null,
        lastInspection: editForm.lastInspection || selectedVehicle.lastInspection,
        nextMOT: editForm.nextMOT || selectedVehicle.nextMOT,
        nextService: editForm.nextService || selectedVehicle.nextService,
        updatedAt: new Date().toISOString(),
      };
      
      // Update in database
      const updatePayload: any = {
        registration: editForm.registration,
        make: editForm.make,
        model: editForm.model,
        year: editForm.year,
        type: editForm.type.toLowerCase(),
        capacity: editForm.capacity,
        status: editForm.status.toLowerCase().replace(/\s+/g, '_'),
        notes: combinedNotes,
        location: editForm.location,
      };
      
      // Add permanent_trailer_id if set
      if (editForm.permanentTrailerId) {
        updatePayload.permanent_trailer_id = editForm.permanentTrailerId;
      } else {
        updatePayload.permanent_trailer_id = null;
      }
      
      await VehicleService.updateVehicle(selectedVehicle.id, updatePayload);
      
      // Update Redux store
      dispatch(updateVehicle(updatedVehicle));
      
      setShowVehicleDialog(false);
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      setShowReportDialog(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(false);
  };

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const openVehicleDialog = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    
    // Parse cubage metadata from notes if available (convert cm to meters for display)
    let lengthM = 0, widthM = 0, heightM = 0;
    if (vehicle.notes) {
      try {
        const metadataMatch = vehicle.notes.match(/CUBAGE_METADATA:(.+?)(?:\s*\||$)/);
        if (metadataMatch) {
          const metadata = JSON.parse(metadataMatch[1]);
          lengthM = (metadata.length || 0) / 100; // Convert cm to meters
          widthM = (metadata.width || 0) / 100;
          heightM = (metadata.height || 0) / 100;
        }
      } catch (e) {
        console.error('Error parsing cubage metadata:', e);
      }
    }
    
    // Extract clean notes (without metadata)
    const cleanNotes = vehicle.notes ? vehicle.notes.replace(/CUBAGE_METADATA:.+?(?:\s*\||$)/, '').trim() : '';
    
    // Find current driver ID from driver name if exists
    let currentDriverId = '';
    if (vehicle.currentDriver) {
      // Load drivers to find matching ID
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('staff_members')
        .select('id, first_name, family_name')
        .eq('role', 'driver')
        .eq('is_active', true);
      
      if (data) {
        const matchingDriver = data.find((d: any) => 
          `${d.first_name} ${d.family_name}`.trim() === vehicle.currentDriver
        );
        if (matchingDriver) {
          currentDriverId = matchingDriver.id;
        }
      }
    }
    
    setEditForm({
      make: vehicle.make || '',
      model: vehicle.model || '',
      registration: vehicle.registration || '',
      year: vehicle.year || new Date().getFullYear(),
      type: vehicle.type || 'HGV',
      status: vehicle.status || 'Available',
      capacity: vehicle.capacity || 0,
      location: vehicle.location || '',
      notes: cleanNotes,
      lengthM,
      widthM,
      heightM,
      lastInspection: formatDateForInput(vehicle.lastInspection),
      nextMOT: formatDateForInput(vehicle.nextMOT),
      nextService: formatDateForInput(vehicle.nextService),
      currentDriverId,
      permanentTrailerId: vehicle.permanent_trailer_id || '',
    });
    setShowVehicleDialog(true);
  };

  const openReportDialog = (report: any) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  return (
    <Box>
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
          <Tab label="Fleet Overview" />
          <Tab label="Defect Reports" />
          <Tab label="Maintenance Schedule" />
          <Tab label="Vehicle Assignment" />
        </Tabs>
      </Box>

      {/* Fleet Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Vehicle Fleet</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddVehicleDialog(true)}
          >
            Add Vehicle
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Last Service</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.year}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vehicle.currentDriver || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Vehicle">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Defect Reports Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Defect Reports</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Add defect report handler */}}
          >
            Add Defect Report
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Defect Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defectReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.vehicleFleetNumber}</TableCell>
                  <TableCell>{report.driverName}</TableCell>
                  <TableCell>{report.defects.reported}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      color={getPriorityColor(report.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'resolved' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.dateTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Maintenance Schedule Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Maintenance Schedule
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Maintenance Schedule:</strong> Track scheduled maintenance, MOT tests, and service intervals for all vehicles.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{vehicle.make} {vehicle.model}</Typography>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registration: {vehicle.registration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Service: {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Service: {vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : 'Not scheduled'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Vehicle Assignment Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Vehicle Assignment Management</Typography>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => {
              setSelectedVehicleForAssignment(null);
              setAssignDriverForm({
                driverId: '',
                assignmentDate: new Date().toISOString().split('T')[0],
                notes: '',
              });
              setShowAssignDriverDialog(true);
            }}
          >
            Assign Vehicle
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Vehicle Assignment:</strong> Manage driver-vehicle assignments, track current allocations, and view assignment history.
          </Typography>
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Assignment Date</TableCell>
                <TableCell>Assignment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.year}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    {vehicle.currentDriver ? (
                      <Chip
                        icon={<Person />}
                        label={vehicle.currentDriver}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Warning />}
                        label="Unassigned"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={vehicle.currentDriver ? <CheckCircle /> : <Circle />}
                      label={vehicle.currentDriver ? 'Assigned' : 'Available'}
                      color={vehicle.currentDriver ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Assignment Details">
                      <IconButton
                        size="small"
                        onClick={() => {/* View assignment details */}}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change Assignment">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedVehicleForAssignment(vehicle);
                          setAssignDriverForm({
                            driverId: '',
                            assignmentDate: new Date().toISOString().split('T')[0],
                            notes: '',
                          });
                          setShowAssignDriverDialog(true);
                        }}
                      >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Assignment Summary Cards */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assigned Vehicles
                </Typography>
                <Typography variant="h4">
                  {vehicles.filter(v => v.currentDriver).length}
                </Typography>
                <Typography variant="body2">
                  Currently in use
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Vehicles
                </Typography>
                <Typography variant="h4">
                  {vehicles.filter(v => !v.currentDriver).length}
                </Typography>
                <Typography variant="body2">
                  Ready for assignment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Fleet
                </Typography>
                <Typography variant="h4">
                  {vehicles.length}
                </Typography>
                <Typography variant="body2">
                  All vehicles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onClose={() => {
        setShowAddVehicleDialog(false);
        // Reset form when closing
        setEditForm({
          make: '',
          model: '',
          registration: '',
          year: new Date().getFullYear(),
          type: 'HGV',
          status: 'Available',
          capacity: 0,
          location: '',
          notes: '',
          lengthM: 0,
          widthM: 0,
          heightM: 0,
          lastInspection: '',
          nextMOT: '',
          nextService: '',
          currentDriverId: '',
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Make"
                value={editForm.make}
                onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration"
                value={editForm.registration}
                onChange={(e) => setEditForm({ ...editForm, registration: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editForm.type}
                  label="Type"
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                >
                  <MenuItem value="HGV">HGV</MenuItem>
                  <MenuItem value="Articulated">Articulated</MenuItem>
                  <MenuItem value="PCV">PCV</MenuItem>
                  <MenuItem value="PSV">PSV</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="V.O.R">V.O.R</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="MOT">MOT</MenuItem>
                  <MenuItem value="Repair">Repair</MenuItem>
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Off Road">Off Road</MenuItem>
                  <MenuItem value="Reserved">Reserved</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                  <MenuItem value="Breakdown">Breakdown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Capacity and Cubage */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Capacity & Cubage Dimensions
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity (tons)"
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cubage Dimensions (for trailer planning)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Length (m)"
                type="number"
                value={editForm.lengthM}
                onChange={(e) => setEditForm({ ...editForm, lengthM: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 0.01, min: 0 }}
                helperText={`${(editForm.lengthM * 100).toFixed(0)}cm`}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Width (m)"
                type="number"
                value={editForm.widthM}
                onChange={(e) => setEditForm({ ...editForm, widthM: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 0.01, min: 0 }}
                helperText={`${(editForm.widthM * 100).toFixed(0)}cm`}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Height (m)"
                type="number"
                value={editForm.heightM}
                onChange={(e) => setEditForm({ ...editForm, heightM: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: 0.01, min: 0 }}
                helperText={`${(editForm.heightM * 100).toFixed(0)}cm`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Calculated Volume: {(editForm.lengthM * editForm.widthM * editForm.heightM).toFixed(2)} m³
              </Typography>
            </Grid>
            
            {/* Maintenance Schedule */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Maintenance Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Inspection"
                type="date"
                value={editForm.lastInspection}
                onChange={(e) => setEditForm({ ...editForm, lastInspection: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Next MOT"
                type="date"
                value={editForm.nextMOT}
                onChange={(e) => setEditForm({ ...editForm, nextMOT: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Next Service"
                type="date"
                value={editForm.nextService}
                onChange={(e) => setEditForm({ ...editForm, nextService: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                helperText="General notes about the vehicle (cubage dimensions are stored automatically)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddVehicleDialog(false);
            setEditForm({
              make: '',
              model: '',
              registration: '',
              year: new Date().getFullYear(),
              type: 'HGV',
              status: 'Available',
              capacity: 0,
              location: '',
              notes: '',
              lengthM: 0,
              widthM: 0,
              heightM: 0,
              lastInspection: '',
              nextMOT: '',
              nextService: '',
              currentDriverId: '',
            });
          }}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained" disabled={!editForm.make || !editForm.model || !editForm.registration}>Add Vehicle</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDriverDialog} onClose={() => {
        setShowAssignDriverDialog(false);
        setSelectedVehicleForAssignment(null);
        setAssignDriverForm({
          driverId: '',
          assignmentDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedVehicleForAssignment ? `Assign Driver to ${selectedVehicleForAssignment.make} ${selectedVehicleForAssignment.model}` : 'Assign Driver to Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {!selectedVehicleForAssignment && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    value=""
                    label="Vehicle"
                    onChange={(e) => {
                      const vehicle = vehicles.find(v => v.id === e.target.value);
                      setSelectedVehicleForAssignment(vehicle || null);
                    }}
                  >
                    {vehicles.filter(v => !v.currentDriver || v.id === selectedVehicleForAssignment?.id).map(vehicle => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} - {vehicle.registration}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={assignDriverForm.driverId}
                  label="Driver"
                  onChange={(e) => setAssignDriverForm({ ...assignDriverForm, driverId: e.target.value })}
                  disabled={loadingDrivers || !selectedVehicleForAssignment}
                >
                  {loadingDrivers ? (
                    <MenuItem disabled>Loading drivers...</MenuItem>
                  ) : drivers.length === 0 ? (
                    <MenuItem disabled>No drivers available</MenuItem>
                  ) : (
                    drivers.map(driver => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} {driver.employee_number ? `(${driver.employee_number})` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Date"
                type="date"
                value={assignDriverForm.assignmentDate}
                onChange={(e) => setAssignDriverForm({ ...assignDriverForm, assignmentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={assignDriverForm.notes}
                onChange={(e) => setAssignDriverForm({ ...assignDriverForm, notes: e.target.value })}
                placeholder="Optional notes about this assignment..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAssignDriverDialog(false);
            setSelectedVehicleForAssignment(null);
            setAssignDriverForm({
              driverId: '',
              assignmentDate: new Date().toISOString().split('T')[0],
              notes: '',
            });
          }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!assignDriverForm.driverId || !selectedVehicleForAssignment) {
                alert('Please select both a vehicle and a driver');
                return;
              }
              
              try {
                const selectedDriver = drivers.find(d => d.id === assignDriverForm.driverId);
                const driverName = selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.last_name}` : '';
                
                // Update vehicle in Redux store with currentDriver
                const updatedVehicle = {
                  ...selectedVehicleForAssignment,
                  currentDriver: driverName,
                  updatedAt: new Date().toISOString(),
                };
                
                dispatch(updateVehicle(updatedVehicle));
                
                // TODO: Create allocation record in driver_vehicle_allocations table
                // This would properly track the allocation with dates and notes
                // For now, we're just updating the vehicle's currentDriver field
                
                setShowAssignDriverDialog(false);
                setSelectedVehicleForAssignment(null);
                setAssignDriverForm({
                  driverId: '',
                  assignmentDate: new Date().toISOString().split('T')[0],
                  notes: '',
                });
                
                alert(`Driver ${driverName} successfully assigned to ${selectedVehicleForAssignment.make} ${selectedVehicleForAssignment.model}`);
              } catch (error) {
                console.error('Failed to assign driver:', error);
                alert('Failed to assign driver. Please try again.');
              }
            }}
            disabled={!assignDriverForm.driverId || !selectedVehicleForAssignment || loadingDrivers}
          >
            Assign Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Details Dialog */}
      {selectedVehicle && (
        <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Vehicle: {selectedVehicle.make} {selectedVehicle.model}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Make"
                  value={editForm.make}
                  onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={editForm.model}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration"
                  value={editForm.registration}
                  onChange={(e) => setEditForm({ ...editForm, registration: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editForm.type}
                    label="Type"
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                  >
                    <MenuItem value="HGV">HGV</MenuItem>
                    <MenuItem value="Articulated">Articulated</MenuItem>
                    <MenuItem value="PCV">PCV</MenuItem>
                    <MenuItem value="PSV">PSV</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Car">Car</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    label="Status"
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="V.O.R">V.O.R</MenuItem>
                    <MenuItem value="Service">Service</MenuItem>
                    <MenuItem value="MOT">MOT</MenuItem>
                    <MenuItem value="Repair">Repair</MenuItem>
                    <MenuItem value="Accident">Accident</MenuItem>
                    <MenuItem value="Off Road">Off Road</MenuItem>
                    <MenuItem value="Reserved">Reserved</MenuItem>
                    <MenuItem value="Training">Training</MenuItem>
                    <MenuItem value="Breakdown">Breakdown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Current Driver */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Current Driver</InputLabel>
                  <Select
                    value={editForm.currentDriverId}
                    label="Current Driver"
                    onChange={(e) => setEditForm({ ...editForm, currentDriverId: e.target.value })}
                    disabled={loadingDrivers}
                  >
                    <MenuItem value="">
                      <em>None (Unassigned)</em>
                    </MenuItem>
                    {loadingDrivers ? (
                      <MenuItem disabled>Loading drivers...</MenuItem>
                    ) : drivers.length === 0 ? (
                      <MenuItem disabled>No active drivers available</MenuItem>
                    ) : (
                      drivers.map((driver) => (
                        <MenuItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Permanent Trailer */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Permanent Trailer</InputLabel>
                  <Select
                    value={editForm.permanentTrailerId}
                    label="Permanent Trailer"
                    onChange={(e) => setEditForm({ ...editForm, permanentTrailerId: e.target.value })}
                    disabled={loadingTrailers}
                  >
                    <MenuItem value="">
                      <em>None (No Permanent Trailer)</em>
                    </MenuItem>
                    {loadingTrailers ? (
                      <MenuItem disabled>Loading trailers...</MenuItem>
                    ) : trailers.length === 0 ? (
                      <MenuItem disabled>No trailers available</MenuItem>
                    ) : (
                      trailers.map((trailer) => (
                        <MenuItem key={trailer.id} value={trailer.id}>
                          {trailer.name} {trailer.trailerId && `(${trailer.trailerId})`}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Capacity and Cubage */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Capacity & Cubage Dimensions
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacity (tons)"
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Cubage Dimensions (for trailer planning)
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Length (m)"
                  type="number"
                  value={editForm.lengthM}
                  onChange={(e) => setEditForm({ ...editForm, lengthM: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                  helperText={`${(editForm.lengthM * 100).toFixed(0)}cm`}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Width (m)"
                  type="number"
                  value={editForm.widthM}
                  onChange={(e) => setEditForm({ ...editForm, widthM: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                  helperText={`${(editForm.widthM * 100).toFixed(0)}cm`}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (m)"
                  type="number"
                  value={editForm.heightM}
                  onChange={(e) => setEditForm({ ...editForm, heightM: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                  helperText={`${(editForm.heightM * 100).toFixed(0)}cm`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Calculated Volume: {(editForm.lengthM * editForm.widthM * editForm.heightM).toFixed(2)} m³
                </Typography>
              </Grid>
              
              {/* Maintenance Schedule */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Maintenance Schedule
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Last Inspection"
                  type="date"
                  value={editForm.lastInspection}
                  onChange={(e) => setEditForm({ ...editForm, lastInspection: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Next MOT"
                  type="date"
                  value={editForm.nextMOT}
                  onChange={(e) => setEditForm({ ...editForm, nextMOT: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Next Service"
                  type="date"
                  value={editForm.nextService}
                  onChange={(e) => setEditForm({ ...editForm, nextService: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  helperText="General notes about the vehicle (cubage dimensions are stored automatically)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onClick={handleVehicleStatusUpdate} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Defect Report Dialog */}
      {selectedReport && (
        <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Defect Report Details</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Defect report details and status update form will be implemented here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={handleReportStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FleetManagement;
