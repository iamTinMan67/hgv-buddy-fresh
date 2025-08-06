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
} from '@mui/material';
import {
  Business,
  Person,
  Receipt,
  TrendingUp,
  Home,
} from '@mui/icons-material';

import ClientContacts from './ClientContacts';
import ClientInvoices from './ClientInvoices';

interface ClientHubProps {
  onClose: () => void;
}

const ClientHub: React.FC<ClientHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'contacts' | 'invoices'>('main');

  const handleNavigateToContacts = () => setCurrentView('contacts');
  const handleNavigateToInvoices = () => setCurrentView('invoices');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'contacts') {
    return <ClientContacts onClose={handleBackToMain} />;
  }

  if (currentView === 'invoices') {
    return <ClientInvoices onClose={handleBackToMain} />;
  }

  // Main Client Hub
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box onClick={onClose} sx={{ mr: 2, cursor: 'pointer' }}>
          <Home />
        </Box>
        <Typography variant="h4" component="h1">
          Client Hub
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Client Contacts Card */}
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
            onClick={handleNavigateToContacts}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Client Contacts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage client relationships
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Person />} 
                  label="Clients" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Business />} 
                  label="Suppliers" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Prospects" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Invoices Card */}
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
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Client Invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Billing and invoicing
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Receipt />} 
                  label="Invoices" 
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
                  icon={<Business />} 
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

export default ClientHub;
