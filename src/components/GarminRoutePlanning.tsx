import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Map,
  Directions,
  LocalShipping,
  Warning,
  Traffic,
  Speed,
  AccessTime,
  Straighten,
  LocalGasStation,
  Home,
  Share,
  Settings,
  Refresh,
  MyLocation,
  LocationOn,
  Route,
  Navigation,
  Download,
} from '@mui/icons-material';

interface GarminRoutePlanningProps {
  onClose: () => void;
}

interface RoutePoint {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: 'pickup' | 'delivery' | 'fuel' | 'rest' | 'custom';
  estimatedTime: string;
  distance: number;
}

interface RoutePlan {
  id: string;
  name: string;
  vehicleId: string;
  driverId: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  waypoints: RoutePoint[];
  totalDistance: number;
  totalTime: string;
  fuelStops: RoutePoint[];
  restStops: RoutePoint[];
  trafficConditions: string;
  weatherConditions: string;
  restrictions: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const GarminRoutePlanning: React.FC<GarminRoutePlanningProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [garminConnected, setGarminConnected] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'planning' | 'active' | 'history'>('main');

  const [routes] = useState<RoutePlan[]>([
    {
      id: '1',
      name: 'London to Manchester Delivery',
      vehicleId: 'TRK001',
      driverId: 'DRV001',
      startPoint: {
        id: 'start1',
        name: 'London Depot',
        address: '123 Industrial Estate, London',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        type: 'pickup',
        estimatedTime: '08:00',
        distance: 0
      },
      endPoint: {
        id: 'end1',
        name: 'Manchester Warehouse',
        address: '456 Business Park, Manchester',
        coordinates: { lat: 53.4808, lng: -2.2426 },
        type: 'delivery',
        estimatedTime: '14:30',
        distance: 0
      },
      waypoints: [
        {
          id: 'wp1',
          name: 'Birmingham Fuel Stop',
          address: 'M6 Services, Birmingham',
          coordinates: { lat: 52.4862, lng: -1.8904 },
          type: 'fuel',
          estimatedTime: '10:15',
          distance: 120
        }
      ],
      totalDistance: 320,
      totalTime: '6h 30m',
      fuelStops: [],
      restStops: [],
      trafficConditions: 'Moderate',
      weatherConditions: 'Clear',
      restrictions: ['Height: 4.2m', 'Weight: 44t'],
      status: 'active',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    }
  ]);

  // Garmin integration functions
  const connectGarmin = async () => {
    setIsLoading(true);
    try {
      // Mock Garmin connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGarminConnected(true);
      // Connected to Garmin services
    } catch (error) {
      console.error('Failed to connect to Garmin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithGarmin = async (route: RoutePlan) => {
    setIsLoading(true);
    try {
      // Mock Garmin sync
      await new Promise(resolve => setTimeout(resolve, 1500));
              // Route synced with Garmin device
      return true;
    } catch (error) {
      console.error('Failed to sync with Garmin:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renderMainView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Navigation sx={{ mr: 1, verticalAlign: 'middle' }} />
          Garmin Route Planning
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={garminConnected ? <Settings /> : <Refresh />}
            onClick={connectGarmin}
            disabled={isLoading}
            sx={{ mr: 2 }}
          >
            {garminConnected ? 'Garmin Connected' : 'Connect Garmin'}
          </Button>
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      {!garminConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connect to Garmin services to access real-time traffic, weather, and advanced routing features.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Route Planning Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={() => setCurrentView('planning')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Directions sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Plan New Route
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create optimized HGV routes
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<MyLocation />} 
                  label="Start Point" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<LocationOn />} 
                  label="Waypoints" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Route />} 
                  label="Optimize" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Routes Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={() => setCurrentView('active')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Active Routes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor live routes & progress
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Traffic />} 
                  label="Live Traffic" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Speed />} 
                  label="ETA Updates" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Warning />} 
                  label="Alerts" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Route History Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={() => setCurrentView('history')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Map sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Route History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View completed routes & analytics
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<AccessTime />} 
                  label="Time Analysis" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<LocalGasStation />} 
                  label="Fuel Efficiency" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Straighten />} 
                  label="Distance Logs" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {routes.filter(r => r.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Routes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {routes.filter(r => r.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {routes.reduce((sum, r) => sum + r.totalDistance, 0)}km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Distance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {garminConnected ? 'Connected' : 'Disconnected'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Garmin Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPlanningView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Directions sx={{ mr: 1, verticalAlign: 'middle' }} />
          Plan New Route
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={() => setShowRouteDialog(true)}
            sx={{ mr: 2 }}
          >
            Create Route
          </Button>
          <IconButton
            onClick={() => setCurrentView('main')}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interactive Map (Garmin Integration)
              </Typography>
              <Box 
                sx={{ 
                  height: 400, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px dashed grey'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Garmin Map Interface
                  <br />
                  <small>Real-time traffic, weather, and HGV restrictions</small>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Route Options
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Vehicle Type</InputLabel>
                <Select defaultValue="hgv">
                  <MenuItem value="hgv">HGV (44t)</MenuItem>
                  <MenuItem value="artic">Articulated Lorry</MenuItem>
                  <MenuItem value="rigid">Rigid Truck</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Route Preference</InputLabel>
                <Select defaultValue="fastest">
                  <MenuItem value="fastest">Fastest Route</MenuItem>
                  <MenuItem value="shortest">Shortest Distance</MenuItem>
                  <MenuItem value="economic">Most Economic</MenuItem>
                  <MenuItem value="scenic">Avoid Motorways</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Traffic Avoidance</InputLabel>
                <Select defaultValue="moderate">
                  <MenuItem value="none">No Avoidance</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="aggressive">Aggressive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Directions />}
                onClick={() => setShowRouteDialog(true)}
              >
                Calculate Route
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderActiveRoutesView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
          Active Routes
        </Typography>
        <IconButton
          onClick={() => setCurrentView('main')}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {routes.filter(r => r.status === 'active').map((route) => (
          <Grid item xs={12} key={route.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">{route.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {route.startPoint.name} → {route.endPoint.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                                             <Chip 
                         icon={<Straighten />} 
                         label={`${route.totalDistance}km`} 
                         size="small" 
                         sx={{ mr: 1 }}
                       />
                      <Chip 
                        icon={<AccessTime />} 
                        label={route.totalTime} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        icon={<Traffic />} 
                        label={route.trafficConditions} 
                        size="small" 
                        color={route.trafficConditions === 'Good' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => syncWithGarmin(route)}
                      disabled={!garminConnected || isLoading}
                      sx={{ mr: 1 }}
                    >
                      Sync to Garmin
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                    >
                      Share Route
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderHistoryView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
          Route History
        </Typography>
        <IconButton
          onClick={() => setCurrentView('main')}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      <List>
        {routes.filter(r => r.status === 'completed').map((route) => (
          <React.Fragment key={route.id}>
            <ListItem>
              <ListItemIcon>
                <Map />
              </ListItemIcon>
              <ListItemText
                primary={route.name}
                secondary={`${route.totalDistance}km • ${route.totalTime} • Completed ${new Date(route.updatedAt).toLocaleDateString()}`}
              />
              <Button variant="outlined" size="small">
                View Details
              </Button>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ py: 2, px: 2 }}>
      {currentView === 'main' && renderMainView()}
      {currentView === 'planning' && renderPlanningView()}
      {currentView === 'active' && renderActiveRoutesView()}
      {currentView === 'history' && renderHistoryView()}

      {/* Route Creation Dialog */}
      <Dialog open={showRouteDialog} onClose={() => setShowRouteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Route</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Route Name"
                placeholder="e.g., London to Manchester Delivery"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle ID"
                placeholder="TRK001"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Point"
                placeholder="London Depot"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Point"
                placeholder="Manchester Warehouse"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Waypoints (optional)"
                placeholder="Add intermediate stops, fuel stations, rest areas..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRouteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowRouteDialog(false);
              setCurrentView('planning');
            }}
          >
            Create Route
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GarminRoutePlanning;
