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
  Assignment,
  Notes,
  Schedule,
  Home,
  Timeline,
  Map,
  DirectionsCar,
  Description,
  Edit,
  ViewInAr,
  Analytics,
  TrendingUp,
  Report,
} from '@mui/icons-material';

import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

interface JobAssignmentHubProps {
  onClose: () => void;
}

const JobAssignmentHub: React.FC<JobAssignmentHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'scheduling'>('main');

  // Define the cards configuration
  const functionalCards = 1; // Scheduling
  const comingSoonCards = 1; // Consignment Notes
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('JobAssignmentHub - Functional cards:', functionalCards);
  console.log('JobAssignmentHub - Coming soon cards:', comingSoonCards);
  console.log('JobAssignmentHub - Placeholder cards:', placeholderCards.length);
  console.log('JobAssignmentHub - Total cards:', functionalCards + comingSoonCards + placeholderCards.length);

  // Scheduling Form View
  if (currentView === 'scheduling') {
    return (
      <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
            Job Scheduling
          </Typography>
          <IconButton
            onClick={() => setCurrentView('main')}
            sx={{ color: 'yellow' }}
          >
            <Assignment />
          </IconButton>
        </Box>

        <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Schedule Jobs and Assign Drivers
            </Typography>
            
            <Box sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ color: 'white', textAlign: 'center' }}>
                🚧 Scheduling functionality coming soon! 
                <br />
                This will include job scheduling, driver assignment, and calendar management.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Chip 
                icon={<Schedule />} 
                label="Calendar View" 
                sx={{ bgcolor: 'info.main', color: 'white' }}
              />
              <Chip 
                icon={<Person />} 
                label="Driver Assignment" 
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
              <Chip 
                icon={<Timeline />} 
                label="Timeline" 
                sx={{ bgcolor: 'warning.main', color: 'white' }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Main Job Assignment Hub
  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Job Assignment Hub
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
        {/* Scheduling Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={() => setCurrentView('scheduling')}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Scheduling
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Planning and scheduling tools
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, flexGrow: 1, minHeight: '60px' }}>
                <Chip 
                  icon={<Timeline />} 
                  label="Daily Planner" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Map />} 
                  label="Route Planning" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<DirectionsCar />} 
                  label="Vehicle Planning" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Consignment Notes Card - Coming Soon */}
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
                  <Analytics />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Consignment notes and tracking
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

export default JobAssignmentHub;
