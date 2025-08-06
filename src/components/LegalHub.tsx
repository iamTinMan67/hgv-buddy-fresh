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
  Gavel,
  Security,
  Warning,
  CheckCircle,
  TrendingUp,
  Analytics,
  Report,
  Assignment,
  Home,
} from '@mui/icons-material';

import ComplianceTracking from './ComplianceTracking';

interface LegalHubProps {
  onClose: () => void;
}

const LegalHub: React.FC<LegalHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'compliance'>('main');

  const handleNavigateToCompliance = () => setCurrentView('compliance');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'compliance') {
    return <ComplianceTracking onClose={handleBackToMain} />;
  }

  // Main Legal Hub
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
          Legal Hub
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
        {/* Compliance Tracking Card */}
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
            onClick={handleNavigateToCompliance}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Compliance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Legal compliance and regulatory tracking
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Warning />} 
                  label="Driver Hours" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Vehicle Safety" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assignment />} 
                  label="Qualifications" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Placeholder Card for consistent layout */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              opacity: 0.3,
              cursor: 'default',
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.400', mr: 2 }}>
                  <Gavel />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" sx={{ color: 'grey.500' }}>
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Additional legal features
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Future" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.5 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Features" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.5 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Reports" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LegalHub;
