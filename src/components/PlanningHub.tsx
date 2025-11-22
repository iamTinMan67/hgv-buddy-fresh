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
  Report,
  Assignment,
  Schedule
} from '@mui/icons-material';

import DailyPlanner from './DailyPlanner';
import RoutePlanning from './RoutePlanning';
import GarminRoutePlanning from './GarminRoutePlanning';
import TrailerPlanner from './TrailerPlanner';
import JobAllocationForm from './JobAllocationForm';
import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

interface PlanningHubProps {
  onClose: () => void;
}

const PlanningHub: React.FC<PlanningHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'daily' | 'route' | 'garmin' | 'trailer' | 'job'>('main');
  
  // Define the cards configuration
  const functionalCards = 6; // Daily Planner, Route Planning, Trailer Planner, Add New Consignment, Garmin Routes, Planning Analytics
  const comingSoonCards = 0; // No coming soon cards currently
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('PlanningHub - Functional cards:', functionalCards);
  console.log('PlanningHub - Coming soon cards:', comingSoonCards);
  console.log('PlanningHub - Placeholder cards:', placeholderCards.length);
  console.log('PlanningHub - Total cards:', functionalCards + comingSoonCards + placeholderCards.length);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white', mr: 2 }}>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
          Planning Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Add New Consignment Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              minHeight: '200px',
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
                    Add New Consignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and allocate new consignments
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Edit />} 
                  label="Consignment Creation" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Person />} 
                  label="Driver Assignment" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Allocation" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Planner Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              minHeight: '200px',
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
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Timeline />} 
                  label="Daily Schedule" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Person />} 
                  label="Driver Assignments" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Allocation" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
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
              minHeight: '200px',
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
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Map />} 
                  label="Route Optimization" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Efficiency" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Routes" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
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
              minHeight: '200px',
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
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Scale />} 
                  label="Cubage Calculator" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Storage />} 
                  label="Cargo Layout" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<ViewInAr />} 
                  label="3D Visualization" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
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
              minHeight: '200px',
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
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Traffic />} 
                  label="Traffic Analysis" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Speed />} 
                  label="Speed Optimization" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Warning />} 
                  label="Hazards" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
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
              minHeight: '200px',
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
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<Report />} 
                  label="Reports" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Trends" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
                <Chip 
                  icon={<Assessment />} 
                  label="KPIs" 
                  size="small" 
                  sx={{ width: '100%', justifyContent: 'flex-start' }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dynamic Placeholder Cards */}
        {placeholderCards.map((card) => (
          <Grid item xs={12} md={4} key={card.id}>
            <Card 
              sx={{ 
                cursor: 'default', 
                transition: 'all 0.3s ease',
                transform: 'scale(0.94)',
                minHeight: '200px',
                opacity: 0.7,
                '&:hover': {
                  transform: 'translateY(-4px) scale(0.94)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {card.features.map((feature, index) => (
                    <Chip 
                      key={index}
                      icon={<Analytics />} 
                      label={feature} 
                      size="small" 
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                      color="default"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanningHub;
