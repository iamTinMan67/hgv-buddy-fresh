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
  LocalShipping,
  LocalGasStation,
  Build,
  TrendingUp,
  Analytics,
  Assignment,
  Home,
  Person,
  Schedule,
  Assessment,
  AttachMoney,
  Route,
  Map,
} from '@mui/icons-material';

import FleetManagement from './FleetManagement';
import FuelManagement from './FuelManagement';
import DriverManagement from './DriverManagement';
import RoutePlanning from './RoutePlanning';

// Utility function to generate placeholder cards
const generatePlaceholderCards = (functionalCards: number, comingSoonCards: number, columnsPerRow: number = 3) => {
  const totalCards = functionalCards + comingSoonCards;
  const cardsInCurrentRow = totalCards % columnsPerRow;
  
  console.log('Placeholder calculation:');
  console.log('- Functional cards:', functionalCards);
  console.log('- Coming soon cards:', comingSoonCards);
  console.log('- Total cards:', totalCards);
  console.log('- Cards in current row:', cardsInCurrentRow);
  console.log('- Columns per row:', columnsPerRow);
  
  // If current row is complete (cardsInCurrentRow === 0), don't add any placeholders
  if (cardsInCurrentRow === 0) {
    console.log('- No placeholders needed (row is complete)');
    return [];
  }
  
  // Only add placeholders to complete the current row, never start a new row
  const placeholdersNeeded = columnsPerRow - cardsInCurrentRow;
  console.log('- Placeholders needed:', placeholdersNeeded);
  
  // Never add more placeholders than needed to complete the current row
  return Array.from({ length: placeholdersNeeded }, (_, index) => ({
    id: `placeholder-${index}`,
    title: 'Coming Soon',
    description: 'Additional features and tools',
    icon: <Analytics />,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  }));
};

interface FleetManagementHubProps {
  onClose: () => void;
  userRole?: 'admin' | 'driver' | 'owner';
}

const FleetManagementHub: React.FC<FleetManagementHubProps> = ({ onClose, userRole = 'admin' }) => {
  const [currentView, setCurrentView] = useState<'main' | 'fleet' | 'fuel' | 'drivers' | 'routePlanning'>('main');
  
  // Define the cards configuration based on user role
  const getCardConfiguration = (role: string) => {
    switch (role) {
      case 'admin':
        return { functionalCards: 4, comingSoonCards: 2 }; // Fleet, Drivers, Fuel, Route Planning + 2 coming soon
      case 'driver':
        return { functionalCards: 3, comingSoonCards: 2 }; // Fleet, Drivers, Fuel + 2 coming soon
      default:
        return { functionalCards: 4, comingSoonCards: 2 };
    }
  };
  
  const { functionalCards, comingSoonCards } = getCardConfiguration(userRole);
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('Functional cards:', functionalCards);
  console.log('Coming soon cards:', comingSoonCards);
  console.log('Placeholder cards:', placeholderCards.length);
  console.log('Total cards:', functionalCards + comingSoonCards + placeholderCards.length);


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

        {/* Route Planning Card - Admin only */}
        {userRole === 'admin' && (
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
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Route />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div">
                      Route Planning
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optimize delivery routes and navigation
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
                    label="Navigation" 
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
        )}

        {/* Dynamic Coming Soon Cards */}
        {(() => {
          const comingSoonCardsData = [
            {
              id: 'maintenance-hub',
              title: 'Maintenance Hub',
              description: 'Vehicle maintenance tracking',
              icon: <Build />,
              features: ['Coming Soon', 'Maintenance Reports', 'Service Scheduling']
            },
            {
              id: 'analytics-dashboard',
              title: 'Analytics Dashboard', 
              description: 'Fleet performance insights',
              icon: <Analytics />,
              features: ['Coming Soon', 'Performance Metrics', 'Data Insights']
            }
          ];
          
          // Add placeholder cards to complete the row
          const allComingSoonCards = [...comingSoonCardsData, ...placeholderCards];
          
          return allComingSoonCards.map((card) => (
            <Grid item xs={12} md={4} key={card.id}>
              <Card 
                sx={{ 
                  cursor: 'default', 
                  transition: 'all 0.3s ease',
                  transform: 'scale(0.94)',
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
                  
                  <Box sx={{ mt: 2, minHeight: '60px' }}>
                    {card.features.map((feature, index) => (
                      <Chip 
                        key={index}
                        icon={<Analytics />} 
                        label={feature} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }}
                        color="default"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ));
        })()}

      </Grid>


    </Box>
  );
};

export default FleetManagementHub;
