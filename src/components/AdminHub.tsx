import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  AdminPanelSettings,
  Business,
  Receipt,
  Home,
} from '@mui/icons-material';
import { DynamicComponents, LoadingSpinner } from '../utils/dynamicImports';
import ErrorBoundary from './ErrorBoundary';
import { Suspense } from 'react';

const { CompanyInfo, PricingConfiguration } = DynamicComponents;

interface AdminHubProps {
  onClose: () => void;
}

const AdminHub: React.FC<AdminHubProps> = ({ onClose }) => {
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showPricingConfiguration, setShowPricingConfiguration] = useState(false);

  // Conditional rendering for child components
  if (showCompanyInfo) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <CompanyInfo onClose={() => setShowCompanyInfo(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  if (showPricingConfiguration) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PricingConfiguration onClose={() => setShowPricingConfiguration(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Main Admin Hub
  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2, color: 'white' }}>
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Company Info Manager Card */}
        <Grid item xs={12} md={6}>
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
            onClick={() => setShowCompanyInfo(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Company Info Manager
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage company information and details
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Business />} 
                  label="Company Details" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Business />} 
                  label="Contact Information" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Business />} 
                  label="Logo & Branding" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Configuration Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              border: '2px solid',
              borderColor: 'warning.main',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowPricingConfiguration(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Pricing Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure pricing rules and settings
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  label="Admin Only" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, bgcolor: 'warning.main', color: 'black' }} 
                />
                <Chip 
                  icon={<Receipt />} 
                  label="Plot Pricing" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Receipt />} 
                  label="Distance Tiers" 
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

export default AdminHub;

