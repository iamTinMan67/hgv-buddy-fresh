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
  Article,
} from '@mui/icons-material';

import ComplianceTracking from './ComplianceTracking';
import LegislationUpdates from './LegislationUpdates';
import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

interface LegalHubProps {
  onClose: () => void;
}

const LegalHub: React.FC<LegalHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'compliance' | 'legislation'>('main');

  // Define the cards configuration
  const functionalCards = 2; // Compliance Tracking, Legislation Updates
  const comingSoonCards = 0; // Coming soon cards replaced with placeholders
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('LegalHub - Functional cards:', functionalCards);
  console.log('LegalHub - Coming soon cards:', comingSoonCards);
  console.log('LegalHub - Placeholder cards:', placeholderCards.length);
  console.log('LegalHub - Total cards:', functionalCards + comingSoonCards + placeholderCards.length);

  const handleNavigateToCompliance = () => setCurrentView('compliance');
  const handleNavigateToLegislation = () => setCurrentView('legislation');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'compliance') {
    return <ComplianceTracking onClose={handleBackToMain} />;
  }

  if (currentView === 'legislation') {
    return <LegislationUpdates onClose={handleBackToMain} />;
  }

  // Main Legal Hub
  return (
    <Box sx={{ py: 2, px: 3, bgcolor: 'black', minHeight: '100vh', color: 'white', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
          Legal Hub
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {/* Compliance Tracking Card */}
        <Grid item xs={12} sm={6} md={4}>
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

        {/* Legislation Updates Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToLegislation}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Article />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Legislation Updates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest regulatory changes and updates
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Article />} 
                  label="DVSA Updates" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Article />} 
                  label="DfT Regulations" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Article />} 
                  label="Traffic Commissioners" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dynamic Placeholder Cards */}
        {placeholderCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.id}>
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

export default LegalHub;
