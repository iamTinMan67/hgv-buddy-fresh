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
  Assessment,
  Receipt,
  LocalGasStation,
  ShoppingCart,
  Description,
  TrendingUp,
  Analytics,
  Report,
  Home,
  ListAlt,
} from '@mui/icons-material';

import WageSlipsReport from './reports/WageSlipsReport';
import FuelReport from './reports/FuelReport';
import PurchaseOrdersReport from './reports/PurchaseOrdersReport';
import InvoicesReport from './reports/InvoicesReport';
import ManifestsReport from './reports/ManifestsReport';
import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

interface ReportsHubProps {
  onClose: () => void;
}

const ReportsHub: React.FC<ReportsHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'wageSlips' | 'fuel' | 'purchaseOrders' | 'invoices' | 'manifests'>('main');

  // Define the cards configuration
  const functionalCards = 5; // Wage Slips, Fuel, Purchase Orders, Invoices, Manifests
  const comingSoonCards = 0; // No separate coming soon cards - using placeholders only
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('ReportsHub - Functional cards:', functionalCards);
  console.log('ReportsHub - Coming soon cards:', comingSoonCards);
  console.log('ReportsHub - Placeholder cards:', placeholderCards.length);
  console.log('ReportsHub - Total cards:', functionalCards + comingSoonCards + placeholderCards.length);

  const handleNavigateToWageSlips = () => setCurrentView('wageSlips');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleNavigateToPurchaseOrders = () => setCurrentView('purchaseOrders');
  const handleNavigateToInvoices = () => setCurrentView('invoices');
  const handleNavigateToManifests = () => setCurrentView('manifests');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'wageSlips') {
    return <WageSlipsReport onClose={handleBackToMain} />;
  }

  if (currentView === 'fuel') {
    return <FuelReport onClose={handleBackToMain} />;
  }

  if (currentView === 'purchaseOrders') {
    return <PurchaseOrdersReport onClose={handleBackToMain} />;
  }

  if (currentView === 'invoices') {
    return <InvoicesReport onClose={handleBackToMain} />;
  }

  if (currentView === 'manifests') {
    return <ManifestsReport onClose={handleBackToMain} />;
  }

  // Main Reports Hub
  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reports Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Manifests Card */}
        <Grid item xs={12} md={6} lg={4}>
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
            onClick={handleNavigateToManifests}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <ListAlt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Manifests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Print manifests by date, vehicle, or fleet
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Date Based" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Vehicle Specific" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Fleet Wide" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wage Slips Card */}
        <Grid item xs={12} md={6} lg={4}>
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
            onClick={handleNavigateToWageSlips}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Wage Slips
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Driver payroll and wage reports
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Payroll" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Overtime" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Tax Reports" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Report Card */}
        <Grid item xs={12} md={6} lg={4}>
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
                    Fuel consumption and cost analysis
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Consumption" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Cost Analysis" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Efficiency" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchase Orders Card */}
        <Grid item xs={12} md={6} lg={4}>
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
            onClick={handleNavigateToPurchaseOrders}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Purchase Orders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Parts and supplies procurement
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Orders" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Suppliers" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Inventory" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices Card */}
        <Grid item xs={12} md={6} lg={4}>
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
            onClick={handleNavigateToInvoices}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Description />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer billing and invoicing
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Billing" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Revenue" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Collections" 
                  size="small" 
                  sx={{ mb: 1 }}
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
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsHub;
