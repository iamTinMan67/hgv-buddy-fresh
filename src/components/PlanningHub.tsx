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
import JobAllocationForm from './JobAllocationForm';

interface PlanningHubProps {
  onClose: () => void;
}

const PlanningHub: React.FC<PlanningHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'daily' | 'route' | 'garmin' | 'trailer' | 'job'>('main');

  if (currentView === 'daily') {
    return <DailyPlanner onClose={() => setCurrentView('main')} />;
  }

  if (currentView === 'route') {
    return <RoutePlanning onClose={() => setCurrentView('main')} />;
  }

  if (currentView === 'garmin') {
    return <GarminRoutePlanning onClose={() => setCurrentView('main')} />;
  }

  if (currentView === 'trailer') {
    return <TrailerPlanner onClose={() => setCurrentView('main')} />;
  }

  if (currentView === 'job') {
    return <JobAllocationForm onClose={() => setCurrentView('main')} />;
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
            onClick={() => setCurrentView('daily')}
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
            onClick={() => setCurrentView('route')}
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
            onClick={() => setCurrentView('trailer')}
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

        {/* Add A New Job Card */}
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
            onClick={() => setCurrentView('job')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Add A New Job
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and allocate new jobs
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Edit />} 
                  label="Job Creation" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Person />} 
                  label="Driver Assignment" 
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
            onClick={() => setCurrentView('garmin')}
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
                    GPS route planning and optimization
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Traffic />} 
                  label="Traffic Analysis" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Speed />} 
                  label="Speed Optimization" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Warning />} 
                  label="Hazards" 
                  size="small" 
                  sx={{ mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Planning Tools */}
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
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <Analytics />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Planning Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance metrics and insights
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Report />} 
                  label="Reports" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Trends" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  icon={<Assessment />} 
                  label="KPIs" 
                  size="small" 
                  sx={{ mb: 1 }} 
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
