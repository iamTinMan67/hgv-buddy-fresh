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
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
          Legal Hub
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Compliance Tracking Card */}
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

        {/* Coming Soon Card 1 */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                transform: 'none',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                  <Gavel />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Legal documentation
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Feature 1" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Feature 2" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Feature 3" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.7 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coming Soon Card 2 */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                transform: 'none',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                  <Gavel />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Relevant Legislation
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Feature 1" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Feature 2" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Feature 3" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.7 }}
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
