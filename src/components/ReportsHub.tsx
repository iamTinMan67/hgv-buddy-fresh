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
  Assessment,
  Receipt,
  LocalGasStation,
  ShoppingCart,
  Description,
  TrendingUp,
  Analytics,
  Report,
  Settings,
  Assignment,
  Home,
} from '@mui/icons-material';

import WageSlipsReport from './reports/WageSlipsReport';
import FuelReport from './reports/FuelReport';
import PurchaseOrdersReport from './reports/PurchaseOrdersReport';
import InvoicesReport from './reports/InvoicesReport';

interface ReportsHubProps {
  onClose: () => void;
}

const ReportsHub: React.FC<ReportsHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'wageSlips' | 'fuel' | 'purchaseOrders' | 'invoices'>('main');

  const handleNavigateToWageSlips = () => setCurrentView('wageSlips');
  const handleNavigateToFuel = () => setCurrentView('fuel');
  const handleNavigateToPurchaseOrders = () => setCurrentView('purchaseOrders');
  const handleNavigateToInvoices = () => setCurrentView('invoices');
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

  // Main Reports Hub
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reports Hub
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
        {/* Wage Slips Card */}
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
      </Grid>
    </Box>
  );
};

export default ReportsHub;
