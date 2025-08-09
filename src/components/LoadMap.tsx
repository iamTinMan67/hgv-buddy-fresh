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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  Switch,
  FormControlLabel,
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
  Save,
  Undo,
  Warning,
  Info,
  ArrowForward,
  ArrowBack,
  SwapHoriz,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  RoutePlan,
  JobAssignment as JobAssignmentType,
  JobStatus,
} from '../store/slices/jobSlice';

interface LoadMapProps {
  onClose: () => void;
}

interface DeliveryItem {
  id: string;
  jobId: string;
  jobTitle: string;
  customerName: string;
  deliverySequence: number;
  position: 'tail' | 'bulkhead' | 'middle';
  estimatedTime: string;
  actualTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  driverNotes?: string;
  isFlexible: boolean;
}

interface VehicleLoadMap {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  routeId: string;
  date: string;
  driverId: string;
  driverName: string;
  deliveryItems: DeliveryItem[];
  totalDeliveries: number;
  completedDeliveries: number;
  isOptimized: boolean;
  adminNotes?: string;
  driverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const LoadMap: React.FC<LoadMapProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { routePlans, jobs } = useSelector((state: RootState) => state.job);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showLoadMapDialog, setShowLoadMapDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLoadMap, setSelectedLoadMap] = useState<VehicleLoadMap | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock load map data
  const [loadMaps, setLoadMaps] = useState<VehicleLoadMap[]>([
    {
      id: '1',
      vehicleId: '1',
      vehicleRegistration: 'AB12 CDE',
      routeId: 'route-1',
      date: '2024-01-25',
      driverId: 'driver-1',
      driverName: 'Adam Mustafa',
      deliveryItems: [
        {
          id: 'delivery-1',
          jobId: 'job-1',
          jobTitle: 'London Delivery',
          customerName: 'London Warehouse',
          deliverySequence: 1,
          position: 'tail',
          estimatedTime: '09:00',
          status: 'pending',
          isFlexible: true,
        },
        {
          id: 'delivery-2',
          jobId: 'job-2',
          jobTitle: 'Manchester Delivery',
          customerName: 'Manchester Depot',
          deliverySequence: 2,
          position: 'middle',
          estimatedTime: '12:00',
          status: 'pending',
          isFlexible: true,
        },
        {
          id: 'delivery-3',
          jobId: 'job-3',
          jobTitle: 'Birmingham Delivery',
          customerName: 'Birmingham Hub',
          deliverySequence: 3,
          position: 'bulkhead',
          estimatedTime: '15:00',
          status: 'pending',
          isFlexible: false,
        },
      ],
      totalDeliveries: 3,
      completedDeliveries: 0,
      isOptimized: true,
      adminNotes: 'Optimized for fuel efficiency and time management',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      vehicleId: '2',
      vehicleRegistration: 'EF34 FGH',
      routeId: 'route-2',
      date: '2024-01-25',
      driverId: 'driver-2',
      driverName: 'Jane Manager',
      deliveryItems: [
        {
          id: 'delivery-4',
          jobId: 'job-4',
          jobTitle: 'Liverpool Delivery',
          customerName: 'Liverpool Port',
          deliverySequence: 1,
          position: 'tail',
          estimatedTime: '08:30',
          status: 'completed',
          actualTime: '08:25',
          isFlexible: true,
        },
        {
          id: 'delivery-5',
          jobId: 'job-5',
          jobTitle: 'Leeds Delivery',
          customerName: 'Leeds Distribution',
          deliverySequence: 2,
          position: 'bulkhead',
          estimatedTime: '11:30',
          status: 'in_progress',
          isFlexible: false,
        },
      ],
      totalDeliveries: 2,
      completedDeliveries: 1,
      isOptimized: true,
      driverNotes: 'Traffic on M62 caused slight delay',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Filter load maps based on user role
  const filteredLoadMaps = user?.role === 'driver'
    ? loadMaps.filter(map => map.driverId === user.id)
    : loadMaps;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      default: return <Pending />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'tail': return 'error';
      case 'bulkhead': return 'primary';
      case 'middle': return 'warning';
      default: return 'default';
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'tail': return 'Tail (1st)';
      case 'bulkhead': return 'Bulkhead (Last)';
      case 'middle': return 'Middle';
      default: return position;
    }
  };

  const handleOptimizeLoadMap = (loadMap: VehicleLoadMap) => {
    // Logic to optimize delivery sequence based on route and timing
    const optimizedItems = [...loadMap.deliveryItems].sort((a, b) => {
      // Sort by estimated time for logical sequence
      return a.estimatedTime.localeCompare(b.estimatedTime);
    });

    const updatedLoadMap = {
      ...loadMap,
      deliveryItems: optimizedItems.map((item, index) => ({
        ...item,
        deliverySequence: index + 1,
        position: index === 0 ? 'tail' : index === optimizedItems.length - 1 ? 'bulkhead' : 'middle',
      })),
      isOptimized: true,
      updatedAt: new Date().toISOString(),
    };

    setLoadMaps(prev => 
      prev.map(map => map.id === loadMap.id ? updatedLoadMap : map)
    );
  };

  const handleSwapDeliveries = (loadMap: VehicleLoadMap, item1Id: string, item2Id: string) => {
    const updatedItems = loadMap.deliveryItems.map(item => {
      if (item.id === item1Id) {
        return { ...item, deliverySequence: loadMap.deliveryItems.find(i => i.id === item2Id)?.deliverySequence || item.deliverySequence };
      }
      if (item.id === item2Id) {
        return { ...item, deliverySequence: loadMap.deliveryItems.find(i => i.id === item1Id)?.deliverySequence || item.deliverySequence };
      }
      return item;
    });

    const updatedLoadMap = {
      ...loadMap,
      deliveryItems: updatedItems.sort((a, b) => a.deliverySequence - b.deliverySequence),
      updatedAt: new Date().toISOString(),
    };

    setLoadMaps(prev => 
      prev.map(map => map.id === loadMap.id ? updatedLoadMap : map)
    );
  };

  const handleUpdateDeliveryStatus = (loadMapId: string, deliveryId: string, status: string) => {
    setLoadMaps(prev => 
      prev.map(map => 
        map.id === loadMapId 
          ? {
              ...map,
              deliveryItems: map.deliveryItems.map(item =>
                item.id === deliveryId 
                  ? { ...item, status: status as any, actualTime: status === 'completed' ? new Date().toLocaleTimeString() : item.actualTime }
                  : item
              ),
              completedDeliveries: map.deliveryItems.filter(item => 
                item.id === deliveryId ? status === 'completed' : item.status === 'completed'
              ).length,
              updatedAt: new Date().toISOString(),
            }
          : map
      )
    );
  };

  const handleSaveDriverNotes = (loadMapId: string, notes: string) => {
    setLoadMaps(prev => 
      prev.map(map => 
        map.id === loadMapId 
          ? { ...map, driverNotes: notes, updatedAt: new Date().toISOString() }
          : map
      )
    );
  };

  // Calculate overall statistics
  const totalLoadMaps = filteredLoadMaps.length;
  const totalDeliveries = filteredLoadMaps.reduce((sum, map) => sum + map.totalDeliveries, 0);
  const completedDeliveries = filteredLoadMaps.reduce((sum, map) => sum + map.completedDeliveries, 0);
  const completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Load Map
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

      {/* Load Map Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalLoadMaps}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Load Maps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {totalDeliveries}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Deliveries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {completedDeliveries}
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
              <Typography variant="h4" color="warning.main">
                {Math.round(completionRate)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {filteredLoadMaps.filter(map => map.isOptimized).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimized Routes
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

      {/* Load Map Cards */}
      <Grid container spacing={3}>
        {filteredLoadMaps.map((loadMap) => (
          <Grid item xs={12} md={6} lg={4} key={loadMap.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {loadMap.vehicleRegistration}
                  </Typography>
                  <Chip
                    label={`${loadMap.completedDeliveries}/${loadMap.totalDeliveries}`}
                    color={loadMap.completedDeliveries === loadMap.totalDeliveries ? 'success' : 'warning'}
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
                      {loadMap.driverName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(loadMap.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2">
                      {loadMap.completedDeliveries === loadMap.totalDeliveries ? 'Completed' : 'In Progress'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Optimized
                    </Typography>
                    <Typography variant="body2">
                      {loadMap.isOptimized ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(loadMap.completedDeliveries / loadMap.totalDeliveries) * 100}
                    color={loadMap.completedDeliveries === loadMap.totalDeliveries ? 'success' : 'primary'}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Map />}
                    onClick={() => {
                      setSelectedLoadMap(loadMap);
                      setShowLoadMapDialog(true);
                    }}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    View Load Map
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'owner') && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Calculate />}
                      onClick={() => handleOptimizeLoadMap(loadMap)}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Optimize Route
                    </Button>
                  )}
                  {user?.role === 'driver' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => {
                        setSelectedLoadMap(loadMap);
                        setIsEditMode(true);
                        setShowEditDialog(true);
                      }}
                      fullWidth
                    >
                      Edit Sequence
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Load Map View Dialog */}
      <Dialog open={showLoadMapDialog} onClose={() => setShowLoadMapDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Load Map: {selectedLoadMap?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          {selectedLoadMap && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 400, position: 'relative', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" gutterBottom>
                    Vehicle Load Sequence
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 300, 
                    border: '2px solid #333',
                    position: 'relative',
                    bgcolor: '#e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2
                  }}>
                    {/* Bulkhead (Front) */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '30%', 
                      border: '2px solid #1976d2',
                      bgcolor: '#bbdefb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        BULKHEAD (Last Delivery)
                      </Typography>
                      {selectedLoadMap.deliveryItems
                        .filter(item => item.position === 'bulkhead')
                        .map(item => (
                          <Chip
                            key={item.id}
                            label={`${item.deliverySequence}. ${item.customerName}`}
                            size="small"
                            color={getStatusColor(item.status) as any}
                            sx={{ position: 'absolute', top: 5, right: 5 }}
                          />
                        ))}
                    </Box>

                    {/* Middle */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '30%', 
                      border: '2px solid #ff9800',
                      bgcolor: '#ffe0b2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        MIDDLE DELIVERIES
                      </Typography>
                      {selectedLoadMap.deliveryItems
                        .filter(item => item.position === 'middle')
                        .map(item => (
                          <Chip
                            key={item.id}
                            label={`${item.deliverySequence}. ${item.customerName}`}
                            size="small"
                            color={getStatusColor(item.status) as any}
                            sx={{ position: 'absolute', top: 5, right: 5 }}
                          />
                        ))}
                    </Box>

                    {/* Tail (Rear) */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '30%', 
                      border: '2px solid #f44336',
                      bgcolor: '#ffcdd2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        TAIL (First Delivery)
                      </Typography>
                      {selectedLoadMap.deliveryItems
                        .filter(item => item.position === 'tail')
                        .map(item => (
                          <Chip
                            key={item.id}
                            label={`${item.deliverySequence}. ${item.customerName}`}
                            size="small"
                            color={getStatusColor(item.status) as any}
                            sx={{ position: 'absolute', top: 5, right: 5 }}
                          />
                        ))}
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Vehicle: {selectedLoadMap.vehicleRegistration} | Driver: {selectedLoadMap.driverName}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Delivery Sequence
                </Typography>
                <List dense>
                  {selectedLoadMap.deliveryItems
                    .sort((a, b) => a.deliverySequence - b.deliverySequence)
                    .map((item) => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          <Chip
                            label={item.deliverySequence}
                            size="small"
                            color={getPositionColor(item.position) as any}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.customerName}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {item.jobTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getPositionLabel(item.position)} | {item.estimatedTime} | {item.status}
                              </Typography>
                            </Box>
                          }
                        />
                        {user?.role === 'driver' && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const nextStatus = item.status === 'pending' ? 'in_progress' : 
                                               item.status === 'in_progress' ? 'completed' : 'pending';
                              handleUpdateDeliveryStatus(selectedLoadMap.id, item.id, nextStatus);
                            }}
                          >
                            {getStatusIcon(item.status)}
                          </IconButton>
                        )}
                      </ListItem>
                    ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                {selectedLoadMap.adminNotes && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Admin:</strong> {selectedLoadMap.adminNotes}
                    </Typography>
                  </Alert>
                )}
                {selectedLoadMap.driverNotes && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Driver:</strong> {selectedLoadMap.driverNotes}
                    </Typography>
                  </Alert>
                )}
                
                {user?.role === 'driver' && (
                  <TextField
                    fullWidth
                    label="Add Driver Notes"
                    multiline
                    rows={2}
                    placeholder="Add notes about route changes or delays..."
                    onChange={(e) => handleSaveDriverNotes(selectedLoadMap.id, e.target.value)}
                    defaultValue={selectedLoadMap.driverNotes}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoadMapDialog(false)}>
            Close
          </Button>
          <Button variant="contained">
            Export Load Map
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sequence Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Delivery Sequence: {selectedLoadMap?.vehicleRegistration}
        </DialogTitle>
        <DialogContent>
          {selectedLoadMap && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Driver Flexibility:</strong> You can adjust delivery sequence based on real-world conditions. 
                  First delivery should be at the tail, last delivery at the bulkhead.
                </Typography>
              </Alert>
              
              <List>
                {selectedLoadMap.deliveryItems
                  .sort((a, b) => a.deliverySequence - b.deliverySequence)
                  .map((item, index) => (
                    <ListItem key={item.id}>
                      <ListItemIcon>
                        <Chip
                          label={item.deliverySequence}
                          size="small"
                          color={getPositionColor(item.position) as any}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.customerName}
                        secondary={`${item.jobTitle} | ${item.estimatedTime} | ${getPositionLabel(item.position)}`}
                      />
                      <Box>
                        {index > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const prevItem = selectedLoadMap.deliveryItems
                                .sort((a, b) => a.deliverySequence - b.deliverySequence)[index - 1];
                              handleSwapDeliveries(selectedLoadMap, item.id, prevItem.id);
                            }}
                          >
                            <ArrowBackward />
                          </IconButton>
                        )}
                        {index < selectedLoadMap.deliveryItems.length - 1 && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const nextItem = selectedLoadMap.deliveryItems
                                .sort((a, b) => a.deliverySequence - b.deliverySequence)[index + 1];
                              handleSwapDeliveries(selectedLoadMap, item.id, nextItem.id);
                            }}
                          >
                            <ArrowForward />
                          </IconButton>
                        )}
                      </Box>
                    </ListItem>
                  ))}
              </List>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Changes will be logged and may be reviewed by management. 
                  Only make changes when necessary for operational efficiency.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setShowEditDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoadMap;
