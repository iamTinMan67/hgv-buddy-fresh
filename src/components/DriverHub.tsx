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
  Person,
  AttachMoney,
  Work,
  Timer,
  Payment,
  Analytics,
  Settings,
  Assignment,
  Home,
  Business,
  Schedule,
} from '@mui/icons-material';

import DriverManagement from './DriverManagement';
import StaffManagement from './StaffManagement';
import WageManagement from './WageManagement';
import HolidayPlanner from './HolidayPlanner';

interface DriverHubProps {
  onClose: () => void;
}

const DriverHub: React.FC<DriverHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'management' | 'staff' | 'wages' | 'holiday'>('main');

  const handleNavigateToManagement = () => setCurrentView('management');
  const handleNavigateToStaff = () => setCurrentView('staff');
  const handleNavigateToWages = () => setCurrentView('wages');
  const handleNavigateToHoliday = () => setCurrentView('holiday');
  const handleBackToMain = () => setCurrentView('main');

  if (currentView === 'management') {
    return <DriverManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'staff') {
    return <StaffManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'wages') {
    return <WageManagement onClose={handleBackToMain} />;
  }

  if (currentView === 'holiday') {
    return <HolidayPlanner onClose={handleBackToMain} />;
  }

  // Main Driver Hub
  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Staff Hub
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
        {/* Staff Management Card */}
        <Grid item xs={12} md={4}>
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
            onClick={handleNavigateToStaff}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Staff
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All staff employees
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, flexGrow: 1, minHeight: '60px' }}>
                <Chip 
                  icon={<Person />} 
                  label="Profiles" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Work />} 
                  label="Roles" 
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

        {/* Wages Card */}
        <Grid item xs={12} md={4}>
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
            onClick={handleNavigateToWages}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Wages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wage settings and bank details
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, flexGrow: 1, minHeight: '60px' }}>
                <Chip 
                  icon={<Payment />} 
                  label="Rates" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Timer />} 
                  label="Overtime" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Bank Details" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Holiday Planner Card */}
        <Grid item xs={12} md={4}>
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
            onClick={handleNavigateToHoliday}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Holiday Planner
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage holiday requests and schedules
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, flexGrow: 1, minHeight: '60px' }}>
                <Chip 
                  icon={<Schedule />} 
                  label="Requests" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assignment />} 
                  label="Approvals" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Conflicts" 
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

export default DriverHub;
