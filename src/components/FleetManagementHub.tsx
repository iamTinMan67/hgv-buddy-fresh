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
  Tabs,
  Tab,
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
import TrailerFleet from './TrailerFleet';
import FuelManagement from './FuelManagement';
import DriverManagement from './DriverManagement';
import RoutePlanning from './RoutePlanning';
import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

interface FleetManagementHubProps {
  onClose: () => void;
  userRole?: 'admin' | 'driver' | 'owner';
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
      id={`fleet-tabpanel-${index}`}
      aria-labelledby={`fleet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FleetManagementHub: React.FC<FleetManagementHubProps> = ({ onClose, userRole = 'admin' }) => {
  const [currentView, setCurrentView] = useState<'main' | 'fleet' | 'trailers' | 'fuel' | 'drivers' | 'routePlanning'>('main');
  const [fleetTabValue, setFleetTabValue] = useState(0);
  
  // Define the cards configuration based on user role
  // Count actual cards that will be rendered
  const functionalCardsCount = userRole === 'admin' ? 4 : 3; // Fleet, Drivers, Fuel, (Route Planning if admin)
  const comingSoonCardsCount = 2; // Maintenance Hub, Analytics Dashboard
  
  const columnsPerRow = 3;
  const totalCardsBeforePlaceholders = functionalCardsCount + comingSoonCardsCount;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCardsCount, comingSoonCardsCount, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('Functional cards:', functionalCardsCount);
  console.log('Coming soon cards:', comingSoonCardsCount);
  console.log('Placeholder cards:', placeholderCards.length);
  console.log('Total cards:', totalCardsBeforePlaceholders + placeholderCards.length);


  const handleNavigateToFleet = () => setCurrentView('fleet');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleNavigateToDrivers = () => setCurrentView('drivers');
  const handleBackToMain = () => setCurrentView('main');

  // Fleet/Trailer view with tabs
  if (currentView === 'fleet') {
    return (
      <Box sx={{ py: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
            <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
            Fleet Management
          </Typography>
          <IconButton onClick={handleBackToMain} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
            <Home />
          </IconButton>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={fleetTabValue} 
            onChange={(_, newValue) => setFleetTabValue(newValue)}
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
            <Tab label="Vehicles" />
            <Tab label="Trailers" />
          </Tabs>
        </Box>

        <TabPanel value={fleetTabValue} index={0}>
          <FleetManagement onClose={handleBackToMain} />
        </TabPanel>

        <TabPanel value={fleetTabValue} index={1}>
          <TrailerFleet onClose={handleBackToMain} />
        </TabPanel>
      </Box>
    );
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
          Fleet Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
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
                    Vehicles & Trailers management
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<LocalShipping />} 
                  label="Vehicles" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<LocalShipping />} 
                  label="Trailers" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Build />} 
                  label="Defect Tracking" 
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
