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
  Button,
} from '@mui/material';
import {
  LocalShipping,
  LocalGasStation,
  Build,
  TrendingUp,
  Analytics,
  Report,
  Settings,
  Assignment,
  Home,
  Person,
  Schedule,
} from '@mui/icons-material';

import FleetManagement from './FleetManagement';
import FuelManagement from './FuelManagement';
import DriverManagement from './DriverManagement';
import RoutePlanning from './RoutePlanning';

interface FleetManagementHubProps {
  onClose: () => void;
}

const FleetManagementHub: React.FC<FleetManagementHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'fleet' | 'fuel' | 'drivers' | 'routePlanning'>('main');


  const handleNavigateToFleet = () => setCurrentView('fleet');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleNavigateToDrivers = () => setCurrentView('drivers');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'fleet') {
    return <FleetManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'fuel') {
    return <FuelManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'drivers') {
    return <DriverManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'routePlanning') {
    return <RoutePlanning onClose={handleBackToMain} />;
  }

  // Main Fleet Management Hub
  return (
    <Box sx={{ py: 2, px: 2 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" gutterBottom>
           <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
           Fleet Hub
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
        {/* Fleet Management Card */}
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
            onClick={handleNavigateToFleet}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Fleet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle management and defect tracking
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<LocalShipping />} 
                  label="Vehicle Management" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Build />} 
                  label="Defect Tracking" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assessment />} 
                  label="Maintenance" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Drivers Management Card */}
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
            onClick={handleNavigateToDrivers}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Drivers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Driver management and assignments
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Person />} 
                  label="Driver Profiles" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assignment />} 
                  label="Assignments" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assessment />} 
                  label="Performance" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Management Card */}
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
            onClick={handleNavigateToFuel}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <LocalGasStation />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Fuel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuel tracking and cost analysis
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<LocalGasStation />} 
                  label="Fuel Tracking" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AttachMoney />} 
                  label="Cost Analysis" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assessment />} 
                  label="Reports" 
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
            onClick={() => setCurrentView('routePlanning')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Route Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Plan routes and optimize deliveries
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Route />} 
                  label="Route Optimization" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Map />} 
                  label="Delivery Planning" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assessment />} 
                  label="Efficiency" 
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

export default FleetManagementHub;
