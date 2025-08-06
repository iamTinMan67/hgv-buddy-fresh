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
  LocalShipping,
  LocalGasStation,
  Build,
  Warning,
  CheckCircle,
  Error,
  ArrowBack,
  TrendingUp,
  Analytics,
  Report,
  Settings,
  Assignment,
  Home,
} from '@mui/icons-material';

import FleetManagement from './FleetManagement';
import FuelManagement from './FuelManagement';

interface FleetManagementHubProps {
  onClose: () => void;
}

const FleetManagementHub: React.FC<FleetManagementHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'fleet' | 'fuel'>('main');


  const handleNavigateToFleet = () => setCurrentView('fleet');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'fleet') {
    return <FleetManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'fuel') {
    return <FuelManagement onClose={handleBackToMain} />;
  }

  // Main Fleet Management Hub
  return (
    <Box sx={{ py: 2 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" gutterBottom>
           <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
           Fleet Management
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
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
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
                   icon={<Settings />} 
                   label="Vehicle Status" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Build />} 
                   label="Defect Reports" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Assignment />} 
                   label="Maintenance" 
                   size="small" 
                   sx={{ mb: 1 }}
                 />
               </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Management Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
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
                   icon={<TrendingUp />} 
                   label="Cost Tracking" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Analytics />} 
                   label="Efficiency" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Report />} 
                   label="Reports" 
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
