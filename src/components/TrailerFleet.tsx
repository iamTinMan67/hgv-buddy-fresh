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
  LocalShipping,
  CheckCircle,
  Warning,
  Home,
  Circle,
  Build,
  Error,
  Speed,
  Assignment,
  Person,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { updateVehicle, addVehicle } from '../store/slices/vehicleSlice';
import { VehicleService } from '../services/api';
import { trailerIdGenerator } from '../utils/trailerIdGenerator';

interface TrailerFleetProps {
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
      id={`trailer-tabpanel-${index}`}
      aria-labelledby={`trailer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TrailerFleet: React.FC<TrailerFleetProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  
  // Form state for vehicle editing
  const [editForm, setEditForm] = useState({
    trailerId: '',
    trailerName: '',
    registration: '',
    year: new Date().getFullYear(),
    type: 'HGV' as 'HGV' | 'Articulated' | 'Van' | 'Rigid',
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
      console.log('Saving vehicle with dimensions:', {
        lengthM: editForm.lengthM,
        widthM: editForm.widthM,
        heightM: editForm.heightM,
      });
      
      // Parse existing notes for cubage metadata
      let cubageMetadata = {};
      if (selectedVehicle.notes) {
        try {
          const metadataMatch = selectedVehicle.notes.match(/CUBAGE_METADATA:(.+?)(?:\s*\||$)/);
          if (metadataMatch) {
            cubageMetadata = JSON.parse(metadataMatch[1]);
            console.log('Existing cubage metadata:', cubageMetadata);
          }
        } catch (e) {
          console.error('Error parsing cubage metadata:', e);
        }
      }
      
      // Update cubage metadata (convert meters to cm for storage)
      // Only update if dimensions are provided (greater than 0)
      const updatedMetadata = {
        ...cubageMetadata,
      };
      
      if (editForm.lengthM > 0) {
        updatedMetadata.length = editForm.lengthM * 100; // Convert meters to cm
      }
      if (editForm.widthM > 0) {
        updatedMetadata.width = editForm.widthM * 100;
      }
      if (editForm.heightM > 0) {
        updatedMetadata.height = editForm.heightM * 100;
      }
      
      console.log('Updated cubage metadata:', updatedMetadata);
      
      // Combine notes with cubage metadata
      const existingNotes = editForm.notes.replace(/CUBAGE_METADATA:.+?(?:\s*\||$)/, '').trim();
      const metadataJson = JSON.stringify(updatedMetadata);
      const combinedNotes = existingNotes
        ? `${existingNotes} | CUBAGE_METADATA:${metadataJson}`
        : `CUBAGE_METADATA:${metadataJson}`;
      
      console.log('Combined notes to save:', combinedNotes);
      
      const updatedVehicle = {
        ...selectedVehicle,
        trailerId: editForm.trailerId,
        trailerName: editForm.trailerName,
        make: editForm.trailerId, // Store trailerId in make field (for backward compatibility)
        model: editForm.trailerName, // Store trailerName in model field (for backward compatibility)
        registration: editForm.registration,
        year: editForm.year,
        type: editForm.type,
        status: editForm.status,
        capacity: editForm.capacity,
        location: editForm.location,
        notes: combinedNotes,
        lastInspection: editForm.lastInspection || selectedVehicle.lastInspection,
        nextMOT: editForm.nextMOT || selectedVehicle.nextMOT,
        nextService: editForm.nextService || selectedVehicle.nextService,
        updatedAt: new Date().toISOString(),
      };
      
      // Update in database
      // Note: The TypeScript types may not include all fields, so we use 'as any' to include notes and location
      const updatePayload: any = {
        registration: editForm.registration,
        make: editForm.trailerId, // Store trailerId in make field (for backward compatibility)
        model: editForm.trailerName, // Store trailerName in model field (for backward compatibility)
        year: editForm.year,
        type: editForm.type.toLowerCase(),
        capacity: editForm.capacity,
        status: editForm.status.toLowerCase().replace(/\s+/g, '_'),
      };
      
      // Add notes and location if they exist in the database schema
      // These fields may not be in the TypeScript types but should be in the actual database
      if (combinedNotes) {
        updatePayload.notes = combinedNotes;
      }
      if (editForm.location) {
        updatePayload.location = editForm.location;
      }
      
      console.log('Updating vehicle in database with payload:', updatePayload);
      console.log('Vehicle ID:', selectedVehicle.id);
      
      const dbResponse = await VehicleService.updateVehicle(selectedVehicle.id, updatePayload as any);
      
      console.log('Database response:', dbResponse);
      console.log('Response data:', dbResponse.data);
      console.log('Response error:', dbResponse.error);
      console.log('Response success:', dbResponse.success);
      
      if (dbResponse.error) {
        console.error('Database update error:', dbResponse.error);
        const errorMsg = typeof dbResponse.error === 'string' ? dbResponse.error : JSON.stringify(dbResponse.error);
        throw new Error(errorMsg);
      }
      
      if (!dbResponse.success) {
        console.error('Database update failed:', dbResponse);
        const errorMsg = typeof dbResponse.error === 'string' ? dbResponse.error : 'Update failed';
        throw new Error(errorMsg);
      }
      
      // Verify the data was saved by checking the response
      if (dbResponse.data) {
        console.log('Update successful, response data:', dbResponse.data);
        // Check if notes were saved
        if (dbResponse.data.notes) {
          console.log('Notes field saved:', dbResponse.data.notes);
        } else {
          console.warn('Notes field not returned in response. It may not exist in the database schema.');
        }
      }
      
      console.log('Database update successful:', dbResponse);
      
      // Update Redux store
      dispatch(updateVehicle(updatedVehicle));
      
      console.log('Redux store updated');
      
      setShowVehicleDialog(false);
      alert('Trailer dimensions saved successfully!');
    } catch (error: any) {
      console.error('Failed to update vehicle:', error);
      
      // Extract error message safely
      let errorMessage = 'Unknown error occurred';
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error) {
          errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
        } else {
          errorMessage = 'Failed to update vehicle. Check console for details.';
        }
      }
      
      alert(`Failed to update vehicle: ${errorMessage}`);
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      setShowReportDialog(false);
    }
  };

  // Auto-generate Trailer ID when add dialog opens
  useEffect(() => {
    const generateTrailerId = async () => {
      if (showAddVehicleDialog) {
        try {
          const newTrailerId = await trailerIdGenerator.generateTrailerId();
          setEditForm(prev => {
            // Only set if not already set
            if (!prev.trailerId) {
              return { ...prev, trailerId: newTrailerId };
            }
            return prev;
          });
        } catch (error) {
          console.error('Error generating Trailer ID:', error);
          // Fallback to a timestamp-based ID if generation fails
          const currentYear = new Date().getFullYear();
          const fallbackId = `TRL-${currentYear}-${Date.now().toString().slice(-3)}`;
          setEditForm(prev => {
            if (!prev.trailerId) {
              return { ...prev, trailerId: fallbackId };
            }
            return prev;
          });
        }
      }
    };
    
    generateTrailerId();
  }, [showAddVehicleDialog]);

  const handleAddVehicle = async () => {
    try {
      // Generate trailer ID if not already set
      let trailerId = editForm.trailerId;
      if (!trailerId) {
        trailerId = await trailerIdGenerator.generateTrailerId();
      }
      
      // Create cubage metadata (convert meters to cm for storage)
      const cubageMetadata = {
        length: editForm.lengthM * 100, // Convert meters to cm
        width: editForm.widthM * 100,
        height: editForm.heightM * 100,
      };
      
      // Combine notes with cubage metadata
      const metadataJson = JSON.stringify(cubageMetadata);
      const combinedNotes = editForm.notes
        ? `${editForm.notes} | CUBAGE_METADATA:${metadataJson}`
        : `CUBAGE_METADATA:${metadataJson}`;
      
      const newVehicle = {
        registration: editForm.registration,
        make: trailerId, // Store trailerId in make field (for backward compatibility)
        model: editForm.trailerName, // Store trailerName in model field (for backward compatibility)
        year: editForm.year,
        type: editForm.type.toLowerCase(),
        capacity: editForm.capacity,
        status: editForm.status.toLowerCase().replace(/\s+/g, '_'),
        notes: combinedNotes,
        location: editForm.location,
      };
      
      // Create in database
      const response = await VehicleService.createVehicle(newVehicle as any);
      
      if (response.data) {
        // Add to Redux store
        const vehicleWithId = {
          ...response.data,
          id: response.data.id,
          trailerId, // Store new trailerId field
          trailerName: editForm.trailerName, // Store new trailerName field
          fleetNumber: `FLEET-${response.data.id.substring(0, 8).toUpperCase()}`,
          type: editForm.type,
          status: editForm.status,
          lastInspection: editForm.lastInspection || '',
          nextMOT: editForm.nextMOT || '',
          nextService: editForm.nextService || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        dispatch(addVehicle(vehicleWithId as any));
        
        // Reset form
        setEditForm({
          trailerId: '',
          trailerName: '',
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
        });
        
        setShowAddVehicleDialog(false);
      }
    } catch (error) {
      console.error('Failed to add trailer:', error);
      alert('Failed to add trailer. Please try again.');
    }
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

  const openVehicleDialog = (vehicle: any) => {
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
    
    // Map from old make/model to new trailerId/trailerName
    // If vehicle has make/model (old format), use make as trailerName and generate/use trailerId
    // If vehicle has trailerId/trailerName (new format), use those
    const trailerId = vehicle.trailerId || vehicle.make || '';
    const trailerName = vehicle.trailerName || vehicle.model || (vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : '');
    
    setEditForm({
      trailerId,
      trailerName,
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
              color: '#FFD700',
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="Trailer Overview" />
          <Tab label="Defect Reports" />
          <Tab label="Maintenance Schedule" />
          <Tab label="Trailer Assignment" />
        </Tabs>
      </Box>

      {/* Trailer Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Trailer Fleet</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddVehicleDialog(true)}
          >
            Add Trailer
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trailer</TableCell>
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
                          {vehicle.trailerName || vehicle.model || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unnamed Trailer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.trailerId || vehicle.make || 'No ID'} • {vehicle.year}
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
                    <Tooltip title="Edit Trailer">
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
                <TableCell>Trailer</TableCell>
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
            <strong>Maintenance Schedule:</strong> Track scheduled maintenance, MOT tests, and service intervals for all trailers.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{vehicle.trailerName || vehicle.model || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unnamed Trailer'}</Typography>
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

      {/* Trailer Assignment Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Trailer Assignment Management</Typography>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => {/* Add assignment handler */}}
          >
            Assign Trailer
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Trailer Assignment:</strong> Manage trailer allocations, track current usage, and view assignment history.
          </Typography>
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trailer</TableCell>
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
                          {vehicle.trailerName || vehicle.model || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unnamed Trailer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.trailerId || vehicle.make || 'No ID'} • {vehicle.year}
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
                        onClick={() => {/* Change assignment */}}
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
                  Assigned Trailers
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
                  Available Trailers
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
                  Total Trailers
                </Typography>
                <Typography variant="h4">
                  {vehicles.length}
                </Typography>
                <Typography variant="body2">
                  All trailers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Trailer Dialog */}
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
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>Add New Trailer</DialogTitle>
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
                label="Trailer ID"
                value={editForm.trailerId}
                disabled
                helperText="Auto-generated unique identifier"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trailer Name"
                value={editForm.trailerName}
                onChange={(e) => setEditForm({ ...editForm, trailerName: e.target.value })}
                required
                placeholder="e.g., Mercedes-Benz Actros"
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
                helperText="General notes about the trailer (cubage dimensions are stored automatically)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddVehicleDialog(false);
            setEditForm({
              trailerId: '',
              trailerName: '',
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
            });
          }}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained" disabled={!editForm.trailerName || !editForm.registration || !editForm.trailerId}>Add Trailer</Button>
        </DialogActions>
      </Dialog>

      {/* Trailer Details Dialog */}
      {selectedVehicle && (
        <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Trailer: {selectedVehicle.trailerName || selectedVehicle.model || `${selectedVehicle.make || ''} ${selectedVehicle.model || ''}`.trim()}</DialogTitle>
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
                  label="Trailer ID"
                  value={editForm.trailerId}
                  disabled
                  helperText="Auto-generated unique identifier"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trailer Name"
                  value={editForm.trailerName}
                  onChange={(e) => setEditForm({ ...editForm, trailerName: e.target.value })}
                  required
                  placeholder="e.g., Mercedes-Benz Actros"
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
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Rigid">Rigid</MenuItem>
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

export default TrailerFleet;


