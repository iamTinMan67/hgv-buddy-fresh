import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,

} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  Logout,
  Person,
  Upload,
  Route,
  Schedule,
  Report,
  CheckCircle,
  ArrowBack,
  Assessment,
  AccountBalance,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import Timesheet from './Timesheet';
import VehicleCheckSheet from './VehicleCheckSheet';
import FleetManagementHub from './FleetManagementHub';
import PlanningHub from './PlanningHub';
import LegalHub from './LegalHub';
import DriverHub from './DriverHub';

import DriverDashboard from './DriverDashboard';
import ReportsHub from './ReportsHub';
import AccountingHub from './AccountingHub';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'driver' | 'management' | 'admin';
}

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [showVehicleCheck, setShowVehicleCheck] = useState(false);
  const [showFleetManagement, setShowFleetManagement] = useState(false);
  const [showLegalHub, setShowLegalHub] = useState(false);
  const [showDriverHub, setShowDriverHub] = useState(false);
  const [showPlanningHub, setShowPlanningHub] = useState(false);
  const [showReportsHub, setShowReportsHub] = useState(false);
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);


  const [showAccountingHub, setShowAccountingHub] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'primary';
      case 'management':
        return 'secondary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'driver':
        return <LocalShipping />;
      case 'management':
        return <Person />;
      case 'admin':
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // Show timesheet if requested
  if (showTimesheet) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowTimesheet(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <Timesheet onClose={() => setShowTimesheet(false)} />
      </Box>
    );
  }



  // Show vehicle check if requested
  if (showVehicleCheck) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowVehicleCheck(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <VehicleCheckSheet onClose={() => setShowVehicleCheck(false)} />
      </Box>
    );
  }

  // Show fleet management if requested
  if (showFleetManagement) {
    return (
      <Box sx={{ py: 2 }}>
        <FleetManagementHub onClose={() => setShowFleetManagement(false)} />
      </Box>
    );
  }

  // Show legal hub if requested
  if (showLegalHub) {
    return (
      <Box sx={{ py: 2 }}>
        <LegalHub onClose={() => setShowLegalHub(false)} />
      </Box>
    );
  }

  // Show driver hub if requested
  if (showDriverHub) {
    return (
      <Box sx={{ py: 2 }}>
        <DriverHub onClose={() => setShowDriverHub(false)} />
      </Box>
    );
  }

  // Show planning hub if requested
  if (showPlanningHub) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowPlanningHub(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <PlanningHub onClose={() => setShowPlanningHub(false)} />
      </Box>
    );
  }



  // Show reports hub if requested
  if (showReportsHub) {
    return (
      <Box sx={{ py: 2 }}>
        <ReportsHub onClose={() => setShowReportsHub(false)} />
      </Box>
    );
  }

  // Show accounting hub if requested
  if (showAccountingHub) {
    return (
      <Box sx={{ py: 2 }}>
        <AccountingHub onClose={() => setShowAccountingHub(false)} />
      </Box>
    );
  }

  // Show driver dashboard if requested
  if (showDriverDashboard) {
    return (
      <Box sx={{ py: 2 }}>
        <DriverDashboard onClose={() => setShowDriverDashboard(false)} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user.firstName}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getRoleIcon(user.role)}
            <Chip
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              color={getRoleColor(user.role) as any}
              size="small"
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {user.role === 'driver' ? (
          // Driver Dashboard - Complete Feature Set
          <>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Daily Vehicle Checks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Digital inspection forms
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowVehicleCheck(true)}
                  >
                    Start Check
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Job Assignment & Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time job updates
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => {/* Daily planner functionality removed */}}
                  >
                    View Jobs
                  </Button>
                </CardContent>
              </Card>
            </Grid>



            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Upload sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Invoice Upload</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Document management
                  </Typography>
                  <Button variant="contained" color="info" sx={{ mt: 2 }}>
                    Upload Invoice
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Route sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Route Planning</Typography>
                  <Typography variant="body2" color="text.secondary">
                    GPS navigation
                  </Typography>
                  <Button variant="contained" color="success" sx={{ mt: 2 }}>
                    Plan Route
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Daily Planner</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View your daily schedule
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => {/* Daily planner functionality removed */}}
                  >
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Driver Dashboard</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View jobs, hours & pay
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDriverDashboard(true)}
                  >
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6">Hours Logging</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Working time tracking
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowTimesheet(true)}
                  >
                    Log Hours
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Report sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6">Incident Reporting</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Safety incident management
                  </Typography>
                  <Button variant="contained" color="error" sx={{ mt: 2 }}>
                    Report Incident
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          // Management Dashboard
          <>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Fleet Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor all vehicles
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowFleetManagement(true)}
                  >
                    Fleet Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Staff Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage staff and wages
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDriverHub(true)}
                  >
                    Staff Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Legal Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Legal compliance and regulations
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowLegalHub(true)}
                  >
                    Legal Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>



            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Planning Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily planning, routes & job assignment
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowPlanningHub(true)}
                  >
                    Planning Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>



            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Reports Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wage slips, fuel, purchase orders & invoices
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowReportsHub(true)}
                  >
                    Reports Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Accounting</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books, Invoices, Purchase Orders & Print
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowAccountingHub(true)}
                  >
                    Accounting Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 