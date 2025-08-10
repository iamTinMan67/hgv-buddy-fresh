import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { 
  CalendarToday, 
  Home, 
  Route, 
  TrendingUp, 
  Map, 
  Timeline, 
  DirectionsCar, 
  Person, 
  Navigation, 
  Traffic, 
  Speed, 
  Warning, 
  ViewInAr, 
  Scale, 
  Storage, 
  Edit, 
  Assessment, 
  Receipt, 
  Analytics, 
  Report 
} from '@mui/icons-material';

import DailyPlanner from './DailyPlanner';
import RoutePlanning from './RoutePlanning';
import GarminRoutePlanning from './GarminRoutePlanning';
import TrailerPlanner from './TrailerPlanner';

interface PlanningHubProps {
  onClose: () => void;
}

const PlanningHub: React.FC<PlanningHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'daily' | 'route' | 'garmin' | 'trailer'>('main');

  const handleNavigateToDaily = () => setCurrentView('daily');
  const handleNavigateToRoute = () => setCurrentView('route');
  const handleNavigateToGarmin = () => setCurrentView('garmin');
  const handleNavigateToTrailer = () => setCurrentView('trailer');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'daily') {
    return <DailyPlanner onClose={handleBackToMain} />;
  }

  if (currentView === 'route') {
    return <RoutePlanning onClose={handleBackToMain} />;
  }

  if (currentView === 'garmin') {
    return <GarminRoutePlanning onClose={handleBackToMain} />;
  }

  if (currentView === 'trailer') {
    return <TrailerPlanner onClose={handleBackToMain} />;
  }

  // Main Planning Hub
  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
          Planning Hub
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Daily Planner Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToDaily}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Daily Planner
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule and track daily operations
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Timeline />} 
                  label="Daily Schedule" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Person />} 
                  label="Driver Assignments" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Allocation" 
                  size="small" 
                  sx={{ mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Route Planning Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToRoute}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Route />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Route Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimize routes and allocate jobs
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Map />} 
                  label="Route Optimization" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Efficiency" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Routes" 
                  size="small" 
                  sx={{ mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trailer Planner Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToTrailer}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <ViewInAr />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Trailer Planner
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cubage calculation and cargo layout
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Scale />} 
                  label="Cubage Calculator" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Storage />} 
                  label="Cargo Layout" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<ViewInAr />} 
                  label="3D Visualization" 
                  size="small" 
                  sx={{ mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Garmin Route Planning Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToGarmin}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Navigation />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Garmin Routes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Advanced navigation with Garmin
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Traffic />} 
                  label="Live Traffic" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Speed />} 
                  label="Real-time ETA" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Warning />} 
                  label="HGV Alerts" 
                  size="small" 
                  sx={{ mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coming Soon Card for consistent layout */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                transform: 'none',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                  <Analytics />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Advanced planning features
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Feature 1" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }} 
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Feature 2" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }} 
                />
                <Chip 
                  icon={<Report />} 
                  label="Feature 3" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.7 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
};

export default PlanningHub;
