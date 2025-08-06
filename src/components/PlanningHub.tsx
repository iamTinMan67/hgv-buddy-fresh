import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Schedule,
  Route,
  Assignment,
  TrendingUp,
  Map,
  CalendarToday,
  ArrowBack,
  Add,
  Timeline,
  DirectionsCar,
  Person,
  Home,
  Navigation,
  Traffic,
  Speed,
  Warning,
} from '@mui/icons-material';

import DailyPlanner from './DailyPlanner';
import RoutePlanning from './RoutePlanning';
import GarminRoutePlanning from './GarminRoutePlanning';
import JobAssignment from './JobAssignment';

interface PlanningHubProps {
  onClose: () => void;
}

const PlanningHub: React.FC<PlanningHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'daily' | 'route' | 'garmin' | 'job'>('main');


  const handleNavigateToDaily = () => setCurrentView('daily');
  const handleNavigateToRoute = () => setCurrentView('route');
  const handleNavigateToGarmin = () => setCurrentView('garmin');
  const handleNavigateToJob = () => setCurrentView('job');
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

  if (currentView === 'job') {
    return <JobAssignment onClose={handleBackToMain} />;
  }

  // Main Planning Hub
  return (
    <Box sx={{ py: 2 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" gutterBottom>
           <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
           Planning Hub
         </Typography>
         <IconButton
           onClick={onClose}
           sx={{ color: 'yellow', fontSize: '1.5rem' }}
         >
           <Home />
         </IconButton>
       </Box>



      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Daily Planner Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
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
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
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

        {/* Garmin Route Planning Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
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

        {/* Job Assignment Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToJob}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Job Assignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and assign jobs to drivers
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              

                             <Box sx={{ mt: 2, minHeight: '60px' }}>
                 <Chip 
                   icon={<Add />} 
                   label="Create Jobs" 
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
                   icon={<Timeline />} 
                   label="Job Tracking" 
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
