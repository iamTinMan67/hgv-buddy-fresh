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
  TrendingUp,
  Assessment,
  Receipt,
  Home,
  Person,
  Route,
  Map,
  Timeline,
  DirectionsCar,
  LocalShipping,
  ViewInAr,
  Edit,
  Description,
} from '@mui/icons-material';

import JobAllocationForm from './JobAllocationForm';
import PlanningHub from './PlanningHub';
import ReportsHub from './ReportsHub';

interface JobAssignmentHubProps {
  onClose: () => void;
}

const JobAssignmentHub: React.FC<JobAssignmentHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'jobAllocation' | 'planning' | 'reports'>('main');

  const handleNavigateToJobAllocation = () => setCurrentView('jobAllocation');
  const handleNavigateToPlanning = () => setCurrentView('planning');
  const handleNavigateToReports = () => setCurrentView('reports');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'jobAllocation') {
    return <JobAllocationForm onClose={handleBackToMain} />;
  }

  if (currentView === 'planning') {
    return <PlanningHub onClose={handleBackToMain} />;
  }

  if (currentView === 'reports') {
    return <ReportsHub onClose={handleBackToMain} />;
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
        {/* Job Allocation Card */}
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
            onClick={handleNavigateToJobAllocation}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Job Allocation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and manage job assignments
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Person />} 
                  label="Driver Assignment" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Route />} 
                  label="Route Planning" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<LocalShipping />} 
                  label="Cargo Details" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Consignment Notes Card */}
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
            onClick={handleNavigateToReports}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Notes />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Consignment Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery notes and instructions
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Description />} 
                  label="Delivery Notes" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Edit />} 
                  label="Instructions" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<ViewInAr />} 
                  label="Layout Details" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Scheduling Card */}
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
            onClick={handleNavigateToPlanning}
          >
            <CardContent>
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
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
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
      </Grid>
    </Box>
  );
};

export default JobAssignmentHub;
