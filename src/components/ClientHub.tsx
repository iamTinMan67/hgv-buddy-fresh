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
  Business,
  Contacts,
  Receipt,
  Assignment,
  TrendingUp,
  Analytics,
  Report,
  Settings,
  Home,
} from '@mui/icons-material';

import ClientContacts from './ClientContacts';
import ClientInvoices from './ClientInvoices';
import ClientJobAssignment from './ClientJobAssignment';

interface ClientHubProps {
  onClose: () => void;
}

const ClientHub: React.FC<ClientHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'contacts' | 'invoices' | 'jobAssignment'>('main');

  const handleNavigateToContacts = () => setCurrentView('contacts');
  const handleNavigateToInvoices = () => setCurrentView('invoices');
  const handleNavigateToJobAssignment = () => setCurrentView('jobAssignment');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'contacts') {
    return <ClientContacts onClose={handleBackToMain} />;
  }

  if (currentView === 'invoices') {
    return <ClientInvoices onClose={handleBackToMain} />;
  }

  if (currentView === 'jobAssignment') {
    return <ClientJobAssignment onClose={handleBackToMain} />;
  }

  // Main Client Hub
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          Client Hub
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
        {/* Contacts Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToContacts}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Contacts />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Contacts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client contact management
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Business />} 
                  label="Companies" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Contacts />} 
                  label="Individuals" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Settings />} 
                  label="Details" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices Card */}
        <Grid item xs={12} md={4}>
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client billing and invoicing
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Receipt />} 
                  label="Billing" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Payments" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Reports" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Assignment Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToJobAssignment}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Job Assignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client job management
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Assignment />} 
                  label="Jobs" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Scheduling" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Tracking" 
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

export default ClientHub;
